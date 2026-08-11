from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.auth.dependencies import require_admin
from app.models.settings import LLMSettings
from app.schemas.settings import LLMSettingsResponse, LLMSettingsUpdate
from app.config import settings
import httpx

router = APIRouter(prefix="/api/admin/llm-settings", tags=["llm-settings"])

@router.get("", response_model=LLMSettingsResponse)
def get_settings(db: Session = Depends(get_db), current_user = Depends(require_admin)):
    llm_settings = db.query(LLMSettings).first()
    if not llm_settings:
        llm_settings = LLMSettings()
        db.add(llm_settings)
        db.commit()
        db.refresh(llm_settings)
    return llm_settings

@router.put("", response_model=LLMSettingsResponse)
def update_settings(update: LLMSettingsUpdate, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    llm_settings = db.query(LLMSettings).first()
    if not llm_settings:
        llm_settings = LLMSettings()
        db.add(llm_settings)
    
    llm_settings.provider = update.provider
    llm_settings.ollama_model = update.ollama_model
    llm_settings.openai_model = update.openai_model
    llm_settings.gemini_model = update.gemini_model
    
    db.commit()
    db.refresh(llm_settings)
    return llm_settings

@router.get("/ollama-models")
async def get_ollama_models(current_user = Depends(require_admin)):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            response.raise_for_status()
            data = response.json()
            models = [model.get("name") for model in data.get("models", [])]
            return {"models": models}
    except Exception as e:
        return {"models": [], "error": str(e)}
