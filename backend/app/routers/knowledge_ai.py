import json
import logging
import uuid
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.config import settings
from app.database import get_db, Conversation, Message, KnowledgeBase, LeadScore, FollowUp, CalendarEvent, Lead
from app.schemas import (
    ChatRequest, ChatResponse, LeadInfoRequest, LeadInfoResponse,
    ConversationResponse, ConversationDetailResponse, MessageResponse,
    FollowUpCreate, FollowUpResponse,
    CalendarBookingRequest, CalendarBookingResponse,
    AdminAnalyticsResponse, AdminLeadStats, AdminConversationStats,
)
from app.knowledge import query_knowledge_base, seed_knowledge_base
from app.lead_qualifier import score_conversation, extract_lead_info
from app.email_service import send_email, build_follow_up_email, build_handoff_email
from app.routers.auth import get_current_user, oauth2_scheme

logger = logging.getLogger("aryanforge.knowledge_ai")

router = APIRouter(prefix="/api/ai", tags=["AI Chat (Enhanced)"])
limiter = Limiter(key_func=get_remote_address)

# ─── Conversation Memory ───

def get_or_create_conversation(session_id: Optional[str], db: Session, request: Optional[Request] = None) -> tuple[Conversation, str]:
    if session_id:
        conv = db.query(Conversation).filter(Conversation.session_id == session_id).first()
        if conv:
            return conv, session_id
    new_id = session_id or str(uuid.uuid4())
    ip = request.client.host if request and request.client else "unknown"
    ua = request.headers.get("user-agent") if request else None
    conv = Conversation(
        session_id=new_id,
        ip_address=ip,
        user_agent=ua,
        lead_status="new",
        lead_score=0,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv, new_id


def get_conversation_history(session_id: str, db: Session, limit: int = 20) -> list[dict]:
    messages = (
        db.query(Message)
        .join(Conversation)
        .filter(Conversation.session_id == session_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
        .all()
    )
    return [{"role": "user" if m.sender == "user" else "assistant", "content": m.text} for m in messages]


def save_message(conversation_id: str, sender: str, text: str, db: Session, msg_type: str = "text"):
    msg = Message(conversation_id=conversation_id, sender=sender, text=text, message_type=msg_type)
    db.add(msg)
    db.commit()
    return msg


def update_lead_score(conversation: Conversation, db: Session):
    """Re-score a conversation based on all messages."""
    messages = db.query(Message).filter(
        Message.conversation_id == conversation.id,
        Message.sender == "user"
    ).order_by(Message.created_at.asc()).all()

    full_text = " ".join([m.text for m in messages])
    scoring = score_conversation(full_text)

    # Save score log
    score_log = LeadScore(
        conversation_id=conversation.id,
        score=scoring["score"],
        budget_score=scoring["budget_score"],
        urgency_score=scoring["urgency_score"],
        intent_score=scoring["intent_score"],
        business_size_score=scoring["business_size_score"],
        reasoning=scoring["reasoning"],
    )
    db.add(score_log)

    # Update conversation
    conversation.lead_score = scoring["score"]
    conversation.lead_status = scoring["lead_status"]
    db.commit()

    return scoring


def extract_and_save_lead_info(text: str, conversation: Conversation, db: Session):
    """Extract lead info from text and save to conversation."""
    extracted = extract_lead_info(text)
    changed = False

    if "name_hint" in extracted and not conversation.visitor_name:
        conversation.visitor_name = extracted["name_hint"]
        changed = True
    if "email_hint" in extracted and not conversation.visitor_email:
        conversation.visitor_email = extracted["email_hint"]
        changed = True
    if "phone_hint" in extracted and not conversation.visitor_phone:
        conversation.visitor_phone = extracted["phone_hint"]
        changed = True
    if "budget_hint" in extracted and not conversation.budget_range:
        conversation.budget_range = extracted["budget_hint"]
        changed = True

    if changed:
        db.commit()

    # If we have name + email, also save as a Lead
    if conversation.visitor_name and conversation.visitor_email:
        existing = db.query(Lead).filter(Lead.email == conversation.visitor_email).first()
        if not existing:
            lead = Lead(
                name=conversation.visitor_name,
                email=conversation.visitor_email,
                company=conversation.business_type,
                service="AI Chat Inquiry",
                message=conversation.requirements or "Via AI Chatbot",
            )
            db.add(lead)
            db.commit()


# ─── Knowledge-Augmented System Prompt ───

def build_system_prompt(knowledge_context: list[dict], conversation: Conversation) -> str:
    knowledge_section = ""
    if knowledge_context and settings.ENABLE_KNOWLEDGE_RAG:
        knowledge_section = "\n\n## KNOWLEDGE BASE REFERENCES (use these facts):\n"
        for i, item in enumerate(knowledge_context, 1):
            knowledge_section += f"\n[{i}] {item['title']} ({item['category']}):\n{item['content']}\n"

    lead_info = ""
    if conversation.visitor_name:
        lead_info += f"\nVisitor Name: {conversation.visitor_name}"
    if conversation.visitor_email:
        lead_info += f"\nVisitor Email: {conversation.visitor_email}"
    if conversation.visitor_phone:
        lead_info += f"\nVisitor Phone: {conversation.visitor_phone}"
    if conversation.business_type:
        lead_info += f"\nBusiness Type: {conversation.business_type}"
    if conversation.budget_range:
        lead_info += f"\nMentioned Budget: {conversation.budget_range}"
    if conversation.requirements:
        lead_info += f"\nRequirements: {conversation.requirements}"

    return f"""You are Aryan, the founder and lead AI consultant at AryanForge —
a premium agency specializing in custom AI automations, high-performance web platforms,
intelligent chatbots, and SEO automation.

## YOUR PERSONALITY:
- Professional, warm, and consultative — like a top-tier agency founder
- Ask thoughtful follow-up questions to understand the client's needs
- Be proactive: suggest solutions, recommend packages, offer next steps
- Use natural, conversational language (no markdown, no bullet lists in chat)
- Keep responses concise (2-4 sentences usually) but be thorough when needed

## YOUR KNOWLEDGE:
You have deep expertise in:
1. AI Workflow Automation — lead gen, CRM automation, support, reporting
2. Premium Web Development — Astro, React, Next.js, Tailwind, GSAP, Framer Motion
3. AI Chatbots — customer support, lead qualification, WhatsApp, Telegram, web
4. SEO Automation — keyword research, content generation, technical SEO
5. Digital Products — templates, boilerplates, prompt packs{lead_info}

## BEHAVIOR GUIDELINES:
- If the client mentions a business problem, immediately follow up with targeted questions about their current process, team size, and tools
- If they ask about pricing, give ranges and ask about their budget to recommend the best fit
- If they seem ready to buy, suggest booking a free discovery call via Calendly
- If the question is very technical/complex, offer to connect them with Aryan directly
- When a client asks to speak to the founder or a human, give them Aryan's direct WhatsApp: +91 8877390736, or email: aryan@launchwitharyan.ai
- NEVER mention that you are an AI or that you use a knowledge base — be natural
- NEVER use markdown formatting (no asterisks, no bullet points, no code blocks)
- Sign off important responses with "— Aryan"

## LEAD QUALIFICATION (INTERNAL — do not reveal to client):
- Listen for budget indicators: high ($25k+), medium ($5k-$25k), low (under $5k)
- Listen for urgency: immediate, soon (this month), planning (exploring)
- Listen for intent: ready to buy, evaluating, just curious
- Listen for business size: enterprise, mid-market, small business/startup
- If you identify a hot lead (high budget + urgency + intent), strongly suggest booking a discovery call
- Track this information silently to provide better recommendations{knowledge_section}"""


# ─── AI Query Functions ───

async def query_ai(prompt: str, system_prompt: str) -> str:
    """Route to available AI backend: Flowise > Groq > OpenAI > Ollama."""
    if settings.ENABLE_FLOWISE and settings.FLOWISE_CHATFLOW_ID:
        try:
            return await _query_flowise(prompt)
        except Exception as e:
            logger.warning(f"Flowise failed, falling back: {e}")

    has_groq = settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_")
    has_openai = (
        settings.OPENAI_API_KEY
        and settings.OPENAI_API_KEY.startswith("sk-")
        and not settings.OPENAI_API_KEY.startswith("sk-proj-your")
    )

    if has_groq:
        return await _query_groq(prompt, system_prompt)
    elif has_openai:
        return await _query_openai(prompt, system_prompt)
    elif settings.OLLAMA_URL:
        return await _query_ollama(prompt, system_prompt)
    else:
        return (
            "Thanks for your message! I'm currently running in demo mode. "
            "To get the full AI experience, our team is standing by. "
            "Would you like to book a free discovery call with Aryan? "
            "Just let me know and I'll send you a link!"
        )


async def _query_flowise(prompt: str) -> str:
    """Send prompt to Flowise API."""
    url = f"{settings.FLOWISE_API_URL.rstrip('/')}/api/v1/prediction/{settings.FLOWISE_CHATFLOW_ID}"
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, json={"question": prompt})
        resp.raise_for_status()
        data = resp.json()
    return data.get("text", "") or data.get("output", "") or ""


async def _query_openai(prompt: str, system_prompt: str) -> str:
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings.AI_MAX_TOKENS,
            temperature=settings.AI_TEMPERATURE,
        )
        return response.choices[0].message.content or "I'm here to help! What would you like to know about our services?"
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable.")


