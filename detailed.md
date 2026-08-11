# Detailed Explanation of CV Management and RAG Features

This document provides a deep dive into the CV Management & Tiered Access and RAG Chat Assistant features of TierRAG. It explains the core concepts and points to exactly where these features are implemented within the codebase.

## 3. CV Management & Tiered Access

### 3.1 PDF Uploads
Users upload PDF versions of their CVs. The system validates the file type and size to ensure system integrity. 
**Where in code:**
- **Backend Route:** `backend/app/routes/cvs.py` (`POST /api/cvs/upload`)
- **Validation:** Enforces `.pdf` extension and checks file size against `settings.MAX_UPLOAD_SIZE_MB`.
- **Frontend UI:** `frontend/src/pages/CVLibrary.tsx` (Handles file selection and API call).

### 3.2 Auto-Tiering
Each uploaded CV is associated with a specific access tier (`TIER_1`, `TIER_2`, `TIER_3`).
- **Standard Users:** If a `TIER_3` user uploads a CV, it is automatically locked to `TIER_3`. The system explicitly ignores or overrides any frontend tier parameters to prevent privilege escalation.
- **Administrators:** Admins can explicitly choose which tier the CV belongs to during the upload process.
**Where in code:**
- **Backend Route:** `backend/app/routes/cvs.py` (`upload_cv` function) contains the logic mapping `current_user.role` to `assigned_tier`, specifically checking `if current_user.role == "ADMIN"`.
- **Database Model:** `backend/app/models/cv.py` stores this in the `tier` column.

### 3.3 Tier-Restricted Visibility
The system enforces a strict hierarchy (`ADMIN` > `TIER_1` > `TIER_2` > `TIER_3`). A user can only view CVs that are at or below their access level. For example, a `TIER_2` user can see `TIER_2` and `TIER_3` CVs, but not `TIER_1`.
**Where in code:**
- **Hierarchy Definition:** `backend/app/permissions/service.py` (`ROLE_HIERARCHY` dictionary maps roles to their accessible tiers).
- **List Filtering:** `backend/app/routes/cvs.py` (`GET /api/cvs`) uses `get_allowed_tiers(current_user.role)` to filter the SQLAlchemy query (`CV.tier.in_(allowed_tiers)`).
- **Single Access Check:** `backend/app/routes/cvs.py` (`GET /api/cvs/{cv_id}`) uses `can_access_tier()` to explicitly block direct unauthorized access.

### 3.4 Automated Ingestion
Once the PDF is saved to disk, it is asynchronously/immediately processed for the AI to understand. The PDF text is extracted, split into smaller chunks, and embedded into the vector database (ChromaDB) with metadata linking it to its tier and ID.
**Where in code:**
- **Trigger:** End of `backend/app/routes/cvs.py` (`upload_cv` function) calls `process_and_ingest_cv`.
- **Processing Logic:** `backend/app/rag/ingestion.py`
  - `extract_text_from_pdf()`: Uses PyMuPDF (`fitz`) to read the PDF.
  - `chunk_text()`: Splits the text into overlapping segments.
  - `process_and_ingest_cv()`: Adds the chunks to ChromaDB along with metadata (`cv_id`, `tier`, `filename`).

---

## 4. RAG Chat Assistant

### 4.1 Context-Strict Querying
To prevent the LLM from hallucinating or answering questions outside the scope of the CVs, it is prompted with a strict set of instructions ("system prompt") and provided *only* the relevant text from the vector database as context.
**Where in code:**
- **Prompt Definition:** `backend/app/routes/chat.py` defines `RAG_SYSTEM_PROMPT` containing rules like "You must ONLY answer questions based on the provided context."
- **LLM Integration:** `chat.py` (`POST /api/chat`) makes an HTTP POST request to the local Ollama instance (`settings.OLLAMA_URL/api/chat`) combining the system prompt, retrieved chunks, and the user's question.

### 4.2 Tier-Filtered Search
Before the LLM even sees any context, the semantic search against the vector database is filtered. The system retrieves the user's allowed tiers and instructs ChromaDB to only search within document chunks that match those tiers. This physically prevents unauthorized data from entering the LLM's context window.
**Where in code:**
- **Search Logic:** `backend/app/routes/chat.py` inside the `chat()` function.
- **ChromaDB Filter:** Uses the `where` clause: `collection.query(..., where={"tier": {"$in": allowed_tiers}})` ensuring vector similarity search is restricted by role.

### 4.3 Source Attribution
When the LLM answers, the user needs to know *which* CVs the answer came from. Since every text chunk in ChromaDB is stored with `filename` and `cv_id` metadata, the backend extracts the unique sources from the retrieved chunks and sends them back alongside the answer.
**Where in code:**
- **Extraction:** `backend/app/routes/chat.py` iterates over the `metadatas` returned by ChromaDB.
- **De-duplication:** It uses a `seen_cv_ids` set to ensure a CV is only listed once even if multiple chunks matched.
- **Response Formatting:** Returns a `ChatResponse` schema (`backend/app/schemas/chat.py`) that includes the `answer` string and a `sources` array.
- **Frontend UI:** `frontend/src/pages/AIChat.tsx` renders these sources as clickable badges below the chat bubbles.
