# 🛡️ TierRAG

**Secure, Role-Based CV Intelligence Platform**

*Have you ever wanted to query a massive database of CVs, but needed to ensure that users only get answers based on the resumes they are explicitly authorized to see?*

**TierRAG** solves the enterprise challenge of **secure data access in Generative AI**. By implementing strict Role-Based Access Control (RBAC) at both the application and the vector database levels, TierRAG ensures that the AI only ever "knows" what the user is allowed to know.

---

## 🚀 The Problem & Our Solution
In a standard RAG (Retrieval-Augmented Generation) pipeline, an LLM queries a vector database and synthesizes an answer. But what happens when the database contains highly sensitive Tier 1 executive CVs mixed with Tier 3 intern applications?

**TierRAG** intercepts the vector search *before* it reaches the LLM. It verifies the user's tier, strictly filters the ChromaDB vector search using metadata constraints, and only feeds authorized text chunks to the LLM (Ollama). 

**Result**:  100% secure semantic search.

---

## ✨ Key Features
- **Dynamic Role-Based Access Control**: Admins can create custom, hierarchical access tiers mapping to numeric hierarchy levels (e.g., `TIER_1`, `EXEC_TIER`). Users can only access CVs at or below their assigned tier's privilege level.
- **Multi-Provider AI Brain**: Seamlessly switch between local open-source models (Ollama) and cloud APIs (OpenAI, Gemini) directly from the Admin UI.
- **User & Tier Management**: Full admin capabilities to create, edit, and delete users and tiers, with robust protections against deleting tiers that are actively in use.
- **Permission-Aware RAG**: Chat with candidate CVs safely without exposing unauthorized information.
- **Chat History Management**: Users can optionally save their chat history, enabling them to review past sessions and source attributions.
- **Automated Ingestion Pipeline**: Upload a PDF, and the system automatically extracts text, chunks it, embeds it, and securely tags it in the vector DB.
- **Source Attribution**: The AI doesn't just give answers; it provides the exact CV filenames used as sources to ensure verifiability.
- **Immutable Audit Logging**: Every upload, tier change, deletion, and chat query is recorded for compliance.
- **Modern UI**: A sleek, responsive dashboard built with React and Tailwind CSS.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Python, FastAPI, SQLAlchemy
- **Relational Database**: MySQL (Stores users, dynamic tiers, CV metadata, chat history, and audit logs)
- **Vector Database**: ChromaDB (Stores chunked CV text, embeddings, and security metadata)
- **AI Engine**: Ollama (Running locally for maximum privacy, e.g., Llama 3)
- **Document Processing**: PyMuPDF (`fitz`) for PDF text extraction

---

## 🛠️ Quick Start & Local Setup

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **MySQL Server** running locally.
- **Ollama** installed and running locally with a model pulled (e.g., `ollama run llama3.1`).

### 2. Configuration (.env)
1. Create a MySQL database named `tierrag` (You can run `python backend/create_db.py` to automate this).
2. Ensure your `backend/app/config.py` or `backend/.env` reflects your local MySQL credentials.
3. If you plan to use OpenAI or Gemini, add your API keys to the `.env` file:
   ```env
   OPENAI_API_KEY="sk-..."
   GEMINI_API_KEY="..."
   ```

### 3. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\Activate.ps1
# On Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt

# Seed the database with default dynamic tiers and roles
python seed.py  

# Run the server
uvicorn app.main:app --reload
```
*The API will be available at `http://localhost:8000`.*

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The web interface will be available at `http://localhost:5173`.*

---

## 🔐 Default Credentials
Use these pre-configured accounts to test the tier-restricted AI capabilities:
- **Admin Account**: `admin@example.com` / `password123` (Full access, can manage dynamic tiers and users)
- **Tier 1 Account**: `tier1@example.com` / `password123` (High access)
- **Tier 2 Account**: `tier2@example.com` / `password123` (Medium access)
- **Tier 3 Account**: `tier3@example.com` / `password123` (Base access)

*(Users can securely change their passwords via the dashboard once logged in).*

---

## 🛡️ Security Mechanisms Deep Dive
- **Dynamic Tier Calculation**: The backend dynamically fetches a user's tier level and calculates their `allowed_tiers` list to ensure they only see authorized CVs.
- **Vector Pre-Filtering**: The RAG chunk retrieval utilizes ChromaDB's `$in` metadata filter against the user's computed `allowed_tiers`. Unauthorized chunks never physically enter the LLM's context window.
- **Path Traversal Protection**: Uploaded filenames are sanitized and stored securely as UUIDs on disk.
- **Accountability**: Audit logs track sensitive actions (promotions, tier management, uploads, AI queries) natively in MySQL.

---

## 🌐 Pushing to GitHub
If you have initialized a local Git repository, follow these steps to push your project:

1. **Initialize & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. **Link to GitHub**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git branch -M main
   git push -u origin main
   ```

---

## 🔮 What's Next / Roadmap
- **Cloud Integration**: Support for AWS S3 / Azure Blob Storage for CV PDF persistence.
- **Advanced OCR**: Support for scanned image-based CVs using Tesseract.
- **Batch Processing**: Upload and auto-tier entire ZIP files of resumes at once.

*Built for secure, enterprise-grade AI integration.*
