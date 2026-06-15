import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.config import settings
from app.database import get_db, User, Order, Payment, Download, Lead, SupportRequest
from app.schemas import (
    AdminOrderResponse,
    AdminPaymentResponse,
    AdminDashboardStats,
    SupportRequestCreate,
    SupportRequestResponse,
    UserResponse,
)
from app.routers.auth import get_current_user, oauth2_scheme

logger = logging.getLogger("launchwitharyan.admin")

router = APIRouter(prefix="/api/admin", tags=["Admin"])
limiter = Limiter(key_func=get_remote_address)


async def require_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = await get_current_user(token, db)
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return user


@router.get("/stats", response_model=AdminDashboardStats)
@limiter.limit("20/minute")
async def dashboard_stats(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    paid_orders = db.query(func.count(Order.id)).filter(Order.status == "paid").scalar() or 0
    failed_orders = db.query(func.count(Order.id)).filter(Order.status == "failed").scalar() or 0
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == "pending").scalar() or 0

    revenue = db.query(func.coalesce(func.sum(Order.amount), 0)).filter(
        Order.status == "paid"
    ).scalar() or 0.0

    total_downloads = db.query(func.count(Download.id)).scalar() or 0

    recent = db.query(Order).order_by(desc(Order.created_at)).limit(10).all()
    recent_orders = []
    for o in recent:
        user_email = None
        if o.user_id:
            u = db.query(User).filter(User.id == o.user_id).first()
            if u:
                user_email = u.email
        recent_orders.append(AdminOrderResponse(
            id=o.id,
            user_id=o.user_id,
            user_email=user_email,
            product_id=o.product_id,
            product_name=o.product_name,
            amount=o.amount,
            currency=o.currency,
            razorpay_order_id=o.razorpay_order_id,
            razorpay_payment_id=o.razorpay_payment_id,
            status=o.status,
            created_at=str(o.created_at) if o.created_at else None,
        ))

    return AdminDashboardStats(
        total_users=total_users,
        total_orders=total_orders,
        total_revenue=revenue,
        paid_orders=paid_orders,
        failed_orders=failed_orders,
        pending_orders=pending_orders,
        total_downloads=total_downloads,
        recent_orders=recent_orders,
    )


@router.get("/orders", response_model=list[AdminOrderResponse])
@limiter.limit("20/minute")
async def list_orders(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    orders = db.query(Order).order_by(desc(Order.created_at)).all()
    result = []
    for o in orders:
        user_email = None
        if o.user_id:
            u = db.query(User).filter(User.id == o.user_id).first()
            if u:
                user_email = u.email
        result.append(AdminOrderResponse(
            id=o.id,
            user_id=o.user_id,
            user_email=user_email,
            product_id=o.product_id,
            product_name=o.product_name,
            amount=o.amount,
            currency=o.currency,
            razorpay_order_id=o.razorpay_order_id,
            razorpay_payment_id=o.razorpay_payment_id,
            status=o.status,
            created_at=str(o.created_at) if o.created_at else None,
        ))
    return result


@router.get("/payments", response_model=list[AdminPaymentResponse])
@limiter.limit("20/minute")
async def list_payments(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    payments = db.query(Payment).order_by(desc(Payment.created_at)).all()
    return [
        AdminPaymentResponse(
            id=p.id,
            user_id=p.user_id,
            order_id=p.order_id,
            razorpay_order_id=p.razorpay_order_id,
            razorpay_payment_id=p.razorpay_payment_id,
            amount=p.amount,
            currency=p.currency,
            status=p.status,
            method=p.method,
            error_code=p.error_code,
            created_at=str(p.created_at) if p.created_at else None,
        )
        for p in payments
    ]


@router.get("/users", response_model=list[UserResponse])
@limiter.limit("20/minute")
async def list_users(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    users = db.query(User).order_by(desc(User.created_at)).all()
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            is_active=u.is_active,
            is_admin=u.is_admin,
            created_at=str(u.created_at) if u.created_at else None,
        )
        for u in users
    ]


@router.get("/leads")
@limiter.limit("20/minute")
async def list_leads(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    leads = db.query(Lead).order_by(desc(Lead.created_at)).all()
    return leads


@router.get("/downloads")
@limiter.limit("20/minute")
async def list_downloads(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    downloads = db.query(Download).order_by(desc(Download.downloaded_at)).limit(50).all()
    return [
        {
            "id": d.id,
            "user_id": d.user_id,
            "product_id": d.product_id,
            "ip_address": d.ip_address,
            "downloaded_at": str(d.downloaded_at) if d.downloaded_at else None,
        }
        for d in downloads
    ]


@router.get("/support", response_model=list[SupportRequestResponse])
@limiter.limit("20/minute")
async def list_support_requests(
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    requests = db.query(SupportRequest).order_by(desc(SupportRequest.created_at)).all()
    return [
        SupportRequestResponse(
            id=r.id,
            email=r.email,
            subject=r.subject,
            message=r.message,
            status=r.status,
            created_at=str(r.created_at) if r.created_at else None,
        )
        for r in requests
    ]


@router.patch("/support/{request_id}/status")
@limiter.limit("20/minute")
async def update_support_status(
    request: Request,
    request_id: str,
    status_value: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    sr = db.query(SupportRequest).filter(SupportRequest.id == request_id).first()
    if not sr:
        raise HTTPException(status_code=404, detail="Support request not found.")
    sr.status = status_value
    db.commit()
    return {"status": "ok"}
