# Working & Features

## Overview
TierRAG is a secure, role-based, Retrieval-Augmented Generation (RAG) system for interrogating CVs. It allows tiered access to resumes and utilizes an LLM to answer questions strictly based on the provided documents.

## Core Features

### 1. Authentication & Security
- **JWT-based Authentication:** Secure login system issuing access tokens.
- **Role-Based Access Control (RBAC):** Users are assigned specific tiers (`ADMIN`, `TIER_1`, `TIER_2`, `TIER_3`).
- **Password Management:** Users can securely change their passwords.

### 2. User Management (Admin Only)
- **User Creation:** Admins can create new users and assign their initial tier/role.
- **User Listing:** View all users in the system.
- **Tier Management:** Admins can promote or demote users by changing their tier.
- **Status Toggling:** Admins can activate or deactivate user accounts to revoke access.

### 3. CV Management & Tiered Access
- **PDF Uploads:** Users can upload PDF CVs (subject to a file size limit).
- **Auto-Tiering:** 
  - Non-admin users automatically upload CVs into their assigned tier.
  - Admins can explicitly choose the tier for an uploaded CV.
- **Tier-Restricted Visibility:** Users can only view and access CVs up to their allowed tier level (e.g., a Tier 3 user cannot access Tier 1 CVs).
- **Automated Ingestion:** Upon upload, CVs are automatically parsed, embedded, and ingested into the vector database.

### 4. RAG Chat Assistant
- **Context-Strict Querying:** Users can ask questions about the CVs in the system. The LLM is instructed to *only* answer based on the CV data, preventing hallucination.
- **Tier-Filtered Search:** Vector database queries are pre-filtered based on the user's tier, ensuring they cannot retrieve information from CVs they aren't permitted to see.
- **Source Attribution:** Chat responses include the original filenames of the CVs used to generate the answer.

### 5. Audit & Compliance
- **Comprehensive Logging:** Key actions are logged in the database:
  - `USER_CREATED`, `USER_TIER_CHANGED`, `USER_STATUS_CHANGED`
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
2. **Querying:** User submits a question -> ChromaDB is queried (filtered by user's tier) to find relevant CV chunks -> chunks are sent as context to Ollama LLM -> LLM generates an answer strictly based on the context.
