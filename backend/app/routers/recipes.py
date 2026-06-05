"""Recetas e ingredientes."""

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.dependency import get_db
from app.services import recipes_service

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("")
def list_recipes(
    status: str | None = Query(None),
    search: str | None = None,
    db: Session = Depends(get_db),
) -> list:
    return recipes_service.list_recipes(db, status=status, search=search)


@router.get("/menu")
def menu(db: Session = Depends(get_db)) -> list:
    return recipes_service.list_menu_recipes(db)


@router.get("/{recipe_id}")
def get_recipe(recipe_id: UUID, db: Session = Depends(get_db)) -> dict:
    return recipes_service.get_recipe(db, recipe_id)


@router.get("/{recipe_id}/cost")
def recipe_cost(recipe_id: UUID, db: Session = Depends(get_db)) -> dict:
    return recipes_service.estimate_recipe_cost(db, recipe_id)


@router.post("")
def create_recipe(body: dict, db: Session = Depends(get_db)) -> dict:
    return recipes_service.create_recipe(
        db,
        name=body["name"],
        description=body.get("description"),
        preparation_time_minutes=body.get("preparation_time_minutes"),
        sale_price=Decimal(str(body["sale_price"])),
        created_by=UUID(body["created_by"]) if body.get("created_by") else None,
        status=body.get("status", "ACTIVE"),
    )


@router.patch("/{recipe_id}")
def patch_recipe(recipe_id: UUID, body: dict, db: Session = Depends(get_db)) -> dict:
    return recipes_service.update_recipe(
        db,
        recipe_id,
        name=body.get("name"),
        description=body.get("description"),
        preparation_time_minutes=body.get("preparation_time_minutes"),
        sale_price=(Decimal(str(body["sale_price"])) if "sale_price" in body else None),
        status=body.get("status"),
    )


@router.put("/{recipe_id}/ingredients")
def put_ingredients(recipe_id: UUID, body: dict, db: Session = Depends(get_db)) -> list:
    lines = body.get("lines", [])
    return recipes_service.replace_recipe_ingredients(db, recipe_id, lines)
