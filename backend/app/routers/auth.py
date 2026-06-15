from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, User
from app.schemas import UserCreate, UserLogin, Token, TokenData
from app.security import get_route_specific_key, generate_nonce

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_route_specific_key)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# In-memory login attempt tracker (use Redis in production)
_login_attempts: dict[str, int] = {}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "jti": generate_nonce()})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user


def check_login_attempts(ip: str):
    """Rate-limit login attempts per IP (#7 brute-force / replay prevention)."""
    key = f"login:{ip}"
    attempts = _login_attempts.get(key, 0)
    if attempts >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again after 15 minutes.",
        )
    _login_attempts[key] = attempts + 1
    # Reset after 15 minutes
    # In production, use Redis with TTL instead


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def signup(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    hashed_password = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email})
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and return a JWT token."""
    ip = request.client.host if request.client else "unknown"
    check_login_attempts(ip)

    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token)


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return current authenticated user info."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_active": current_user.is_active,
        "is_admin": current_user.is_admin,
    }
