from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.user import UserCreate, UserResponse, UserPromoteDemote
from app.models.user import User
from app.auth.password import get_password_hash
from app.auth.dependencies import require_admin
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.initial_password)
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        created_by=current_user.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    log_action(db, "USER_CREATED", current_user.id, "USER", str(new_user.id), {"role": user.role})
    
    return new_user

@router.get("/users", response_model=List[UserResponse])
def get_users(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/users/{user_id}/tier", response_model=UserResponse)
def update_user_tier(user_id: int, update: UserPromoteDemote, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_role = user.role
    user.role = update.tier
    db.commit()
    db.refresh(user)
    
    log_action(db, "USER_TIER_CHANGED", current_user.id, "USER", str(user.id), {"old_role": old_role, "new_role": user.role})
    
    return user

@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(user_id: int, is_active: bool, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    
    log_action(db, "USER_STATUS_CHANGED", current_user.id, "USER", str(user.id), {"is_active": is_active})
    
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    try:
        db.delete(user)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete user due to a database constraint.")
        
    log_action(db, "USER_DELETED", current_user.id, "USER", str(user_id), {"email": user.email})
    return None
