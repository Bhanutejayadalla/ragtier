from typing import List
from sqlalchemy.orm import Session
from app.models.tier import Tier

def get_allowed_tiers(role: str, db: Session) -> List[str]:
    """
    Returns the list of tiers the given role is allowed to access.
    """
    if role == "ADMIN":
        tiers = db.query(Tier).all()
        return [t.name for t in tiers]
        
    user_tier = db.query(Tier).filter(Tier.name == role).first()
    if not user_tier:
        return []
        
    allowed_tiers = db.query(Tier).filter(Tier.level >= user_tier.level).all()
    return [t.name for t in allowed_tiers]

def can_access_tier(user_role: str, target_tier: str, db: Session) -> bool:
    """
    Checks if a user role can access a specific target tier.
    """
    allowed_tiers = get_allowed_tiers(user_role, db)
    return target_tier in allowed_tiers
