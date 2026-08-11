from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/tierrag"
    JWT_SECRET: str = "change-me-in-production"
    JWT_EXPIRE_MINUTES: int = 60
    
    OLLAMA_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "qwen3:8b"
    
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    UPLOAD_DIR: str = "./uploads"
    CHROMA_DIR: str = "./chroma_data"
    
    MAX_UPLOAD_SIZE_MB: int = 10
    
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
