# TierRAG Localhost Setup Guide (MySQL & Database)

This guide explains exactly how to set up your local database for the TierRAG project on a Windows environment.

## 1. Install MySQL (If not already installed)

If you don't have MySQL installed, download the **MySQL Installer for Windows** from the official website:
[Download MySQL Community Server](https://dev.mysql.com/downloads/installer/)

When installing:
1. Choose **Server Only** or **Developer Default**.
2. During configuration, it will ask you to set a **Root Password**. 
   - **Important**: Remember this password. For local development, many developers use something simple like `password` or `root`.
3. Finish the installation. Make sure the MySQL server is started (usually starts automatically as a Windows Service).

## 2. Update the `.env` Configuration

The backend needs to know your MySQL credentials to connect.
I have created an environment variables file at `d:\TierRAG\backend\.env`.

Open `d:\TierRAG\backend\.env` and look at the `DATABASE_URL` line:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/tierrag
```

The format is:
`mysql+pymysql://[USER]:[PASSWORD]@localhost:3306/[DATABASE_NAME]`

- **[USER]**: This is usually `root`
- **[PASSWORD]**: This is the password you set during the MySQL installation. If your password is not `password`, you **must** change it here.
  - Example: If your root password is `MySecret123`, change the line to:
    `DATABASE_URL=mysql+pymysql://root:MySecret123@localhost:3306/tierrag`

## 3. Create the Database

Before running the application, the `tierrag` database must exist.

You have two ways to create it:

### Option A: Using the provided Python script (Easiest)
1. Open the file `d:\TierRAG\backend\create_db.py`.
2. On lines 5-6, update the `USER` and `PASSWORD` to match your MySQL credentials.
   ```python
   USER = "root"
   PASSWORD = "password" # Change this if your password is different
   ```
3. Open a terminal, navigate to `d:\TierRAG\backend`, and run:
   ```bash
   .\venv\Scripts\python create_db.py
   ```
   You should see `Database 'tierrag' created successfully.`

### Option B: Using MySQL Command Line or Workbench
If you prefer doing it manually:
1. Open **MySQL Workbench** or **MySQL Command Line Client**.
2. Log in with your `root` user and password.
3. Run this exact SQL command:
   ```sql
   CREATE DATABASE IF NOT EXISTS tierrag;
   ```

## 4. Seed the Database

Once the database is created, you need to create the database tables and default users.

Open a terminal in `d:\TierRAG\backend` and run:
```bash
.\venv\Scripts\python seed.py
```
*(Make sure your virtual environment is activated before running this command).*

This will read your `DATABASE_URL` from the `.env` file, connect to MySQL, create the tables (`users`, `cvs`, `audit_logs`), and create the default login accounts:
- `admin@example.com` (Password: `password123`)
- `tier1@example.com` (Password: `password123`)
- `tier2@example.com` (Password: `password123`)
- `tier3@example.com` (Password: `password123`)

## 5. You're Ready!
You can now start the FastAPI backend:
```bash
uvicorn app.main:app --reload
```
And start the React frontend:
```bash
cd ../frontend
npm run dev
```
