from pydantic import BaseModel
from typing import List

class Source(BaseModel):
    cv_id: int
    filename: str

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]
