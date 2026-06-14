from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/launchwitharyan"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    # Auth
    SECRET_KEY: str = "change-me-to-a-random-256-bit-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder"
    RAZORPAY_KEY_SECRET: str = "placeholder_secret"

    # AI
    OPENAI_API_KEY: str = ""
    OLLAMA_URL: str = "http://localhost:11434"
    GROQ_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:4321,https://launchwitharyan.ai"

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
        """Return warnings for any default/placeholder secrets."""
        warnings: list[str] = []
        if "change-me" in self.SECRET_KEY.lower() or self.SECRET_KEY == "change-me-to-a-random-256-bit-secret":
            warnings.append("SECRET_KEY is still set to the default placeholder! Generate a strong random key for production.")
        if "placeholder" in self.RAZORPAY_KEY_SECRET.lower():
            warnings.append("RAZORPAY_KEY_SECRET is still set to the default placeholder!")
        if self.OPENAI_API_KEY and self.OPENAI_API_KEY.startswith("sk-proj-your"):
            warnings.append("OPENAI_API_KEY is still set to the example placeholder!")
        if self.ENVIRONMENT == "production" and self.SECRET_KEY == "change-me-to-a-random-256-bit-secret":
            warnings.append("CRITICAL: Running in production mode with a default SECRET_KEY!")
        return warnings


settings = Settings()
