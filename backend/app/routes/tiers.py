from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.auth.dependencies import require_admin
from app.models.user import User
from app.models.cv import CV
from app.models.tier import Tier
from app.schemas.tier import TierCreate, TierResponse
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/admin/tiers", tags=["tiers"])

@router.get("", response_model=List[TierResponse])
def get_tiers(db: Session = Depends(get_db)):
    # Any authenticated user could potentially view tiers if needed for UI, 
    # but for now let's keep it open to all (or require login).
    # Since it's in /api/admin, maybe we require admin?
    # Actually, Users.tsx and CVLibrary.tsx need this. So maybe not require_admin for GET.
    # Let's remove the admin dependency for GET so normal users can see tier list for the CV upload dropdown.
    tiers = db.query(Tier).order_by(Tier.level.asc()).all()
    return tiers

@router.post("", response_model=TierResponse)
def create_tier(tier: TierCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_tier = db.query(Tier).filter(Tier.name == tier.name).first()
    if db_tier:
        raise HTTPException(status_code=400, detail="Tier with this name already exists")
    
    new_tier = Tier(name=tier.name, level=tier.level)
    db.add(new_tier)
    db.commit()
    db.refresh(new_tier)
    
    log_action(db, "TIER_CREATED", current_user.id, "TIER", str(new_tier.id), {"name": new_tier.name, "level": new_tier.level})
    return new_tier

@router.delete("/{tier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tier(tier_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    tier = db.query(Tier).filter(Tier.id == tier_id).first()
    if not tier:
        raise HTTPException(status_code=404, detail="Tier not found")
        
    # Check if any users belong to this tier
    users_count = db.query(User).filter(User.role == tier.name).count()
    if users_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete tier: Users are assigned to this tier")
        
    # Check if any CVs belong to this tier
    cvs_count = db.query(CV).filter(CV.tier == tier.name).count()
    if cvs_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete tier: CVs are assigned to this tier")
        
    db.delete(tier)
    db.commit()
    
    log_action(db, "TIER_DELETED", current_user.id, "TIER", str(tier_id), {"name": tier.name})
    return None
