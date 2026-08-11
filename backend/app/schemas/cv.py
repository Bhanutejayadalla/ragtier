from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CVBase(BaseModel):
    filename: str
    original_filename: str
    tier: str
    file_size: int

class CVResponse(CVBase):
    id: int
    uploaded_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
