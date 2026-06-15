from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Any
import re

from app.security import (
    sanitize_input,
    sanitize_strict,
    validate_length,
    MAX_EMAIL_LEN,
    MAX_NAME_LEN,
    MAX_PASSWORD_LEN,
    MAX_MESSAGE_LEN,
    MAX_PRODUCT_ID_LEN,
    MAX_SESSION_ID_LEN,
    MAX_EVENT_TYPE_LEN,
    MAX_PAGE_LEN,
    MAX_USER_ID_LEN,
    MAX_COMPANY_LEN,
    MAX_SERVICE_LEN,
    SAFE_EMAIL_RE,
)


# ──────── Auth Schemas ────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = sanitize_input(v)
        v = validate_length(v, MAX_EMAIL_LEN, "email")
        if not SAFE_EMAIL_RE.match(v):
            raise ValueError("Invalid email format.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        v = sanitize_input(v)
        v = validate_length(v, MAX_PASSWORD_LEN, "password")
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("Password must contain at least one special character.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = sanitize_input(v)
        v = validate_length(v, MAX_EMAIL_LEN, "email")
        if not SAFE_EMAIL_RE.match(v):
            raise ValueError("Invalid email format.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        v = sanitize_input(v)
        v = validate_length(v, MAX_PASSWORD_LEN, "password")
        return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None


# ──────── User Schemas ────────

class UserResponse(BaseModel):
    id: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# ──────── Contact / Lead Schemas ────────

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    service: Optional[str] = None
    message: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_NAME_LEN, "name")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = sanitize_input(v)
        v = validate_length(v, MAX_EMAIL_LEN, "email")
        if not SAFE_EMAIL_RE.match(v):
            raise ValueError("Invalid email format.")
        return v

    @field_validator("company")
    @classmethod
    def validate_company(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, MAX_COMPANY_LEN, "company")
        return v

    @field_validator("service")
    @classmethod
    def validate_service(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, MAX_SERVICE_LEN, "service")
        return v

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, MAX_MESSAGE_LEN, "message")
        return v


class LeadResponse(BaseModel):
    id: str
    name: str
    email: str
    company: Optional[str]
    service: Optional[str]
    message: Optional[str]

    class Config:
        from_attributes = True


# ──────── Product Schemas ────────

class ProductResponse(BaseModel):
    id: str
    product_id: str
    name: str
    description: Optional[str]
    price_inr: float
    price_usd: Optional[float]
    category: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# ──────── Payment / Order Schemas ────────

class CreateOrderRequest(BaseModel):
    product_id: str

    @field_validator("product_id")
    @classmethod
    def validate_product_id(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_PRODUCT_ID_LEN, "product_id")
        return v


class CreateOrderResponse(BaseModel):
    order_id: str
    key_id: str
    amount: int
    currency: str
    product_id: str
    user_email: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

    @field_validator("razorpay_order_id", "razorpay_payment_id", "razorpay_signature")
    @classmethod
    def validate_payment_fields(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, 512, "payment field")
        return v


class VerifyPaymentResponse(BaseModel):
    status: str
    message: str
    product_id: Optional[str] = None
    download_url: Optional[str] = None


class PurchaseRecord(BaseModel):
    id: str
    product_id: str
    product_name: str
    amount: float
    currency: str
    status: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class PurchaseListResponse(BaseModel):
    purchases: list[PurchaseRecord]


class CheckAccessRequest(BaseModel):
    product_id: str

    @field_validator("product_id")
    @classmethod
    def validate_pid(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_PRODUCT_ID_LEN, "product_id")
        return v


class CheckAccessResponse(BaseModel):
    has_access: bool
    product_id: str
    product_name: Optional[str] = None


# ──────── Admin Schemas ────────

class AdminOrderResponse(BaseModel):
    id: str
    user_id: Optional[str]
    user_email: Optional[str]
    product_id: str
    product_name: str
    amount: float
    currency: str
    razorpay_order_id: Optional[str]
    razorpay_payment_id: Optional[str]
    status: str
    created_at: Optional[str]

    class Config:
        from_attributes = True


class AdminPaymentResponse(BaseModel):
    id: str
    user_id: Optional[str]
    order_id: Optional[str]
    razorpay_order_id: Optional[str]
    razorpay_payment_id: Optional[str]
    amount: float
    currency: str
    status: str
    method: Optional[str]
    error_code: Optional[str]
    created_at: Optional[str]

    class Config:
        from_attributes = True


class AdminDashboardStats(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: float
    paid_orders: int
    failed_orders: int
    pending_orders: int
    total_downloads: int
    recent_orders: list[AdminOrderResponse]


# ──────── Razorpay Webhook ────────

class RazorpayWebhookPayload(BaseModel):
    event: str
    payload: dict[str, Any]
    created_at: Optional[int] = None


# ──────── Support Schemas ────────

class SupportRequestCreate(BaseModel):
    email: EmailStr
    subject: str
    message: str

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, 255, "subject")
        return v

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_MESSAGE_LEN, "message")
        return v


