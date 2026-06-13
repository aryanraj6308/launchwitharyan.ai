import hmac
import hashlib
import json

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, Order
from app.schemas import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)

router = APIRouter(prefix="/api/payments", tags=["Payments"])
limiter = Limiter(key_func=get_remote_address)

# Product catalog (in production this would live in DB)
PRODUCTS = {
    "infinite-agent-web": {"name": "Infinite Agent Astro Template", "price_usd": 49},
    "rag-boilerplate": {"name": "RAG Conversational Boilerplate", "price_usd": 79},
    "seo-prompt-pack": {"name": "Commercial Intent Prompt Pack", "price_usd": 19},
    "lead-pipeline": {"name": "Lead Ingestion Automation Kit", "price_usd": 39},
}

USD_TO_INR = 85  # Approximate conversion rate


@router.post("/create-order", response_model=CreateOrderResponse)
@limiter.limit("10/minute")
async def create_order(
    request: Request,
    order_request: CreateOrderRequest,
    db: Session = Depends(get_db),
):
    """Create a Razorpay order for a product purchase."""
    product = PRODUCTS.get(order_request.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    # Amount in paise (INR * 100)
    amount_inr = int(order_request.amount * USD_TO_INR)
    amount_paise = amount_inr * 100

    try:
        import razorpay
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        rzp_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"receipt_{order_request.product_id}",
            "notes": {
                "product_id": order_request.product_id,
                "product_name": product["name"],
            }
        })

        # Persist to DB
        new_order = Order(
            product_id=order_request.product_id,
            product_name=product["name"],
            amount=order_request.amount,
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
        )

    except ImportError:
        raise HTTPException(status_code=503, detail="Razorpay SDK not installed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order creation failed: {str(e)}")


@router.post("/verify-payment", response_model=VerifyPaymentResponse)
async def verify_payment(
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
):
    """Verify Razorpay payment signature and mark order as paid."""
    # Construct the expected signature
    body = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if expected_signature != payload.razorpay_signature:
        # Mark order as failed
        order = db.query(Order).filter(
            Order.razorpay_order_id == payload.razorpay_order_id
        ).first()
        if order:
            order.status = "failed"
            db.commit()
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")

    # Mark order as paid
    order = db.query(Order).filter(
        Order.razorpay_order_id == payload.razorpay_order_id
    ).first()
    if order:
        order.status = "paid"
        order.razorpay_payment_id = payload.razorpay_payment_id
        db.commit()

    return VerifyPaymentResponse(
        status="success",
        message="Payment verified. Your digital product is now available in the dashboard."
    )
