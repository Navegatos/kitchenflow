"""Configuración leída de variables de entorno (Compose inyecta DATABASE_URL)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = (
        "postgresql+psycopg://kitchenflow:kitchenflow@localhost:5432/kitchenflow"
    )
    """URL SQLAlchemy/async futura (psycopg v3). Aún no usada por los stubs."""

    cors_origins: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:3000"
    )


def get_settings() -> Settings:
    return Settings()
