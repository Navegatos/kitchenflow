"""Recetas e ingredientes."""

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Query

from app.services import recipes_service

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("")
def list_recipes(
    status: str | None = Query(None),
    search: str | None = None,
) -> list:
    return recipes_service.list_recipes(status=status, search=search)


@router.get("/menu")
def menu() -> list:
    return recipes_service.list_menu_recipes()


@router.get("/{recipe_id}")
def get_recipe(recipe_id: UUID) -> dict:
    return recipes_service.get_recipe(recipe_id)


@router.get("/{recipe_id}/cost")
def recipe_cost(recipe_id: UUID) -> dict:
    return recipes_service.estimate_recipe_cost(recipe_id)


@router.post("")
def create_recipe(body: dict) -> dict:
    return recipes_service.create_recipe(
        name=body["name"],
        description=body.get("description"),
        preparation_time_minutes=body.get("preparation_time_minutes"),
        sale_price=Decimal(str(body["sale_price"])),
        created_by=UUID(body["created_by"]) if body.get("created_by") else None,
        status=body.get("status", "ACTIVE"),
    )


@router.patch("/{recipe_id}")
def patch_recipe(recipe_id: UUID, body: dict) -> dict:
    return recipes_service.update_recipe(
        recipe_id,
        name=body.get("name"),
        description=body.get("description"),
        preparation_time_minutes=body.get("preparation_time_minutes"),
        sale_price=(Decimal(str(body["sale_price"])) if "sale_price" in body else None),
        status=body.get("status"),
    )


@router.put("/{recipe_id}/ingredients")
def put_ingredients(recipe_id: UUID, body: dict) -> list:
    """
    body: `{ \"lines\": [ {\"product_id\": \"uuid\", \"quantity\": \"decimal\" }, ... ] }`
    """
    lines = body.get("lines", [])
    return recipes_service.replace_recipe_ingredients(recipe_id, lines)