async def _query_groq(prompt: str, system_prompt: str) -> str:
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings.AI_MAX_TOKENS,
            temperature=settings.AI_TEMPERATURE,
        )
        return response.choices[0].message.content or "I'm here to help! What would you like to know?"
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable.")


async def _query_ollama(prompt: str, system_prompt: str) -> str:
    try:
        import httpx
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_URL}/api/generate",
                json={"model": "llama3", "prompt": f"{system_prompt}\n\nUser: {prompt}\n\nAryan:", "stream": False}
            )
            response.raise_for_status()
            return response.json().get("response", "Let me help you with that!")
    except Exception as e:
        logger.error(f"Ollama error: {e}")
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable.")


# ─── Determine Suggested Action ───

def determine_action(conversation: Conversation, last_reply: str) -> str:
    """Determine the next suggested action based on conversation state."""
    if conversation.wants_human:
        return "handoff"
    if conversation.lead_score >= 70:
        return "book_call"
    if conversation.follow_up_scheduled:
        return "follow_up"
    if "book" in last_reply.lower() and ("call" in last_reply.lower() or "discovery" in last_reply.lower()):
        return "book_call"
    return "none"


# ─── API Endpoints ───

@router.post("/chat-enhanced", response_model=ChatResponse)
@limiter.limit("30/minute")
async def chat_enhanced(request: Request, chat_request: ChatRequest, db: Session = Depends(get_db)):
    """Enhanced AI chat with knowledge base, lead qualification, and conversation memory."""
    message = chat_request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Get or create conversation
    conv, session_id = get_or_create_conversation(chat_request.session_id, db, request)

    # If visitor provided name/email, save it
    if chat_request.name and not conv.visitor_name:
        conv.visitor_name = chat_request.name
    if chat_request.email and not conv.visitor_email:
        conv.visitor_email = chat_request.email
    if chat_request.name or chat_request.email:
        db.commit()

    # Save user message
    save_message(conv.id, "user", message, db)

    # Query knowledge base
    knowledge = query_knowledge_base(message, db) if settings.ENABLE_KNOWLEDGE_RAG else []

    # Extract lead info from message
    extract_and_save_lead_info(message, conv, db)

    # Get conversation history
    history = get_conversation_history(session_id, db)

    # Build system prompt with knowledge context
    system_prompt = build_system_prompt(knowledge, conv)

    # Build full prompt with history
    history_text = ""
    if len(history) > 1:
        for h in history[:-1]:
            prefix = "Client" if h["role"] == "user" else "Aryan"
            history_text += f"\n{prefix}: {h['content']}"
        history_text += f"\n\nClient: {message}"
    else:
        history_text = message

    # Get AI response
    reply = await query_ai(history_text, system_prompt)

    # Save bot message
    save_message(conv.id, "bot", reply, db)

    # Update lead score
    scoring = update_lead_score(conv, db)

    # Check if user wants human handoff
    wants_human = any(phrase in message.lower() for phrase in [
        "talk to aryan", "speak to aryan", "speak to founder", "speak to human",
        "talk to human", "aryan himself", "connect me", "transfer me",
        "real person", "contact aryan", "reach aryan", "need aryan",
        "aryan directly", "talk to founder", "human support",
    ]) or "handoff" in reply.lower()
    
    if wants_human:
        conv.wants_human = True
        db.commit()
        # Append direct contact info to the AI's reply
        reply += (
            "\n\nYou can reach Aryan directly on WhatsApp at +91 8877390736 "
            "or email aryan@launchwitharyan.ai. He typically responds within a few hours!"
        )

    action = determine_action(conv, reply)

    return ChatResponse(
        reply=reply,
        session_id=session_id,
        lead_captured=bool(conv.visitor_name and conv.visitor_email),
        lead_score=conv.lead_score,
        lead_status=conv.lead_status,
        wants_human=conv.wants_human,
        suggested_action=action,
    )


