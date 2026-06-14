import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, field_validator, EmailStr
import httpx

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("lead-ingestion")

app = FastAPI(title="Lead Ingestion Webhook", version="1.0.0")

SHEETS_WEBHOOK_URL = os.getenv("SHEETS_WEBHOOK_URL", "")
NOTION_WEBHOOK_URL = os.getenv("NOTION_WEBHOOK_URL", "")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
SLACK_TOKEN = os.getenv("SLACK_TOKEN", "")
SLACK_CHANNEL = os.getenv("SLACK_CHANNEL", "#leads")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "")
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
RETRY_DELAY_MS = int(os.getenv("RETRY_DELAY_MS", "1000"))


class LeadIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    source: Optional[str] = "Website Form"
    message: Optional[str] = ""
    lead_score: Optional[int] = 0

    @field_validator("name")
    @classmethod
    def name_min_length(cls, v):
        if len(v.strip()) < 2:
            raise ValueError("name must be at least 2 characters")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v):
        if v is not None and v.strip():
            import re
            if not re.match(r"^[\d\s\-\+\(\)]{7,20}$", v.strip()):
                raise ValueError("phone format is invalid")
            return v.strip()
        return v

    @field_validator("lead_score")
    @classmethod
    def score_range(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("lead_score must be between 0 and 100")
        return v


class LeadOut(BaseModel):
    name: str
    email: str
    phone: str
    source: str
    message: str
    lead_score: int
    timestamp: str


def build_lead(lead: LeadIn) -> LeadOut:
    return LeadOut(
        name=lead.name,
        email=lead.email,
        phone=lead.phone or "",
        source=lead.source or "Website Form",
        message=lead.message or "",
        lead_score=lead.lead_score or 0,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )


def build_slack_payload(lead: LeadOut) -> dict:
    score = lead.lead_score
    if score >= 80:
        color = "#36a64f"
    elif score >= 50:
        color = "#daa038"
    else:
        color = "#a0a0a0"

    return {
        "channel": SLACK_CHANNEL,
        "attachments": [
            {
                "color": color,
                "blocks": [
                    {
                        "type": "header",
                        "text": {"type": "plain_text", "text": f"New Lead: {lead.name}"},
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Name:*\n{lead.name}"},
                            {"type": "mrkdwn", "text": f"*Email:*\n{lead.email}"},
                            {"type": "mrkdwn", "text": f"*Phone:*\n{lead.phone or 'N/A'}"},
                            {"type": "mrkdwn", "text": f"*Source:*\n{lead.source}"},
                            {"type": "mrkdwn", "text": f"*Score:*\n{score}/100"},
                            {"type": "mrkdwn", "text": f"*Date:*\n{lead.timestamp[:10]}"},
                        ],
                    },
                    {
                        "type": "section",
                        "text": {"type": "mrkdwn", "text": f"*Message:*\n{lead.message or 'No message'}"},
                    },
                ],
            }
        ],
    }


async def deliver_with_retry(client: httpx.AsyncClient, url: str, payload: dict, headers: dict = None) -> dict:
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = await client.post(url, json=payload, headers=req_headers, timeout=10.0)
            resp.raise_for_status()
            return {"success": True, "status": resp.status_code}
        except Exception as e:
            logger.warning(f"Delivery attempt {attempt}/{MAX_RETRIES} to {url} failed: {e}")
            if attempt < MAX_RETRIES:
                await asyncio.sleep(RETRY_DELAY_MS / 1000 * (2 ** (attempt - 1)))
            else:
                return {"success": False, "error": str(e)}


@app.post("/api/ingest")
async def ingest_lead(request: Request, lead_in: LeadIn):
    if WEBHOOK_SECRET:
        received = request.headers.get("x-webhook-secret") or request.headers.get("X-Webhook-Secret")
        if received != WEBHOOK_SECRET:
            raise HTTPException(status_code=401, detail="Invalid webhook secret")

    lead = build_lead(lead_in)
    logger.info(f"Received lead: {lead.email} from {lead.source}")

    destinations = []
    headers = {}

    if SHEETS_WEBHOOK_URL:
        destinations.append(("Google Sheets", SHEETS_WEBHOOK_URL, lead.model_dump(), None))
    if NOTION_WEBHOOK_URL:
        destinations.append(("Notion", NOTION_WEBHOOK_URL, lead.model_dump(), None))
    if SLACK_WEBHOOK_URL:
        destinations.append(("Slack (Webhook)", SLACK_WEBHOOK_URL, build_slack_payload(lead), None))
    if SLACK_TOKEN:
        slack_headers = {"Authorization": f"Bearer {SLACK_TOKEN}"}
        payload = build_slack_payload(lead)
        payload["token"] = SLACK_TOKEN
        destinations.append(("Slack (API)", "https://slack.com/api/chat.postMessage", payload, slack_headers))

    if not destinations:
        return {
            "success": True,
            "lead_id": f"lead_{int(datetime.utcnow().timestamp() * 1000)}",
            "message": "Lead received but no destinations configured",
            "lead": lead.model_dump(),
        }

    async with httpx.AsyncClient() as client:
        tasks = [deliver_with_retry(client, url, payload, hdrs) for _, url, payload, hdrs in destinations]
        results = await asyncio.gather(*tasks)

    delivery_results = [
        {"destination": name, "success": res["success"], "error": res.get("error")}
        for (name, _, _, _), res in zip(destinations, results)
    ]

    all_ok = all(r["success"] for r in delivery_results)

    status_code = 200 if all_ok else 207
    return {
        "success": all_ok,
        "lead_id": f"lead_{int(datetime.utcnow().timestamp() * 1000)}",
        "deliveries": delivery_results,
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "lead-ingestion-webhook", "version": "1.0.0"}
