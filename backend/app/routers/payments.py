import hmac
import hashlib
import json
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from fastapi.responses import FileResponse
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
    PurchaseRecord,
    PurchaseListResponse,
    TrackDownloadRequest,
    TrackDownloadResponse,
    ConfirmPurchaseRequest,
    ConfirmPurchaseResponse,
)

router = APIRouter(prefix="/api/payments", tags=["Payments"])
limiter = Limiter(key_func=get_remote_address)

DOWNLOAD_BASE = os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "downloads")

# Product catalog (in production this would live in DB)
PRODUCTS = {
    "infinite-agent-web": {"name": "Infinite Agent Astro Template", "price_inr": 999},
    "rag-boilerplate": {"name": "RAG Conversational Boilerplate", "price_inr": 1499},
    "seo-prompt-pack": {"name": "Commercial Intent Prompt Pack", "price_inr": 299},
    "lead-pipeline": {"name": "Lead Ingestion Automation Kit", "price_inr": 699},
}

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
    amount_paise = int(order_request.amount * 100)

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
@limiter.limit("10/minute")
async def verify_payment(
    request: Request,
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
):
    """Verify Razorpay payment signature and mark order as paid."""
    body = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if expected_signature != payload.razorpay_signature:
        order = db.query(Order).filter(
            Order.razorpay_order_id == payload.razorpay_order_id
        ).first()
        if order:
            order.status = "failed"
            db.commit()
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")

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


DOWNLOAD_COUNTS: dict = {pid: 0 for pid in PRODUCTS}


@router.get("/purchases", response_model=PurchaseListResponse)
@limiter.limit("10/minute")
async def list_purchases(
    request: Request,
    session_id: str = Query(None, min_length=8, max_length=128),
    db: Session = Depends(get_db),
):
    """Return purchases for a specific session. Requires session_id to prevent data leak."""
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required.")
    orders = db.query(Order).filter(
        Order.user_id == session_id,
        Order.status == "paid",
    ).order_by(Order.created_at.desc()).all()
    return PurchaseListResponse(
        purchases=[
            PurchaseRecord(
                id=o.id,
                product_id=o.product_id,
                product_name=o.product_name,
                amount=o.amount,
                status=o.status,
                created_at=str(o.created_at) if o.created_at else None,
            )
            for o in orders
        ]
    )


@router.post("/track-download", response_model=TrackDownloadResponse)
async def track_download(
    payload: TrackDownloadRequest,
    request: Request,
):
    """Track a product download (used by the dashboard download button)."""
    pid = payload.product_id
    if pid not in DOWNLOAD_COUNTS:
        raise HTTPException(status_code=404, detail="Unknown product.")
    DOWNLOAD_COUNTS[pid] += 1
    return TrackDownloadResponse(status="ok", download_count=DOWNLOAD_COUNTS[pid])


@router.post("/confirm-purchase", response_model=ConfirmPurchaseResponse)
@limiter.limit("10/minute")
async def confirm_purchase(
    payload: ConfirmPurchaseRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Confirm a purchase and persist it with session_id so it survives reloads."""
    product = PRODUCTS.get(payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    # Check if already purchased in this session
    existing = db.query(Order).filter(
        Order.product_id == payload.product_id,
        Order.user_id == payload.session_id,
        Order.status == "paid",
    ).first()
    if existing:
        return ConfirmPurchaseResponse(status="already_exists", message="Already purchased.")

    new_order = Order(
        product_id=payload.product_id,
        product_name=product["name"],
        amount=product["price_inr"],
        user_id=payload.session_id,
        status="paid",
    )
    db.add(new_order)
    db.commit()
    return ConfirmPurchaseResponse(status="success", message="Purchase confirmed.")


@router.get("/session-purchases", response_model=PurchaseListResponse)
@limiter.limit("10/minute")
async def session_purchases(
    request: Request,
    session_id: str = Query(..., min_length=8, max_length=128),
    db: Session = Depends(get_db),
):
    """Return all paid purchases for a given browser session_id."""
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required.")
    orders = db.query(Order).filter(
        Order.user_id == session_id,
        Order.status == "paid",
    ).order_by(Order.created_at.desc()).all()
    return PurchaseListResponse(
        purchases=[
            PurchaseRecord(
                id=o.id,
                product_id=o.product_id,
                product_name=o.product_name,
                amount=o.amount,
                status=o.status,
                created_at=str(o.created_at) if o.created_at else None,
            )
            for o in orders
        ]
    )


@router.get("/download/{product_id}")
@limiter.limit("10/minute")
async def download_product(
    request: Request,
    product_id: str,
    session_id: str = Query(None, min_length=8, max_length=128),
    db: Session = Depends(get_db),
):
    """Serve a purchased product's ZIP file for download."""
    if product_id not in PRODUCTS:
        raise HTTPException(status_code=404, detail="Product not found.")

    if session_id:
        owned = db.query(Order).filter(
            Order.product_id == product_id,
            Order.user_id == session_id,
            Order.status == "paid",
        ).first()
        if not owned:
            raise HTTPException(status_code=403, detail="Purchase required before download.")

    download_dir = settings.DOWNLOADS_DIR
    if not download_dir:
        download_dir = os.path.join(
            os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "downloads"
        )
        download_dir = os.path.normpath(download_dir)

    file_path = os.path.join(download_dir, f"{product_id}.zip")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Download file not found on server.")

    DOWNLOAD_COUNTS.setdefault(product_id, 0)
    DOWNLOAD_COUNTS[product_id] += 1

    return FileResponse(
        path=file_path,
        filename=f"{product_id}.zip",
        media_type="application/zip",
        headers={"X-Download-Count": str(DOWNLOAD_COUNTS[product_id])},
    )
