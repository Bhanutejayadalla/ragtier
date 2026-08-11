import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.cv import CV
from app.schemas.cv import CVResponse
from app.config import settings
from app.permissions.service import get_allowed_tiers, can_access_tier
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/cvs", tags=["cvs"])

# This function will be properly implemented later when we hook up PyMuPDF and ChromaDB
def process_cv_pipeline(cv_id: int, file_path: str, tier: str, filename: str):
    pass

@router.post("/upload", response_model=CVResponse)
async def upload_cv(
    file: UploadFile = File(...),
    tier: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Tier logic
    assigned_tier = current_user.role
    if current_user.role == "ADMIN":
        if not tier:
            raise HTTPException(status_code=400, detail="Admin must specify a tier")
        if tier not in ["TIER_1", "TIER_2", "TIER_3"]:
            raise HTTPException(status_code=400, detail="Invalid tier")
        assigned_tier = tier
    else:
        # User uploads for their own tier
        if tier and tier != current_user.role:
             # Just ignore user's provided tier and enforce theirs, or raise error. 
             # Prompt says "A Tier 3 user must never be able to upload a Tier 1 CV."
             if not can_access_tier(current_user.role, tier):
                 raise HTTPException(status_code=403, detail="You do not have permission to upload to this tier.")
             assigned_tier = tier # they can upload to their allowed tiers? Wait, prompt says: 
             # "When a user uploads: ... Assign CV tier automatically ... The frontend must NOT send the tier."
             # But if they send it maliciously, we ignore it and use their role, OR we just use their role.
             pass
        assigned_tier = current_user.role

    # Create dir
    tier_dir = os.path.join(settings.UPLOAD_DIR, assigned_tier.lower())
    os.makedirs(tier_dir, exist_ok=True)
    
    file_ext = ".pdf"
    stored_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(tier_dir, stored_filename)
    
    # Read file contents and save
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
         raise HTTPException(status_code=400, detail=f"File size exceeds limit of {settings.MAX_UPLOAD_SIZE_MB}MB")

    with open(file_path, "wb") as f:
        f.write(contents)
        
    cv = CV(
        filename=stored_filename,
        original_filename=file.filename,
        uploaded_by=current_user.id,
        tier=assigned_tier,
        file_path=file_path,
        file_size=file_size
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)
    
    log_action(db, "CV_UPLOADED", current_user.id, "CV", str(cv.id), {"tier": assigned_tier})
    
    from app.rag.ingestion import process_and_ingest_cv
    process_and_ingest_cv(cv.id, file_path, assigned_tier, file.filename)
    
    return cv

@router.get("", response_model=List[CVResponse])
def get_cvs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    allowed_tiers = get_allowed_tiers(current_user.role)
    cvs = db.query(CV).filter(CV.tier.in_(allowed_tiers)).all()
    return cvs

@router.get("/{cv_id}", response_model=CVResponse)
def get_cv(cv_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cv = db.query(CV).filter(CV.id == cv_id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
        
    if not can_access_tier(current_user.role, cv.tier):
        raise HTTPException(status_code=403, detail="You do not have permission to access this CV.")
        
    return cv