class SupportRequestResponse(BaseModel):
    id: str
    email: str
    subject: str
    message: str
    status: str
    created_at: Optional[str]

    class Config:
        from_attributes = True


# ──────── AI Chat Schemas ────────

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = sanitize_input(v)
        v = validate_length(v, MAX_MESSAGE_LEN, "message")
        return v

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, MAX_SESSION_ID_LEN, "session_id")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, MAX_NAME_LEN, "name")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_input(v)
            v = validate_length(v, MAX_EMAIL_LEN, "email")
            if not SAFE_EMAIL_RE.match(v):
                raise ValueError("Invalid email format.")
        return v


class ChatResponse(BaseModel):
    reply: str
    session_id: Optional[str] = None
    lead_captured: Optional[bool] = False
    lead_score: Optional[int] = None
    lead_status: Optional[str] = None
    wants_human: Optional[bool] = False
    suggested_action: Optional[str] = None  # book_call, follow_up, handoff, none


class LeadInfoRequest(BaseModel):
    session_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    business_type: Optional[str] = None
    budget_range: Optional[str] = None
    requirements: Optional[str] = None

    @field_validator("session_id")
    @classmethod
    def validate_sid(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_SESSION_ID_LEN, "session_id")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, MAX_NAME_LEN, "name")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_input(v)
            v = validate_length(v, MAX_EMAIL_LEN, "email")
            if not SAFE_EMAIL_RE.match(v):
                raise ValueError("Invalid email format.")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, 50, "phone")
        return v


class LeadInfoResponse(BaseModel):
    status: str
    session_id: str
    lead_score: Optional[int] = None
    lead_status: Optional[str] = None


# ──────── CRM / Conversation Schemas ────────

class ConversationResponse(BaseModel):
    id: str
    session_id: str
    visitor_name: Optional[str]
    visitor_email: Optional[str]
    visitor_phone: Optional[str]
    business_type: Optional[str]
    budget_range: Optional[str]
    requirements: Optional[str]
    lead_score: int
    lead_status: str
    source_page: Optional[str]
    is_active: bool
    wants_human: bool
    message_count: int
    created_at: Optional[str]
    updated_at: Optional[str]

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    sender: str
    text: str
    message_type: str
    created_at: Optional[str]

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    conversation: ConversationResponse
    messages: list[MessageResponse]


class FollowUpCreate(BaseModel):
    conversation_id: str
    email: str
    name: Optional[str] = None
    follow_up_type: str = "email"
    scheduled_at: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = sanitize_input(v)
        v = validate_length(v, MAX_EMAIL_LEN, "email")
        if not SAFE_EMAIL_RE.match(v):
            raise ValueError("Invalid email format.")
        return v


class FollowUpResponse(BaseModel):
    id: str
    conversation_id: str
    email: str
    name: Optional[str]
    lead_status: str
    follow_up_type: str
    status: str
    scheduled_at: Optional[str]
    sent_at: Optional[str]
    calendly_link: Optional[str]
    created_at: Optional[str]

    class Config:
        from_attributes = True


class CalendarBookingRequest(BaseModel):
    conversation_id: Optional[str] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    timezone: str = "UTC"

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_NAME_LEN, "name")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, 50, "phone")
        return v


class CalendarBookingResponse(BaseModel):
    status: str
    message: str
    meeting_link: Optional[str] = None


# ──────── Admin Dashboard Enhanced ────────

class AdminLeadStats(BaseModel):
    total_leads: int
    hot_leads: int
    warm_leads: int
    cold_leads: int
    new_leads: int
    converted_leads: int
    avg_lead_score: float
    total_potential_revenue: float


class AdminConversationStats(BaseModel):
    total_conversations: int
    active_conversations: int
    human_handoff_requested: int
    follow_ups_scheduled: int
    follow_ups_sent: int
    discovery_calls_booked: int


class AdminAnalyticsResponse(BaseModel):
    leads: AdminLeadStats
    conversations: AdminConversationStats
    revenue: Optional[dict] = None


# ──────── Analytics Schemas ────────

class AnalyticsEventCreate(BaseModel):
    event_type: str
    page: Optional[str] = None
    user_id: Optional[str] = None
    metadata: Optional[dict] = None

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_EVENT_TYPE_LEN, "event_type")
        return v

    @field_validator("page")
    @classmethod
    def validate_page(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, MAX_PAGE_LEN, "page")
        return v

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = sanitize_strict(v)
            v = validate_length(v, MAX_USER_ID_LEN, "user_id")
        return v

    @field_validator("metadata")
    @classmethod
    def validate_metadata(cls, v: Optional[dict]) -> Optional[dict]:
        if v is not None and not isinstance(v, dict):
            raise ValueError("metadata must be a dictionary.")
        return v
