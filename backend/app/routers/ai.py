import httpx
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/ai", tags=["AI Chat"])

limiter = Limiter(key_func=get_remote_address)


async def query_ollama(prompt: str, model: str = "llama3") -> str:
    """Send a prompt to a local Ollama instance."""
    url = f"{settings.OLLAMA_URL}/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return response.json().get("response", "I couldn't generate a response. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama unavailable: {str(e)}")


SYSTEM_PROMPT = (
    "You are Aryan, an expert AI consultant for AryanForge — "
    "a premium agency specializing in custom AI automations, high-performance web platforms, "
    "intelligent chatbots, and SEO automation. "
    "Be concise, professional, and extremely helpful. "
    "Do not use markdown in your responses. Keep answers under 3 sentences."
)


async def query_openai(prompt: str) -> str:
    """Send a prompt to OpenAI API."""
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        return response.choices[0].message.content or "I am unable to respond at this moment."
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"OpenAI API error: {str(e)}")


async def query_groq(prompt: str) -> str:
    """Send a prompt to Groq API (Grok models via Groq's OpenAI-compatible endpoint)."""
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1"
        )
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        return response.choices[0].message.content or "I am unable to respond at this moment."
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Groq API error: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(request: Request, chat_request: ChatRequest):
    """
    Handle AI chat requests. Routes to Groq (if key set), OpenAI (if valid key),
    or falls back to local Ollama instance.
    """
    message = chat_request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    has_groq = settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_")
    has_openai = (
        settings.OPENAI_API_KEY
        and settings.OPENAI_API_KEY.startswith("sk-")
        and not settings.OPENAI_API_KEY.startswith("sk-proj-your")
    )

    if has_groq:
        try:
            reply = await query_groq(message)
        except HTTPException:
            reply = "I'm currently running in demo mode. To unlock my full AI capabilities, configure your OpenAI API key in the backend .env file or start a local Ollama instance. What can I help you with in the meantime?"
    elif has_openai:
        try:
            reply = await query_openai(message)
        except HTTPException:
            reply = "I'm currently running in demo mode. To unlock my full AI capabilities, configure your OpenAI API key in the backend .env file or start a local Ollama instance. What can I help you with in the meantime?"
    elif settings.OLLAMA_URL:
        try:
            reply = await query_ollama(message)
        except HTTPException:
            reply = "I'm currently running in demo mode. To unlock my full AI capabilities, configure your OpenAI API key in the backend .env file or start a local Ollama instance. What can I help you with in the meantime?"
    else:
        reply = "I'm currently running in demo mode. To unlock my full AI capabilities, configure your OpenAI API key in the backend .env file or start a local Ollama instance. What can I help you with in the meantime?"

    return ChatResponse(reply=reply, session_id=chat_request.session_id)
