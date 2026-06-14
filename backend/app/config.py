from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/launchwitharyan"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    # Auth
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # AI
    OPENAI_API_KEY: str = ""
    OLLAMA_URL: str = "http://localhost:11434"
    GROQ_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:4321,https://launchwitharyan.ai"

    # Downloads
    DOWNLOADS_DIR: str = ""  # Path to ZIP files; empty = ../frontend/public/downloads relative to backend

    # Environment
    ENVIRONMENT: str = "development"

    # Replay attack protection
    NONCE_EXPIRY_SECONDS: int = 300  # 5 minutes
    MAX_REQUEST_BODY_SIZE: int = 10_000  # 10KB default max body

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"

    def check_secrets(self) -> list[str]:
        """Return warnings for any missing or default placeholder secrets."""
        warnings: list[str] = []
        if not self.SECRET_KEY:
            warnings.append("SECRET_KEY is empty! Set a strong random key in .env for production.")
        if not self.RAZORPAY_KEY_ID:
            warnings.append("RAZORPAY_KEY_ID is empty! Razorpay payments will fail without it.")
        if not self.RAZORPAY_KEY_SECRET:
            warnings.append("RAZORPAY_KEY_SECRET is empty! Razorpay signature verification will fail.")
        if self.ENVIRONMENT == "production" and not self.SECRET_KEY:
            warnings.append("CRITICAL: Running in production mode with an empty SECRET_KEY!")
        return warnings


settings = Settings()
