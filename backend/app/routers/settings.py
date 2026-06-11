"""Configuración global de la aplicación."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependency import get_db
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_settings(db: Session = Depends(get_db)) -> dict:
    return settings_service.get_settings(db)


@router.patch("")
def patch_settings(body: dict, db: Session = Depends(get_db)) -> dict:
    return settings_service.update_settings(db, body)
