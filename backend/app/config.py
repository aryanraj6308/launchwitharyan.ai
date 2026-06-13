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

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
