# Database Architecture

## Overview
The application utilizes a dual-database architecture, ensuring that structured metadata is managed efficiently while unstructured text data is optimized for semantic search and Retrieval-Augmented Generation (RAG).
1. **Relational Database (MySQL):** Manages structured data like users, dynamic tiers, uploaded CV metadata, chat history, and audit logs.
2. **Vector Database (ChromaDB):** Stores document embeddings for the RAG engine to enable semantic search across CVs.

---

## 1. Relational Schema (MySQL)

### `tiers` Table
Stores the dynamic access tiers managed by the administrators.
- `id` (Integer, Primary Key, Indexed)
- `name` (String 50, Unique, Indexed): e.g., `TIER_1`, `EXEC_TIER`
- `level` (Integer): Defines the hierarchy level (lower number = higher privilege).

### `users` Table
Stores user accounts and their roles.
- `id` (Integer, Primary Key, Indexed)
- `name` (String 255)
- `email` (String 255, Unique, Indexed)
- `password_hash` (String 255)
- `role` (String 50): Foreign key representation of the access level (maps to `tiers.name`, or `ADMIN`)
- `is_active` (Boolean, Default True)
- `created_by` (Integer, Nullable): References the admin user who created this account
- `created_at` (DateTime, Default Now)
- `updated_at` (DateTime, On Update Now)

### `cvs` Table
Tracks uploaded CV documents and their tier access level. **This table acts as the source of truth for CV ownership and permissions.**
- `id` (Integer, Primary Key, Indexed)
- `filename` (String 255, Unique): UUID-based internal filename
- `original_filename` (String 255): Original uploaded file name
- `uploaded_by` (Integer, Foreign Key to `users.id`, Nullable, `ON DELETE SET NULL`): If a user is deleted, their CVs remain safely stored in the system.
- `tier` (String 50): Access level assigned at the time of upload (maps to `tiers.name`)
- `file_path` (String 512): Path to the saved PDF file
- `file_size` (Integer)
- `created_at` (DateTime, Default Now)
- `updated_at` (DateTime, On Update Now)

### `chat_sessions` & `chat_messages` Tables
Stores optional chat history for users.
- **`chat_sessions`:** 
  - `id` (PK)
  - `user_id` (FK to `users.id`, `ON DELETE CASCADE`): Deleting a user permanently clears their private chat history.
  - `title` (String 255)
  - `created_at` (DateTime)
- **`chat_messages`:**
  - `id` (PK)
  - `session_id` (FK to `chat_sessions.id`)
  - `role` (String 50): `user` or `ai`
  - `content` (String): The query or response
  - `sources` (JSON, Nullable): Retains source attributions for AI responses
  - `created_at` (DateTime)

### `audit_logs` Table
Maintains an immutable record of system actions for accountability and security.
- `id` (Integer, Primary Key, Indexed)
- `user_id` (Integer, Foreign Key to `users.id`, Nullable)
- `action` (String 100): e.g., USER_CREATED, TIER_DELETED, CV_UPLOADED, CHAT_QUERY
- `target_type` (String 50, Nullable): e.g., USER, TIER, CV, QUERY
- `target_id` (String 100, Nullable)
- `metadata_info` (JSON, Nullable): Additional contextual data about the action
- `created_at` (DateTime, Default Now)

---

## 2. Vector Database (ChromaDB)
Used to store high-dimensional vector embeddings generated from the uploaded PDF CVs. This database does not understand relational joins; instead, it relies heavily on metadata filtering to enforce security.

**Collection Structure:**
- **Documents:** The actual text strings (chunks) extracted from the PDFs.
- **Embeddings:** The numerical representation of the text chunks (generated automatically by ChromaDB or a specified embedding model).
- **Metadata:** A dictionary of attributes attached to *every single chunk*.
  - `cv_id`: Maps back to the MySQL `cvs.id`.
  - `filename`: Original file name for source attribution in the chat interface.
  - `tier`: The exact access tier associated with this CV. **This is crucial for security.**
- **IDs:** Unique UUIDs for every chunk.

---

## 3. How Tiered CVs are Divided and Stored

When a CV is uploaded to the system, it is divided and stored across three distinct locations to ensure both performance and strict tier-based security:

1. **File System Storage:** 
   The raw PDF is saved to disk in a directory structure grouped by tier (e.g., `uploads/tier_1/{uuid}.pdf`).
2. **MySQL Record (Metadata Registration):** 
   A row is inserted into the `cvs` table. This locks in who uploaded it, where the file lives, and—most importantly—its `tier` designation.
3. **ChromaDB Ingestion (Vector Storage):** 
   - The PDF is read and split into overlapping text chunks (e.g., 500 characters each).
   - **Crucial Step:** As these chunks are inserted into ChromaDB, the `tier` assigned in MySQL is duplicated into the metadata of *every single chunk*. 
   - This means if a 10-page CV generates 50 chunks, all 50 chunks in the vector database are permanently stamped with `tier: <dynamic_tier_name>`.

---

## 4. How RAG Accesses the Tiered Data

The Retrieval-Augmented Generation (RAG) system enforces security strictly at the database retrieval level, ensuring the AI model never even "sees" CVs the user isn't allowed to access.

Here is the exact flow when a user asks a question in the chat:

1. **Identity & Permission Resolution:**
   The backend identifies the user making the query and queries the `tiers` database to determine their exact hierarchy level. It then calculates their `allowed_tiers` list by pulling all tiers with a level greater than or equal to their own.

2. **Pre-Filtered Vector Search:**
   The user's query is converted into an embedding and sent to ChromaDB. However, instead of searching the entire database, the backend applies a strict **where clause** based on the user's dynamically computed permissions:
   ```python
   results = collection.query(
       query_texts=["How many years of Python experience does John have?"],
       n_results=5,
       where={"tier": {"$in": allowed_tiers}} # Enforces RBAC at the vector level
   )
   ```
   ChromaDB will *only* return chunks whose metadata `tier` matches one of the `allowed_tiers`.

3. **Context Injection:**
   The retrieved chunks (which are now guaranteed to be from authorized CVs) are formatted into a large context string.

4. **LLM Generation & Source Attribution:**
   The context string is sent to the LLM (Ollama) along with a strict system prompt instructing it to *only* answer based on the provided context. When the LLM responds, the backend also extracts the `filename` metadata from the retrieved chunks to provide accurate source attribution to the user.
