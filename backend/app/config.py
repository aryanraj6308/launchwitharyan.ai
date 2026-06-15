from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/aryanforge"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    # Auth
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # AI
    OPENAI_API_KEY: str = ""
    OLLAMA_URL: str = "http://localhost:11434"
    GROQ_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:4321,https://aryanforge.com"

    # Downloads
    DOWNLOADS_DIR: str = ""  # Path to ZIP files; empty = ../frontend/public/downloads relative to backend

    # Email (SMTP)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "aryan@launchwitharyan.ai"
    SMTP_FROM_NAME: str = "Aryan @ AryanForge"

    # Calendar / Scheduling
    CALENDLY_LINK: str = "https://calendly.com/aryanraj6308/discovery-call"
    GOOGLE_CALENDAR_ID: str = ""

    # WhatsApp (Twilio)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""

    # Slack / Notion Webhooks
    SLACK_WEBHOOK_URL: str = ""
    NOTION_API_KEY: str = ""
    NOTION_DATABASE_ID: str = ""

    # Google Sheets (for lead export)
    GOOGLE_SHEETS_CREDENTIALS: str = ""

    # AI Chat Configuration
    AI_MODEL: str = "gpt-4o-mini"
    AI_TEMPERATURE: float = 0.7
    AI_MAX_TOKENS: int = 500
    ENABLE_KNOWLEDGE_RAG: bool = True

    # Flowise
    FLOWISE_API_URL: str = "http://localhost:3000"
    FLOWISE_CHATFLOW_ID: str = ""
    ENABLE_FLOWISE: bool = False

    # Follow-up
    FOLLOW_UP_DELAY_HOURS: int = 2  # send follow-up email 2 hours after lead leaves
    FOLLOW_UP_REMINDER_DAYS: int = 3  # send reminder after 3 days if no response

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
