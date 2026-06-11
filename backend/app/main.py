"""Punto de entrada FastAPI."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db.migrate import run_migrations
from app.routers import (
    auth,
    catalog_config,
    inventory,
    orders,
    permissions,
    products_catalog,
    recipes,
    reports,
    settings,
    users_,
    waste,
)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Arranque/apagado: pool de BD y migraciones SQL pendientes."""
    run_migrations()
    yield


def create_app() -> FastAPI:
    app_settings = get_settings()
    app = FastAPI(
        title="KitchenFlow API",
        version="0.1.0",
        description=(
            "API para el front KitchenFlow contra PostgreSQL (`db/`). "
            "Services implementados con persistencia SQLAlchemy."
        ),
        lifespan=lifespan,
    )

    origins = [o.strip() for o in app_settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(users_.router, prefix="/api/v1")
    app.include_router(products_catalog.router, prefix="/api/v1")
    app.include_router(inventory.router, prefix="/api/v1")
    app.include_router(recipes.router, prefix="/api/v1")
    app.include_router(orders.router, prefix="/api/v1")
    app.include_router(waste.router, prefix="/api/v1")
    app.include_router(reports.router, prefix="/api/v1")
    app.include_router(catalog_config.router, prefix="/api/v1")
    app.include_router(settings.router, prefix="/api/v1")
    app.include_router(permissions.router, prefix="/api/v1")

    @app.get("/health", tags=["system"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
