from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # ADMIN, TIER_1, TIER_2, TIER_3
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, nullable=True) # ID of admin who created
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
