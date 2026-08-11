from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Source(BaseModel):
    cv_id: int
    filename: str

class ChatRequest(BaseModel):
    query: str
    save_history: bool = False
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]
    session_id: Optional[int] = None

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    sources: Optional[List[Source]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: int
    title: Optional[str]
    created_at: datetime
    messages: Optional[List[ChatMessageResponse]] = None

    class Config:
        from_attributes = True
