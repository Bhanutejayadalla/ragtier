from pydantic import BaseModel

class TierBase(BaseModel):
    name: str
    level: int

class TierCreate(TierBase):
    pass

class TierResponse(TierBase):
    id: int

    class Config:
        from_attributes = True
