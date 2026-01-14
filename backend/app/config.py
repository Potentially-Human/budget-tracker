from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Budget Tracker API"
    DEBUG: bool = False
    
    # Database - SQLite 
    DATABASE_URL: str = "sqlite:///./budget_tracker.db"
    
    # Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # APIs
    ANTHROPIC_API_KEY: str
    OPENAI_API_KEY: str
    
    # Opik
    OPIK_API_KEY: str
    OPIK_WORKSPACE: str
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()