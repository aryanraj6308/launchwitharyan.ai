from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db, Lead
from app.schemas import LeadCreate, LeadResponse

router = APIRouter(prefix="/api/contact", tags=["Contact"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/leads", response_model=LeadResponse, status_code=201)
@limiter.limit("5/minute")
async def submit_lead(
    request: Request,
    lead_data: LeadCreate,
    db: Session = Depends(get_db),
):
    """Submit a new client lead/consultation request."""
    new_lead = Lead(
        name=lead_data.name,
        email=lead_data.email,
        company=lead_data.company,
        service=lead_data.service,
        message=lead_data.message,
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead
