"""Recetas: `recipes`, `recipe_ingredients`; expone formato compatible con página `Recipes`/`Menu`."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException


def list_recipes(*, status: str | None = None, search: str | None = None) -> list:
    """
    Esperado:
    - Listar recetas con ingredientes anidados (join `recipe_ingredients` + `products`).
    - El mock del front usa `category` de receta; BD no tiene columna:
      se puede derivar de la categoría dominante de ingredientes o añadir migración.
    """
    raise HTTPException(status_code=501, detail="list_recipes: pendiente")


def get_recipe(recipe_id: UUID) -> dict:
    """
    Esperado: Detalle con ingredientes y costo teórico (suma cost_price * cantidad).
    """
    raise HTTPException(status_code=501, detail="get_recipe: pendiente")


def create_recipe(
    *,
    name: str,
    description: str | None,
    preparation_time_minutes: int | None,
    sale_price: Decimal,
    created_by: UUID | None,
    status: str = "ACTIVE",
) -> dict:
    """
    Esperado: Insert en `recipes` sin ingredientes (ingredientes vía función dedicada).
    """
    raise HTTPException(status_code=501, detail="create_recipe: pendiente")


def update_recipe(
    recipe_id: UUID,
    *,
    name: str | None = None,
    description: str | None = None,
    preparation_time_minutes: int | None = None,
    sale_price: Decimal | None = None,
    status: str | None = None,
) -> dict:
    """
    Esperado: Patch de metadata de receta activa/archivada.
    """
    raise HTTPException(status_code=501, detail="update_recipe: pendiente")


def replace_recipe_ingredients(
    recipe_id: UUID,
    lines: list[dict],
    *,
    unit_validation: bool = True,
) -> list:
    """
    Esperado:
    - Borrar/recreate o upsert líneas `recipe_ingredients` dentro de una transacción.
    - Cada línea: `product_id`, `quantity` (unidad viene del producto; validar compatibilidad
      opcionalmente con `unit_validation`).
    """
    raise HTTPException(status_code=501, detail="replace_recipe_ingredients: pendiente")


def list_menu_recipes() -> list:
    """
    Esperado: Recetas `ACTIVE` para la vista `Menu` (precio venta, nombre, descripción).
    """
    raise HTTPException(status_code=501, detail="list_menu_recipes: pendiente")


def estimate_recipe_cost(recipe_id: UUID) -> dict:
    """
    Esperado:
    - Calcular suma(cost_price del producto * cantidad ingrediente).
    - Devolver costo estimado + margen relativo vs `sale_price`.
    """
    raise HTTPException(status_code=501, detail="estimate_recipe_cost: pendiente")
