from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_action(db: Session, action: str, user_id: int = None, target_type: str = None, target_id: str = None, metadata_info: dict = None):
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        metadata_info=metadata_info
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    return audit_log
