import hmac
import hashlib
import json
import os
import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import FileResponse, JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.config import settings
from app.database import get_db, Order, Payment, Download, User
from app.schemas import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PurchaseRecord,
    PurchaseListResponse,
    CheckAccessRequest,
    CheckAccessResponse,
)
from app.routers.auth import get_current_user, oauth2_scheme

# Dependency that extracts token first, then gets user
async def get_authenticated_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    return await get_current_user(token, db)

logger = logging.getLogger("aryanforge.payments")

router = APIRouter(prefix="/api/payments", tags=["Payments"])
limiter = Limiter(key_func=get_remote_address)

PRODUCTS = {
    "infinite-agent-web": {"name": "Infinite Agent Astro Template", "price_inr": 999, "category": "Templates"},
    "rag-boilerplate": {"name": "RAG Conversational Boilerplate", "price_inr": 1499, "category": "Automations"},
    "seo-prompt-pack": {"name": "Commercial Intent Prompt Pack", "price_inr": 299, "category": "Prompts"},
    "lead-pipeline": {"name": "Lead Ingestion Automation Kit", "price_inr": 699, "category": "Automations"},
}


def _get_download_dir() -> str:
    d = settings.DOWNLOADS_DIR
    if not d:
        d = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "downloads"))
    return d


def _verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    body = f"{order_id}|{payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def _verify_webhook_signature(request_body: bytes, signature: str) -> bool:
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        logger.warning("RAZORPAY_WEBHOOK_SECRET not set — skipping webhook signature verification")
        return True
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        request_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/create-order", response_model=CreateOrderResponse)
@limiter.limit("10/minute")
async def create_order(
    request: Request,
    order_request: CreateOrderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_authenticated_user),
):
    """Create a Razorpay order. Requires JWT authentication."""
    product = PRODUCTS.get(order_request.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    amount_paise = int(product["price_inr"] * 100)

    try:
        import razorpay
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        rzp_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"receipt_{order_request.product_id}_{uuid.uuid4().hex[:8]}",
            "notes": {
                "product_id": order_request.product_id,
                "product_name": product["name"],
                "user_email": user.email,
                "user_id": user.id,
            }
        })

        new_order = Order(
            user_id=user.id,
            product_id=order_request.product_id,
            product_name=product["name"],
            amount=product["price_inr"],
            currency="INR",
            razorpay_order_id=rzp_order["id"],
            status="pending",
        )
        db.add(new_order)
        db.commit()

        return CreateOrderResponse(
            order_id=rzp_order["id"],
            key_id=settings.RAZORPAY_KEY_ID,
            amount=amount_paise,
            currency="INR",
            product_id=order_request.product_id,
            user_email=user.email,
        )

    except ImportError:
        raise HTTPException(status_code=503, detail="Razorpay SDK not installed.")
    except Exception as e:
        logger.error(f"Order creation failed: {e}")
        raise HTTPException(status_code=500, detail="Order creation failed.")


