from sqlalchemy import Column, Integer, String
from app.database.base import Base

class Tier(Base):
    __tablename__ = "tiers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    level = Column(Integer, nullable=False)
