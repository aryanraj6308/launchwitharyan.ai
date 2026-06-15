import json
import logging
import httpx
from typing import Optional

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas import ChatRequest, ChatResponse

logger = logging.getLogger("aryanforge.flowise")

router = APIRouter(prefix="/api/ai", tags=["AI Chat (Flowise)"])

FLOWISE_API_URL = settings.FLOWISE_API_URL.rstrip("/")
CHATFLOW_ID = settings.FLOWISE_CHATFLOW_ID

@router.post("/flowise-chat", response_model=ChatResponse)
async def flowise_chat(req: ChatRequest):
    if not CHATFLOW_ID:
        raise HTTPException(status_code=503, detail="Flowise chatflow ID not configured")

    url = f"{FLOWISE_API_URL}/api/v1/prediction/{CHATFLOW_ID}"
    payload = {
        "question": req.message,
        "overrideConfig": {
            "sessionId": req.session_id or "",
            "vars": {
                "userName": req.name or "",
                "userEmail": req.email or "",
            }
        }
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
    except httpx.TimeoutException:
        logger.warning("Flowise request timed out")
        raise HTTPException(status_code=504, detail="Flowise upstream timeout")
    except httpx.HTTPStatusError as e:
        logger.error(f"Flowise HTTP error: {e.response.status_code} {e.response.text[:200]}")
        raise HTTPException(status_code=502, detail="Flowise upstream error")
    except Exception as e:
        logger.error(f"Flowise connection failed: {e}")
        raise HTTPException(status_code=503, detail="Flowise unavailable")

    reply = data.get("text", "").strip()
    if not reply:
        reply = data.get("output", "")
    if not reply:
        raise HTTPException(status_code=502, detail="Flowise returned empty response")

    return ChatResponse(
        reply=reply,
        session_id=req.session_id or "",
        lead_captured=False,
        lead_score=None,
        lead_status=None,
        suggested_action="none",
        source="flowise",
    )