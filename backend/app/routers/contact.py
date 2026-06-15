import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db, Lead, Conversation, Message
from app.schemas import LeadCreate, LeadResponse
from app.lead_qualifier import score_conversation

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

    # Also create a Conversation record for the admin dashboard
    session_id = f"contact-{uuid.uuid4().hex[:12]}"
    conv = Conversation(
        session_id=session_id,
        visitor_name=lead_data.name,
        visitor_email=lead_data.email,
        business_type=lead_data.company,
        requirements=lead_data.message,
        source_page=request.headers.get("referer", ""),
        ip_address=request.client.host if request.client else None,
    )
    db.add(conv)
    db.commit()

    # Save initial message
    msg = Message(conversation_id=conv.id, sender="user", text=lead_data.message or "Contact form submission", message_type="text")
    db.add(msg)
    db.commit()

    # Score the lead
    if lead_data.message:
        scoring = score_conversation(lead_data.message)
        conv.lead_score = scoring["score"]
        conv.lead_status = scoring["lead_status"]
        db.commit()

    return new_lead
