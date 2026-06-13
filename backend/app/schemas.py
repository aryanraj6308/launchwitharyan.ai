from pydantic import BaseModel, EmailStr
from typing import Optional


# ──────── Auth Schemas ────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


# ──────── Contact / Lead Schemas ────────

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    service: Optional[str] = None
    message: Optional[str] = None


class LeadResponse(BaseModel):
    id: str
    name: str
    email: str
    company: Optional[str]
    service: Optional[str]
    message: Optional[str]

    class Config:
        from_attributes = True


# ──────── Payment Schemas ────────

class CreateOrderRequest(BaseModel):
    product_id: str
    amount: float  # in USD dollars (will be converted to paise)


class CreateOrderResponse(BaseModel):
    order_id: str
    key_id: str
    amount: int  # in paise
    currency: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    status: str
    message: str


# ──────── AI Chat Schemas ────────

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: Optional[str] = None


# ──────── Analytics Schemas ────────

class AnalyticsEvent(BaseModel):
    event_type: str
    page: Optional[str] = None
    user_id: Optional[str] = None
    metadata: Optional[dict] = None
