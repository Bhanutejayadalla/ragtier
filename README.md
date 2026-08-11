# TierRAG

Secure Role-Based CV Intelligence Platform.

## Features
- **Strict Role-Based Access Control**: `ADMIN`, `TIER_1`, `TIER_2`, `TIER_3`.
- **Permission-Aware RAG**: Chat with candidate CVs safely without exposing unauthorized information to the LLM.
- **Secure File Storage**: Logical separation of CVs on the filesystem and strict DB-level tier checking.
- **Modern Dashboard**: React, Tailwind CSS, Vite.

## Architecture
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + MySQL
- **AI Engine**: ChromaDB + Sentence-Transformers + Ollama

## Quick Start
1. Create a MySQL database named `tierrag`.
2. Update `backend/.env` with your DB credentials.
3. Install backend deps and run:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python seed.py
   uvicorn app.main:app --reload
   ```
4. Run frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Ensure Ollama is running on port `11434` with model `llama3.1`.
6. Log in to the application.

### Default Credentials
- **Admin**: `admin@example.com` / `password123`
- **Tier 1**: `tier1@example.com` / `password123`
- **Tier 2**: `tier2@example.com` / `password123`
- **Tier 3**: `tier3@example.com` / `password123`

## Security Mechanisms
- **Dynamic Tier Calculation**: `can_access_tier` ensures users only see authorized CVs.
- **Pre-Filtering**: RAG chunk retrieval uses ChromaDB `$in` filter with `allowed_tiers`. Unauthorized chunks never enter the context.
- **Path Traversal Protection**: Filenames are stored as UUIDs.
- **Audit Logs**: All sensitive actions (promotions, uploads) are tracked.

## Pushing to GitHub

If you have initialized a local Git repository, follow these steps to push your project to a new repository on GitHub:

1. **Initialize Git (if not already done)**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a new repository on GitHub**:
   Go to [GitHub](https://github.com/new) and create a new, empty repository (do not add a README, license, or `.gitignore`).

3. **Link your local repository to GitHub**:
   ```bash
   # Replace <your-username> and <your-repo> with your actual details
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   ```

4. **Push your code**:
   ```bash
   git branch -M main
   git push -u origin main
   ```
