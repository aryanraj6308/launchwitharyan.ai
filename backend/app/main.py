import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.database import create_tables
from app.routers import ai, auth, payments, contact, analytics, admin
from app.security import limit_body_size

# ─── Logging ───
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)s │ %(name)s │ %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("launchwitharyan")

# ─── Rate Limiter ───
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ─── Startup / Shutdown lifecycle ───
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 LaunchWithAryan AI Backend starting up...")
    create_tables()

    # #4: Warn about default/placeholder secrets
    secret_warnings = settings.check_secrets()
    for w in secret_warnings:
        logger.warning(f"⚠️  {w}")
    if not secret_warnings:
        logger.info("✅ No secret key warnings.")

    yield
    logger.info("👋 Shutting down gracefully.")


# ─── FastAPI App ───
app = FastAPI(
    title="LaunchWithAryan AI — Backend API",
    description=(
        "Production-grade REST API for the LaunchWithAryan AI Agency Platform. "
        "Handles authentication, AI chat routing (OpenAI/Ollama), "
        "Razorpay payments, lead capture, and analytics tracking."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ─── Rate Limiting Middleware ───
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── #3 LPDOS + Body Size Limit Middleware ───
@app.middleware("http")
async def body_size_middleware(request: Request, call_next):
    await limit_body_size(request)
    response = await call_next(request)
    return response


# ─── Request Timing Middleware ───
@app.middleware("http")
async def log_request_time(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration_ms:.1f}ms)")
    response.headers["X-Process-Time-Ms"] = f"{duration_ms:.1f}"
    return response


# ─── Security Headers Middleware (Helmet-style) ───
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    # Prevent MIME-type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    # Block framing (clickjacking)
    response.headers["X-Frame-Options"] = "DENY"
    # Enable XSS filter in legacy browsers
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # HSTS — force HTTPS for 1 year
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    # Disable caching of API responses
    response.headers["Cache-Control"] = "no-store, max-age=0"
    response.headers["Pragma"] = "no-cache"
    # Referrer policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Permissions policy — restrict browser features
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    # Cross-Origin-Embedder-Policy
    response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    return response


# ─── Health Check ───
@app.get("/api/health", tags=["System"])
async def health():
    return {
        "status": "healthy",
        "service": "LaunchWithAryan AI Backend",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


# ─── Routers ───
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(payments.router)
app.include_router(contact.router)
app.include_router(analytics.router)
app.include_router(admin.router)