@router.post("/lead-info", response_model=LeadInfoResponse)
@limiter.limit("20/minute")
async def save_lead_info(request: Request, lead_info: LeadInfoRequest, db: Session = Depends(get_db)):
    """Save lead information collected from the chat."""
    conv = db.query(Conversation).filter(Conversation.session_id == lead_info.session_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    if lead_info.name:
        conv.visitor_name = lead_info.name
    if lead_info.email:
        conv.visitor_email = lead_info.email
    if lead_info.phone:
        conv.visitor_phone = lead_info.phone
    if lead_info.business_type:
        conv.business_type = lead_info.business_type
    if lead_info.budget_range:
        conv.budget_range = lead_info.budget_range
    if lead_info.requirements:
        conv.requirements = lead_info.requirements

    db.commit()
    scoring = update_lead_score(conv, db)

    # Also create a Lead record if we have name + email
    if conv.visitor_name and conv.visitor_email:
        existing = db.query(Lead).filter(Lead.email == conv.visitor_email).first()
        if not existing:
            lead = Lead(
                name=conv.visitor_name,
                email=conv.visitor_email,
                company=conv.business_type,
                service="AI Chat Inquiry",
                message=conv.requirements or "Via AI Chatbot",
            )
            db.add(lead)
            db.commit()

    return LeadInfoResponse(
        status="ok",
        session_id=lead_info.session_id,
        lead_score=scoring["score"],
        lead_status=scoring["lead_status"],
    )


@router.post("/handoff")
@limiter.limit("10/minute")
async def request_human_handoff(request: Request, db: Session = Depends(get_db), body: Optional[dict] = None):
    """Request human handoff — notify the team."""
    session_id = (body or {}).get("session_id", "") if body else ""
    conv = db.query(Conversation).filter(Conversation.session_id == session_id).first() if session_id else None

    if conv:
        conv.wants_human = True
        db.commit()
        name = conv.visitor_name or "A visitor"
        email = conv.visitor_email or "unknown@aryanforge.com"
        
        # Send notification
        subject, html, text = build_handoff_email(name, f"Session: {session_id}")
        await send_email(settings.SMTP_FROM or "aryan@launchwitharyan.ai", subject, html)

    return {"status": "handoff_requested", "message": "Aryan has been notified! You can also reach him directly on WhatsApp at +91 8877390736 or email aryan@launchwitharyan.ai. He'll get back to you shortly."}


@router.post("/book-call", response_model=CalendarBookingResponse)
@limiter.limit("5/minute")
async def book_discovery_call(request: Request, booking: CalendarBookingRequest, db: Session = Depends(get_db)):
    """Book a discovery call via Calendly or manual scheduling."""
    # Save to calendar_events
    event = CalendarEvent(
        conversation_id=booking.conversation_id,
        name=booking.name,
        email=booking.email,
        phone=booking.phone,
        event_type="discovery_call",
        timezone=booking.timezone,
    )
    db.add(event)
    db.commit()

    # Update conversation if linked
    if booking.conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == booking.conversation_id).first()
        if conv:
            conv.lead_status = "hot"
            db.commit()

    calendly_link = settings.CALENDLY_LINK

    return CalendarBookingResponse(
        status="success",
        message="Great! Click the link below to pick a time that works for you.",
        meeting_link=calendly_link,
    )


