from sqlalchemy import Column, Integer, String, DateTime, func, JSON, ForeignKey
from app.database.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # System actions might not have user_id
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=True)
    target_id = Column(String(100), nullable=True)
    metadata_info = Column(JSON, nullable=True) # renamed from metadata to avoid conflict with SQLAlchemy
    created_at = Column(DateTime(timezone=True), server_default=func.now())
