# Working & Features

## Overview
TierRAG is a secure, role-based, Retrieval-Augmented Generation (RAG) system for interrogating CVs. It allows tiered access to resumes and utilizes an LLM to answer questions strictly based on the provided documents.

## Core Features

### 1. Authentication & Security
- **JWT-based Authentication:** Secure login system issuing access tokens.
- **Role-Based Access Control (RBAC):** Access levels are fully dynamic and managed by the admin via numeric hierarchy levels.
- **Password Management:** Users can securely change their passwords.

### 2. User & Tier Management (Admin Only)
- **Dynamic Tier Management:** Admins can create and delete limitless custom tiers (e.g., `TIER_1`, `EXEC_TIER`). Deleting a tier is safely blocked if users or CVs are assigned to it.
- **User Creation & Deletion:** Admins can create new users, assign them to dynamic tiers, and delete users from the system entirely. When a user is deleted, their uploaded CVs safely remain in the system (orphaned), while their personal chat history is permanently removed.
- **User Listing:** View all users in the system and effortlessly change their tier via dropdown menus.
- **Status Toggling:** Admins can activate or deactivate user accounts to revoke access temporarily.

### 3. CV Management & Tiered Access
- **PDF Uploads:** Users can upload PDF CVs (subject to a file size limit).
- **Auto-Tiering:** 
  - Non-admin users automatically upload CVs into their assigned dynamic tier.
  - Admins can explicitly choose the tier for an uploaded CV from the available dynamic tiers.
- **Tier-Restricted Visibility:** Users can only view and access CVs up to their allowed tier level (derived by the database: lower level number = higher privilege).
- **Automated Ingestion:** Upon upload, CVs are automatically parsed, embedded, and ingested into the vector database.

### 4. RAG Chat Assistant
- **Context-Strict Querying:** Users can ask questions about the CVs in the system. The LLM is instructed to *only* answer based on the CV data, preventing hallucination.
- **Tier-Filtered Search:** Vector database queries are pre-filtered based on the user's dynamic tier, ensuring they cannot retrieve information from CVs they aren't permitted to see.
- **Source Attribution:** Chat responses include the original filenames of the CVs used to generate the answer.
- **Chat History:** Users can optionally toggle "Save Chat History" to persist their questions and answers (including source attribution) and review past chat sessions via a dedicated sidebar.

### 5. Audit & Compliance
- **Comprehensive Logging:** Key actions are logged in the database:
  - `USER_CREATED`, `USER_DELETED`, `USER_TIER_CHANGED`, `USER_STATUS_CHANGED`
  - `TIER_CREATED`, `TIER_DELETED`
  - `CV_UPLOADED`
  - `CHAT_QUERY` (logs the question asked and number of sources retrieved)
- Ensures accountability for administrative changes and queries made against sensitive CV data.

### 6. System Diagnostics
- **Status Dashboard:** Endpoint to check the health of critical backend services:
  - MySQL database connection.
  - ChromaDB vector store connection.
  - Ollama LLM service and model availability.

## System Workflow
1. **Ingestion:** A PDF CV is uploaded -> saved to disk -> text extracted (PyMuPDF) -> embedded -> stored in ChromaDB with tier metadata.
2. **Querying:** User submits a question -> ChromaDB is queried (filtered by user's tier permissions) to find relevant CV chunks -> chunks are sent as context to Ollama LLM -> LLM generates an answer strictly based on the context, which can optionally be persisted to the database.
