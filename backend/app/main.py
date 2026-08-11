from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import engine
from app.database.base import Base
from app.routes import auth, admin, cvs, chat, system, tiers, settings as settings_router
import uvicorn
import os

# Import all models to ensure they are registered before create_all
import app.models.user
import app.models.cv
import app.models.audit
import app.models.tier
import app.models.chat
from app.models.settings import LLMSettings

# Create tables
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="TierRAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(tiers.router)
app.include_router(cvs.router)
app.include_router(chat.router)
app.include_router(system.router)
app.include_router(settings_router.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
    

    

