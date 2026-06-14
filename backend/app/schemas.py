from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
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
        # ReDoS-safe email format check
        if not SAFE_EMAIL_RE.match(v):
            raise ValueError("Invalid email format.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        v = sanitize_input(v)
        v = validate_length(v, MAX_PASSWORD_LEN, "password")
        # Password strength check
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


# ──────── Payment Schemas ────────

class CreateOrderRequest(BaseModel):
    product_id: str
    amount: float  # in USD dollars (will be converted to paise)

    @field_validator("product_id")
    @classmethod
    def validate_product_id(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_PRODUCT_ID_LEN, "product_id")
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be positive.")
        if v > 100_000:
            raise ValueError("Amount exceeds maximum allowed.")
        return v


class CreateOrderResponse(BaseModel):
    order_id: str
    key_id: str
    amount: int  # in paise
    currency: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    nonce: Optional[str] = None
    timestamp: Optional[int] = None

    @field_validator("razorpay_order_id", "razorpay_payment_id", "razorpay_signature")
    @classmethod
    def validate_payment_fields(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, 512, "payment field")
        return v


class VerifyPaymentResponse(BaseModel):
    status: str
    message: str


class PurchaseRecord(BaseModel):
    id: str
    product_id: str
    product_name: str
    amount: float
    status: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class PurchaseListResponse(BaseModel):
    purchases: list[PurchaseRecord]


class TrackDownloadRequest(BaseModel):
    product_id: str
    user_id: Optional[str] = None

    @field_validator("product_id")
    @classmethod
    def validate_pid(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_PRODUCT_ID_LEN, "product_id")
        return v


class TrackDownloadResponse(BaseModel):
    status: str
    download_count: int


class ConfirmPurchaseRequest(BaseModel):
    product_id: str
    session_id: str

    @field_validator("product_id")
    @classmethod
    def validate_pid(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_PRODUCT_ID_LEN, "product_id")
        return v

    @field_validator("session_id")
    @classmethod
    def validate_sid(cls, v: str) -> str:
        v = sanitize_strict(v)
        v = validate_length(v, MAX_SESSION_ID_LEN, "session_id")
        return v


class ConfirmPurchaseResponse(BaseModel):
    status: str
    message: str


# ──────── AI Chat Schemas ────────

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

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


class ChatResponse(BaseModel):
    reply: str
    session_id: Optional[str] = None


# ──────── Analytics Schemas ────────

class AnalyticsEvent(BaseModel):
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
