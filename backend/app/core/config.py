import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


def _csv_env(name: str, default: str) -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "PersonaLens API")
    environment: str = os.getenv("ENVIRONMENT", "development")
    api_v1_prefix: str = os.getenv("API_V1_PREFIX", "/api/v1")
    cors_origins: list[str] = None  # type: ignore[assignment]
    database_url: str | None = os.getenv("DATABASE_URL")
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-pro")

    def __post_init__(self) -> None:
        if self.cors_origins is None:
            object.__setattr__(
                self,
                "cors_origins",
                _csv_env("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"),
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()
