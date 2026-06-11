"""Permisos de rutas y funcionalidades."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependency import get_db
from app.services import permissions_service

router = APIRouter(prefix="/permissions", tags=["permissions"])


@router.get("")
def get_permissions(db: Session = Depends(get_db)) -> dict:
    return permissions_service.get_permissions_config(db)
