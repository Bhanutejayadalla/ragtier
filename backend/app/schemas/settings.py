from pydantic import BaseModel

class LLMSettingsBase(BaseModel):
    provider: str
    ollama_model: str
    openai_model: str
    gemini_model: str

class LLMSettingsUpdate(LLMSettingsBase):
    pass

class LLMSettingsResponse(LLMSettingsBase):
    id: int

    class Config:
        from_attributes = True
