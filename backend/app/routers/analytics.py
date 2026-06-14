import json
import logging

from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.database import get_db, AnalyticsEvent as AnalyticsEventModel
from app.schemas import AnalyticsEvent

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)


@router.post("/track", status_code=202)
@limiter.limit("60/minute")
async def track_event(
    request: Request,
    event: AnalyticsEvent,
    db: Session = Depends(get_db),
):
    """Track a client-side analytics event."""
    try:
        new_event = AnalyticsEventModel(
            event_type=event.event_type,
            page=event.page,
            user_id=event.user_id,
            event_metadata=json.dumps(event.metadata) if event.metadata else None,
        )
        db.add(new_event)
        db.commit()
        logger.info(f"Tracked event: {event.event_type} on {event.page}")
    except Exception as e:
        logger.error(f"Analytics tracking failed: {e}")
        # Don't raise — analytics should never break UX
    return {"status": "accepted"}
