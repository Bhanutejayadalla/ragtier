from fastapi import APIRouter
from app.config import settings
from sqlalchemy import create_engine
import httpx

router = APIRouter(prefix="/api/system", tags=["system"])

@router.get("/status")
async def system_status():
    status = {
        "mysql": "unknown",
        "chromadb": "unknown",
        "ollama": "unknown"
    }
    
    # Check MySQL
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect():
            status["mysql"] = "connected"
    except Exception as e:
        status["mysql"] = f"error: {str(e)}"
        
    # Check Ollama
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                models = [model["name"] for model in response.json().get("models", [])]
                if settings.OLLAMA_MODEL in models or f"{settings.OLLAMA_MODEL}:latest" in models:
                    status["ollama"] = f"connected ({settings.OLLAMA_MODEL} ready)"
                else:
                    status["ollama"] = f"connected but model {settings.OLLAMA_MODEL} not found"
            else:
                status["ollama"] = f"error: {response.status_code}"
    except Exception as e:
        status["ollama"] = f"error: {str(e)}"
        
    # Check ChromaDB
    try:
        import chromadb
        client = chromadb.PersistentClient(path=settings.CHROMA_DIR)
        client.heartbeat()
        status["chromadb"] = "connected"
    except Exception as e:
        status["chromadb"] = f"error: {str(e)}"
        
    return status
