"""Recetas e ingredientes."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.products_catalog_model import Product
from app.models.recipes_model import Recipe, RecipeIngredient, RecipeStatus
from app.services.serializers import decimal_str, dt_iso, enum_val, parse_uuid, uuid_str


def _ingredient_line_to_dict(line: RecipeIngredient, product: Product | None = None) -> dict:
    return {
        "id": uuid_str(line.id),
        "product_id": uuid_str(line.product_id),
        "product_name": product.name if product else None,
        "quantity": decimal_str(line.quantity),
        "unit": product.unit if product else None,
    }


def _recipe_to_dict(recipe: Recipe, *, ingredients: list[dict] | None = None) -> dict:
    data = {
        "id": uuid_str(recipe.id),
        "name": recipe.name,
        "description": recipe.description,
        "preparation_time_minutes": recipe.preparation_time_minutes,
        "sale_price": decimal_str(recipe.sale_price),
        "status": enum_val(recipe.status),
        "created_by": uuid_str(recipe.created_by),
        "created_at": dt_iso(recipe.created_at),
        "updated_at": dt_iso(recipe.updated_at),
    }
    if ingredients is not None:
        data["ingredients"] = ingredients
    return data


def _parse_recipe_status(status: str) -> RecipeStatus:
    try:
        return RecipeStatus(status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="status inválido") from exc


def _load_ingredients(db: Session, recipe_id: UUID) -> list[dict]:
    rows = (
        db.query(RecipeIngredient, Product)
        .join(Product, RecipeIngredient.product_id == Product.id)
        .filter(RecipeIngredient.recipe_id == recipe_id)
        .all()
    )
    return [_ingredient_line_to_dict(line, product) for line, product in rows]


def list_recipes(
    db: Session,
    *,
    status: str | None = None,
    search: str | None = None,
) -> list:
    q = db.query(Recipe)
    if status is not None:
        q = q.filter(Recipe.status == _parse_recipe_status(status))
    if search:
        q = q.filter(Recipe.name.ilike(f"%{search}%"))
    recipes = q.order_by(Recipe.name).all()
    return [
        _recipe_to_dict(r, ingredients=_load_ingredients(db, r.id))
        for r in recipes
    ]


def get_recipe(db: Session, recipe_id: UUID) -> dict:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return _recipe_to_dict(recipe, ingredients=_load_ingredients(db, recipe_id))


def create_recipe(
    db: Session,
    *,
    name: str,
    description: str | None,
    preparation_time_minutes: int | None,
    sale_price: Decimal,
    created_by: UUID | None,
    status: str = "ACTIVE",
) -> dict:
    recipe = Recipe(
        name=name,
        description=description,
        preparation_time_minutes=preparation_time_minutes,
        sale_price=sale_price,
        created_by=created_by,
        status=_parse_recipe_status(status),
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return _recipe_to_dict(recipe, ingredients=[])


def update_recipe(
    db: Session,
    recipe_id: UUID,
    *,
    name: str | None = None,
    description: str | None = None,
    preparation_time_minutes: int | None = None,
    sale_price: Decimal | None = None,
    status: str | None = None,
) -> dict:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    if name is not None:
        recipe.name = name
    if description is not None:
        recipe.description = description
    if preparation_time_minutes is not None:
        recipe.preparation_time_minutes = preparation_time_minutes
    if sale_price is not None:
        recipe.sale_price = sale_price
    if status is not None:
        recipe.status = _parse_recipe_status(status)

    db.commit()
    db.refresh(recipe)
    return get_recipe(db, recipe_id)


def replace_recipe_ingredients(
    db: Session,
    recipe_id: UUID,
    lines: list[dict],
    *,
    unit_validation: bool = True,
) -> list:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == recipe_id).delete()

    for line in lines:
        product_id = parse_uuid(line["product_id"])
        quantity = Decimal(str(line["quantity"]))
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="quantity debe ser mayor a 0")
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado en ingredientes")
        db.add(
            RecipeIngredient(
                recipe_id=recipe_id,
                product_id=product_id,
                quantity=quantity,
            )
        )

    db.commit()
    return _load_ingredients(db, recipe_id)


def list_menu_recipes(db: Session) -> list:
    recipes = (
        db.query(Recipe)
        .filter(Recipe.status == RecipeStatus.ACTIVE)
        .order_by(Recipe.name)
        .all()
    )
    return [
        {
            "id": uuid_str(r.id),
            "name": r.name,
            "description": r.description,
            "sale_price": decimal_str(r.sale_price),
        }
        for r in recipes
    ]


def estimate_recipe_cost(db: Session, recipe_id: UUID) -> dict:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    rows = (
        db.query(RecipeIngredient, Product)
        .join(Product, RecipeIngredient.product_id == Product.id)
        .filter(RecipeIngredient.recipe_id == recipe_id)
        .all()
    )
    estimated_cost = sum(
        Decimal(str(ing.quantity)) * Decimal(str(product.cost_price))
        for ing, product in rows
    )
    sale = Decimal(str(recipe.sale_price))
    margin = sale - estimated_cost
    margin_pct = (margin / sale * 100) if sale > 0 else Decimal("0")

    return {
        "recipe_id": uuid_str(recipe_id),
        "estimated_cost": decimal_str(estimated_cost),
        "sale_price": decimal_str(sale),
        "margin": decimal_str(margin),
        "margin_percent": str(margin_pct.quantize(Decimal("0.01"))),
    }
