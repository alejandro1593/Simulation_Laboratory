from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "MolCore Lab API"
    debug: bool = False
    snapshot_version: str = "mvp-v1"

    database_url: str = "sqlite:///./molcore.db"

    jwt_secret: str = "change-me-please"
    jwt_access_ttl_min: int = 15
    jwt_refresh_ttl_days: int = 14
    jwt_algorithm: str = "HS256"

    cors_origins: str = '["http://localhost:5173"]'

    # Rate limit por zona (req/min)
    rate_guest: int = 30
    rate_student: int = 300
    rate_researcher: int = 600

    # Umbral (ms) para render 3D por RDKit; si no está instalado se degrada a null
    builder_3d_enabled: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()