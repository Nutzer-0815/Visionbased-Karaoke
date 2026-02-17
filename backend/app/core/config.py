from __future__ import annotations

import os

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Face Karaoke AI"
    allowed_origins: list[str]
    log_level: str = "INFO"


def load_settings() -> Settings:
    origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
    allowed_origins = [origin.strip() for origin in origins.split(",") if origin.strip()]
    return Settings(
        app_name=os.getenv("APP_NAME", "Face Karaoke AI"),
        allowed_origins=allowed_origins,
        log_level=os.getenv("LOG_LEVEL", "INFO"),
    )

