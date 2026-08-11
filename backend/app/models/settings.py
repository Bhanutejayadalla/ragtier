from sqlalchemy import Column, Integer, String
from app.database.base import Base

class LLMSettings(Base):
    __tablename__ = "llm_settings"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String(50), nullable=False, default="ollama") # 'ollama', 'openai', 'gemini'
    ollama_model = Column(String(100), nullable=False, default="qwen3:8b")
    openai_model = Column(String(100), nullable=False, default="gpt-4o-mini")
    gemini_model = Column(String(100), nullable=False, default="gemini-1.5-flash")