@router.post("/follow-up", response_model=FollowUpResponse)
@limiter.limit("10/minute")
async def schedule_follow_up(request: Request, follow_up: FollowUpCreate, db: Session = Depends(get_db)):
    """Schedule a follow-up email for a lead."""
    conv = db.query(Conversation).filter(Conversation.id == follow_up.conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    # Get conversation summary (last few messages)
    recent_msgs = db.query(Message).filter(
        Message.conversation_id == conv.id
    ).order_by(desc(Message.created_at)).limit(6).all()
    summary = "\n".join([f"{'Client' if m.sender == 'user' else 'Aryan'}: {m.text[:150]}" for m in reversed(recent_msgs)])

    fup = FollowUp(
        conversation_id=follow_up.conversation_id,
        email=follow_up.email,
        name=follow_up.name or conv.visitor_name,
        lead_status=conv.lead_status or "warm",
        follow_up_type=follow_up.follow_up_type,
        calendly_link=settings.CALENDLY_LINK,
    )
    db.add(fup)
    db.commit()
    db.refresh(fup)

    conv.follow_up_scheduled = True
    db.commit()

    # Send follow-up email immediately (in production, delay via background task/celery)
    subject, html, text = build_follow_up_email(
        name=follow_up.name or conv.visitor_name or "there",
        calendly_link=settings.CALENDLY_LINK,
        conversation_summary=summary,
    )
    await send_email(follow_up.email, subject, html)

    fup.sent_at = datetime.utcnow()
    fup.status = "sent"
    db.commit()

    return FollowUpResponse(
        id=fup.id,
        conversation_id=fup.conversation_id,
        email=fup.email,
        name=fup.name,
        lead_status=fup.lead_status,
        follow_up_type=fup.follow_up_type,
        status=fup.status,
        scheduled_at=str(fup.scheduled_at) if fup.scheduled_at else None,
        sent_at=str(fup.sent_at) if fup.sent_at else None,
        calendly_link=fup.calendly_link,
        created_at=str(fup.created_at) if fup.created_at else None,
    )


# ─── Conversation & Admin Endpoints ───

@router.get("/conversations", response_model=list[ConversationResponse])
@limiter.limit("20/minute")
async def list_conversations(
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(oauth2_scheme),
):
    """List all conversations (auth required)."""
    try:
        current_user = await get_current_user(user, db)
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required.")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication required.")

    conversations = db.query(Conversation).order_by(desc(Conversation.updated_at)).limit(100).all()
    result = []
    for c in conversations:
        msg_count = db.query(Message).filter(Message.conversation_id == c.id).count()
        result.append(ConversationResponse(
            id=c.id,
            session_id=c.session_id,
            visitor_name=c.visitor_name,
            visitor_email=c.visitor_email,
            visitor_phone=c.visitor_phone,
            business_type=c.business_type,
            budget_range=c.budget_range,
            requirements=c.requirements,
            lead_score=c.lead_score or 0,
            lead_status=c.lead_status or "new",
            source_page=c.source_page,
            is_active=c.is_active,
            wants_human=c.wants_human,
            message_count=msg_count,
            created_at=str(c.created_at) if c.created_at else None,
            updated_at=str(c.updated_at) if c.updated_at else None,
        ))
    return result


