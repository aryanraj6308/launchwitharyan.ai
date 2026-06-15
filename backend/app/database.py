from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from sqlalchemy.sql import func
import uuid
import os

from app.config import settings

# ─── Engine Setup ───
DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL.startswith("sqlite") or "postgresql" not in DATABASE_URL:
    DATABASE_URL = "sqlite:///./launchwitharyan.db"
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ──────────── MODELS ────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    downloads = relationship("Download", back_populates="user", cascade="all, delete-orphan")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    company = Column(String, nullable=True)
    service = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price_inr = Column(Float, nullable=False)
    price_usd = Column(Float, nullable=True)
    category = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="product_rel", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), nullable=False, index=True)
    product_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    razorpay_order_id = Column(String, nullable=True, unique=True)
    razorpay_payment_id = Column(String, nullable=True)
    razorpay_signature = Column(String, nullable=True)
    status = Column(String, default="pending", index=True)
    payment_method = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    product_rel = relationship("Product", back_populates="orders")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True, index=True)
    razorpay_signature = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, default="pending", index=True)
    method = Column(String, nullable=True)
    bank = Column(String, nullable=True)
    wallet = Column(String, nullable=True)
    vpa = Column(String, nullable=True)
    error_code = Column(String, nullable=True)
    error_description = Column(String, nullable=True)
    webhook_raw = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Download(Base):
    __tablename__ = "downloads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(String, nullable=False, index=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    downloaded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="downloads")


class SupportRequest(Base):
    __tablename__ = "support_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String, nullable=False)
    page = Column(String, nullable=True)
    user_id = Column(String, nullable=True)
    event_metadata = Column("metadata", Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ──────────── DEPENDENCY ────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created/verified.")
    except Exception as e:
        print(f"[WARN] Database not reachable: {e}. Running in offline mode.")
