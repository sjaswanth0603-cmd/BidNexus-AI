import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered GeM Bid Compliance Verification Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "gem_bid_nexus_super_secret_key_sih26100_2026_production_key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./gem_compliance.db")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://admin:admin@ac-sz5cgvx-shard-00-00.dpirl2u.mongodb.net:27017,ac-sz5cgvx-shard-00-01.dpirl2u.mongodb.net:27017,ac-sz5cgvx-shard-00-02.dpirl2u.mongodb.net:27017/?ssl=true&replicaSet=atlas-3ht3ip-shard-0&authSource=admin&appName=Cluster0")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "bidnexus_ai")
    
    # AI API Config (Google Gemini / OpenAI / Fallback)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto")  # gemini, openai, auto, local_fallback
    
    # File Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

    model_config = SettingsConfigDict(case_sensitive=True, extra="ignore")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