@router.get("/conversations/{session_id}", response_model=ConversationDetailResponse)
@limiter.limit("20/minute")
async def get_conversation_detail(
    request: Request,
    session_id: str,
    db: Session = Depends(get_db),
    user=Depends(oauth2_scheme),
):
    """Get full conversation with messages."""
    try:
        current_user = await get_current_user(user, db)
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required.")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication required.")

    conv = db.query(Conversation).filter(Conversation.session_id == session_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    msgs = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()
    msg_count = len(msgs)

    return ConversationDetailResponse(
        conversation=ConversationResponse(
            id=conv.id,
            session_id=conv.session_id,
            visitor_name=conv.visitor_name,
            visitor_email=conv.visitor_email,
            visitor_phone=conv.visitor_phone,
            business_type=conv.business_type,
            budget_range=conv.budget_range,
            requirements=conv.requirements,
            lead_score=conv.lead_score or 0,
            lead_status=conv.lead_status or "new",
            source_page=conv.source_page,
            is_active=conv.is_active,
            wants_human=conv.wants_human,
            message_count=msg_count,
            created_at=str(conv.created_at) if conv.created_at else None,
            updated_at=str(conv.updated_at) if conv.updated_at else None,
        ),
        messages=[
            MessageResponse(
                id=m.id,
                sender=m.sender,
                text=m.text,
                message_type=m.message_type,
                created_at=str(m.created_at) if m.created_at else None,
            )
            for m in msgs
        ],
    )


@router.get("/analytics", response_model=AdminAnalyticsResponse)
@limiter.limit("20/minute")
async def get_ai_analytics(
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(oauth2_scheme),
):
    """Get AI chat analytics for admin dashboard."""
    try:
        current_user = await get_current_user(user, db)
        if not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Admin access required.")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication required.")

    total = db.query(Conversation).count()
    active = db.query(Conversation).filter(Conversation.is_active == True).count()
    human_requests = db.query(Conversation).filter(Conversation.wants_human == True).count()
    follow_ups_scheduled = db.query(Conversation).filter(Conversation.follow_up_scheduled == True).count()
    follow_ups_sent = db.query(FollowUp).filter(FollowUp.status == "sent").count()
    calls_booked = db.query(CalendarEvent).count()

    hot = db.query(Conversation).filter(Conversation.lead_status == "hot").count()
    warm = db.query(Conversation).filter(Conversation.lead_status == "warm").count()
    cold = db.query(Conversation).filter(Conversation.lead_status == "cold").count()
    new_leads = db.query(Conversation).filter(Conversation.lead_status == "new").count()

    avg_score = db.query(LeadScore).count()
    avg_val = 0.0
    if avg_score > 0:
        from sqlalchemy import func as sqlfunc
        avg_val = db.query(sqlfunc.avg(LeadScore.score)).scalar() or 0.0

    return AdminAnalyticsResponse(
        leads=AdminLeadStats(
            total_leads=total,
            hot_leads=hot,
            warm_leads=warm,
            cold_leads=cold,
            new_leads=new_leads,
            converted_leads=0,
            avg_lead_score=avg_val,
            total_potential_revenue=hot * 10000 + warm * 5000 + cold * 1000,
        ),
        conversations=AdminConversationStats(
            total_conversations=total,
            active_conversations=active,
            human_handoff_requested=human_requests,
            follow_ups_scheduled=follow_ups_scheduled,
            follow_ups_sent=follow_ups_sent,
            discovery_calls_booked=calls_booked,
        ),
    )
