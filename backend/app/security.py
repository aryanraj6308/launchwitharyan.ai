import re
import time
import hashlib
import hmac
import secrets
import logging
from typing import Optional
from fastapi import Request, HTTPException, status
from app.config import settings

logger = logging.getLogger("launchwitharyan.security")

# ─── #1 & #5: Input Sanitization (SSTI + SQL Injection prevention) ───

SSTI_PATTERNS = re.compile(
    r"""\$\{.*?\}|         # ${...} (Spring, Scala)
    \{\{.*?\}\}|           # {{...}} (Jinja2, Thymeleaf, Handlebars)
    \{\%.*?\%\}|           # {%...%} (Jinja2)
    <%.*?%>|               # <%...%> (ASP, ERB)
    \$\[.*?\]|             # $[...] (FreeMarker)
    \#\{.*?\}|             # #{...} (MyBatis, JSP)
    \@\{.*?\}|             # @{...} (Thymeleaf URL)
    \*\{.*?\}              # *{...} (Thymeleaf inline)
""",
    re.VERBOSE | re.IGNORECASE,
)

SQL_INJECTION_PATTERNS = re.compile(
    r"""(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bDELETE\b|
    \bINSERT\b|\bUPDATE\b|\bCREATE\b|\bALTER\b|\bEXEC\b|
    \bEXECUTE\b|\bSLEEP\b|\bWAITFOR\b|\bBENCHMARK\b|
    \bINFORMATION_SCHEMA\b|\bSYSTEM_USER\b|\bCURRENT_USER\b
    )""",
    re.VERBOSE | re.IGNORECASE,
)

DANGEROUS_CHARS = re.compile(r"""[\x00-\x08\x0B\x0C\x0E-\x1F\x7F<>"'`;\\]""")


def sanitize_input(value: Optional[str]) -> Optional[str]:
    """Strip and sanitize user input against SSTI, SQLi, and XSS patterns."""
    if not value:
        return value
    value = value.strip()
    # Block template injection patterns
    if SSTI_PATTERNS.search(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Input contains forbidden template syntax.",
        )
    # Block obvious SQL injection keywords (defense-in-depth — ORM is primary protection)
    if SQL_INJECTION_PATTERNS.search(value.upper()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Input contains forbidden SQL keywords.",
        )
    return value


def sanitize_strict(value: Optional[str]) -> Optional[str]:
    """Sanitize and strip dangerous control characters."""
    if not value:
        return value
    value = sanitize_input(value)
    value = DANGEROUS_CHARS.sub("", value)
    return value


# ─── #2: ReDoS-Safe Regex Helpers ───

# Safe email regex: no nested quantifiers, bounded length, catastrophic backtracking prevented
SAFE_EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}"
    r"@"
    r"[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)

SAFE_ALPHANUMERIC_RE = re.compile(r"^[a-zA-Z0-9 _.-]{1,255}$")

# ─── #3: LPDOS Protection — Field Length Limits ───

MAX_EMAIL_LEN = 254
MAX_NAME_LEN = 255
MAX_PASSWORD_LEN = 128
MAX_MESSAGE_LEN = 5000
MAX_PRODUCT_ID_LEN = 64
MAX_SESSION_ID_LEN = 255
MAX_EVENT_TYPE_LEN = 64
MAX_PAGE_LEN = 512
MAX_USER_ID_LEN = 255
MAX_COMPANY_LEN = 255
MAX_SERVICE_LEN = 255


def validate_length(value: Optional[str], max_len: int, field_name: str) -> str:
    """Validate string length, raising on overflow (LPDOS protection)."""
    if value is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} is required.",
        )
    if len(value) > max_len:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"{field_name} exceeds maximum length of {max_len} characters.",
        )
    return value


# ─── #7: Replay Attack Protection ───

# In-memory store of used nonces (in production, use Redis)
_used_nonces: set[str] = set()


def generate_nonce() -> str:
    """Generate a cryptographic nonce."""
    return secrets.token_hex(32)


def generate_payload_signature(payload: str, timestamp: int, nonce: str) -> str:
    """HMAC-sign a payload with timestamp + nonce to prevent replay."""
    message = f"{timestamp}:{nonce}:{payload}"
    return hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def verify_nonce(nonce: str, timestamp: int) -> bool:
    """Verify a nonce hasn't been used and is within expiry window."""
    now = int(time.time())
    if now - timestamp > settings.NONCE_EXPIRY_SECONDS:
        logger.warning(f"Replay attack detected: expired timestamp {timestamp}")
        return False
    if timestamp > now + 60:
        logger.warning(f"Replay attack detected: future timestamp {timestamp}")
        return False
    if nonce in _used_nonces:
        logger.warning(f"Replay attack detected: reused nonce {nonce[:16]}...")
        return False
    _used_nonces.add(nonce)
    return True


def verify_payload_signature(
    payload: str, timestamp: int, nonce: str, signature: str
) -> bool:
    """Verify HMAC signature for payload authenticity and integrity."""
    if not verify_nonce(nonce, timestamp):
        return False
    expected = generate_payload_signature(payload, timestamp, nonce)
    return hmac.compare_digest(expected, signature)


# ─── Rate Limiting Key by IP + Route ───

def get_route_specific_key(request: Request) -> str:
    """Create a rate-limit key combining IP and route."""
    ip = request.client.host if request.client else "unknown"
    return f"{ip}:{request.url.path}"


# ─── Request Body Size Middleware ───

MAX_BODY_PER_ROUTE: dict[str, int] = {
    "/api/auth/signup": 2048,
    "/api/auth/login": 2048,
    "/api/contact/leads": 4096,
    "/api/ai/chat": 10240,
    "/api/ai/chat-enhanced": 10240,
    "/api/ai/lead-info": 2048,
    "/api/ai/handoff": 1024,
    "/api/ai/book-call": 2048,
    "/api/ai/follow-up": 2048,
    "/api/payments/create-order": 1024,
    "/api/payments/verify-payment": 1024,
    "/api/analytics/track": 4096,
}


async def limit_body_size(request: Request):
    """Reject requests with bodies larger than the per-route limit (LPDOS + body flood)."""
    body = await request.body()
    size = len(body)
    route_limit = None
    for path, limit in MAX_BODY_PER_ROUTE.items():
        if request.url.path.startswith(path):
            route_limit = limit
            break
    if route_limit is None:
        route_limit = settings.MAX_REQUEST_BODY_SIZE
    if size > route_limit:
        logger.warning(
            f"Body size exceeded for {request.method} {request.url.path}: "
            f"{size} bytes (limit {route_limit})"
        )
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Request body too large. Maximum allowed: {route_limit} bytes.",
        )
