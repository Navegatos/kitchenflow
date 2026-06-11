"""Catálogos de configuración: sucursales, unidades, motivos de merma, etc."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.dependency import get_db
from app.services import config_service

router = APIRouter(tags=["catalog-config"])


@router.get("/branches")
def list_branches(
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
) -> list:
    return config_service.list_branches(db, active_only=active_only)


@router.get("/recipe-categories")
def list_recipe_categories(
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
) -> list:
    return config_service.list_recipe_categories(db, active_only=active_only)


@router.get("/product-units")
def list_product_units(
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
) -> list:
    return config_service.list_product_units(db, active_only=active_only)


@router.get("/waste/reasons")
def list_waste_reasons(
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
) -> list:
    return config_service.list_waste_reasons(db, active_only=active_only)


@router.get("/lookup-options")
def list_lookup_options(
    group: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list | dict:
    return config_service.list_lookup_options(db, group_key=group)
