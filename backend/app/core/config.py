from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "development"

    database_url: str = "postgresql+asyncpg://bloodlink:bloodlink@localhost:5432/bloodlink"
    database_url_sync: str = "postgresql+psycopg2://bloodlink:bloodlink@localhost:5432/bloodlink"

    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    otp_expire_minutes: int = 5
    otp_provider: str = "console"

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
