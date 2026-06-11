"""Catálogos: sucursales, categorías de receta, unidades, motivos de merma, opciones."""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.config_model import (
    LookupOption,
    ProductUnit,
    RecipeCategory,
    WasteReason,
)
from app.models.user_model import Branch
from app.services.serializers import uuid_str


def list_branches(db: Session, *, active_only: bool = True) -> list:
    q = db.query(Branch)
    if active_only:
        q = q.filter(Branch.active.is_(True))
    return [
        {
            "id": uuid_str(b.id),
            "name": b.name,
            "address": b.address,
            "phone": b.phone,
            "active": b.active,
        }
        for b in q.order_by(Branch.name).all()
    ]


def get_branch_name(db: Session, branch_id: UUID | None) -> str | None:
    if not branch_id:
        return None
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    return branch.name if branch else None


def list_recipe_categories(db: Session, *, active_only: bool = True) -> list:
    q = db.query(RecipeCategory)
    if active_only:
        q = q.filter(RecipeCategory.active.is_(True))
    return [
        {
            "id": uuid_str(c.id),
            "name": c.name,
            "sort_order": c.sort_order,
            "active": c.active,
        }
        for c in q.order_by(RecipeCategory.sort_order, RecipeCategory.name).all()
    ]


def get_recipe_category_name(db: Session, category_id: UUID | None) -> str | None:
    if not category_id:
        return None
    cat = db.query(RecipeCategory).filter(RecipeCategory.id == category_id).first()
    return cat.name if cat else None


def list_product_units(db: Session, *, active_only: bool = True) -> list:
    q = db.query(ProductUnit)
    if active_only:
        q = q.filter(ProductUnit.active.is_(True))
    return [
        {
            "id": uuid_str(u.id),
            "code": u.code,
            "label": u.label,
            "sort_order": u.sort_order,
            "active": u.active,
        }
        for u in q.order_by(ProductUnit.sort_order, ProductUnit.code).all()
    ]


def validate_product_unit(db: Session, unit_code: str) -> str:
    row = (
        db.query(ProductUnit)
        .filter(ProductUnit.code == unit_code, ProductUnit.active.is_(True))
        .first()
    )
    if not row:
        raise HTTPException(status_code=400, detail=f"Unidad '{unit_code}' no válida")
    return row.code


def list_waste_reasons(db: Session, *, active_only: bool = True) -> list:
    q = db.query(WasteReason)
    if active_only:
        q = q.filter(WasteReason.active.is_(True))
    return [
        {
            "id": uuid_str(r.id),
            "name": r.name,
            "sort_order": r.sort_order,
            "active": r.active,
        }
        for r in q.order_by(WasteReason.sort_order, WasteReason.name).all()
    ]


def validate_waste_reason(db: Session, reason: str) -> str:
    row = (
        db.query(WasteReason)
        .filter(WasteReason.name == reason, WasteReason.active.is_(True))
        .first()
    )
    if not row:
        raise HTTPException(status_code=400, detail=f"Motivo de merma '{reason}' no válido")
    return row.name


def list_lookup_options(db: Session, group_key: str | None = None) -> list | dict:
    q = db.query(LookupOption)
    if group_key:
        q = q.filter(LookupOption.group_key == group_key)
    rows = q.order_by(LookupOption.group_key, LookupOption.sort_order).all()
    if group_key:
        return [
            {"value": r.value, "label": r.label, "sort_order": r.sort_order}
            for r in rows
        ]
    grouped: dict[str, list] = {}
    for row in rows:
        grouped.setdefault(row.group_key, []).append(
            {"value": row.value, "label": row.label, "sort_order": row.sort_order}
        )
    return grouped