@router.post("/verify-payment", response_model=VerifyPaymentResponse)
@limiter.limit("10/minute")
async def verify_payment(
    request: Request,
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_authenticated_user),
):
    """Verify Razorpay payment signature and mark order as paid. Requires JWT."""

    # Verify HMAC signature
    if not _verify_razorpay_signature(
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature,
    ):
        # Mark order as failed
        order = db.query(Order).filter(
            Order.razorpay_order_id == payload.razorpay_order_id
        ).first()
        if order:
            order.status = "failed"
            db.commit()
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")

    order = db.query(Order).filter(
        and_(
            Order.razorpay_order_id == payload.razorpay_order_id,
            Order.user_id == user.id,
        )
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found for this user.")

    if order.status == "paid":
        return VerifyPaymentResponse(
            status="already_verified",
            message="Payment was already verified.",
            product_id=order.product_id,
        )

    order.status = "paid"
    order.razorpay_payment_id = payload.razorpay_payment_id
    order.razorpay_signature = payload.razorpay_signature
    db.commit()

    return VerifyPaymentResponse(
        status="success",
        message="Payment verified. Your digital product is now available for download.",
        product_id=order.product_id,
    )


@router.post("/webhook", include_in_schema=False)
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None, alias="X-Razorpay-Signature"),
):
    """Razorpay webhook for server-side payment confirmation.
    Called by Razorpay after payment is captured."""
    body = await request.body()

    if not x_razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing signature header.")

    if not _verify_webhook_signature(body, x_razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body.")

    event = data.get("event", "")
    payment_data = data.get("payload", {}).get("payment", {}).get("entity", {})

    if not payment_data:
        return JSONResponse(status_code=200, content={"status": "ignored"})

    rzp_order_id = payment_data.get("order_id")
    rzp_payment_id = payment_data.get("id")
    status = payment_data.get("status")

    db = next(get_db())
    try:
        if event == "payment.captured" and status == "captured":
            order = db.query(Order).filter(Order.razorpay_order_id == rzp_order_id).first()
            if order and order.status == "pending":
                order.status = "paid"
                order.razorpay_payment_id = rzp_payment_id
                db.commit()

        # Log payment to payments table
        payment_record = Payment(
            user_id=order.user_id if order else None,
            order_id=order.id if order else None,
            razorpay_order_id=rzp_order_id,
            razorpay_payment_id=rzp_payment_id,
            amount=payment_data.get("amount", 0) / 100,
            currency=payment_data.get("currency", "INR"),
            status=status or "captured",
            method=payment_data.get("method"),
            bank=payment_data.get("bank"),
            wallet=payment_data.get("wallet"),
            vpa=payment_data.get("vpa"),
            error_code=payment_data.get("error_code"),
            error_description=payment_data.get("error_description"),
            webhook_raw=data,
        )
        db.add(payment_record)
        db.commit()

    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        db.rollback()
    finally:
        db.close()

    return JSONResponse(status_code=200, content={"status": "ok"})


@router.get("/my-purchases", response_model=PurchaseListResponse)
@limiter.limit("10/minute")
async def my_purchases(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_authenticated_user),
):
    """Return all purchases for the authenticated user."""
    orders = db.query(Order).filter(
        Order.user_id == user.id,
        Order.status == "paid",
    ).order_by(Order.created_at.desc()).all()

    return PurchaseListResponse(
        purchases=[
            PurchaseRecord(
                id=o.id,
                product_id=o.product_id,
                product_name=o.product_name,
                amount=o.amount,
                currency=o.currency,
                status=o.status,
                created_at=str(o.created_at) if o.created_at else None,
            )
            for o in orders
        ]
    )


@router.post("/check-access", response_model=CheckAccessResponse)
@limiter.limit("30/minute")
async def check_access(
    request: Request,
    payload: CheckAccessRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_authenticated_user),
):
    """Check if the authenticated user has purchased a product."""
    product = PRODUCTS.get(payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    order = db.query(Order).filter(
        Order.user_id == user.id,
        Order.product_id == payload.product_id,
        Order.status == "paid",
    ).first()

    return CheckAccessResponse(
        has_access=order is not None,
        product_id=payload.product_id,
        product_name=product["name"],
    )


@router.get("/download/{product_id}")
@limiter.limit("10/minute")
async def download_product(
    request: Request,
    product_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_authenticated_user),
):
    """Serve a purchased product's ZIP file. Requires JWT + paid order."""
    product = PRODUCTS.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    order = db.query(Order).filter(
        Order.user_id == user.id,
        Order.product_id == product_id,
        Order.status == "paid",
    ).first()

    if not order:
        raise HTTPException(
            status_code=403,
            detail="Purchase required before download. Please purchase this product first.",
        )

    download_dir = _get_download_dir()
    file_path = os.path.join(download_dir, f"{product_id}.zip")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Download file not found on server.")

    # Log download
    download_record = Download(
        user_id=user.id,
        product_id=product_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(download_record)
    db.commit()

    return FileResponse(
        path=file_path,
        filename=f"{product_id}.zip",
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{product_id}.zip"',
            "X-Content-Type-Options": "nosniff",
        },
    )
