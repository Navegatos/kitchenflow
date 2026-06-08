"""Categorías, proveedores y productos."""

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.dependency import get_db
from app.services import catalog_service

router = APIRouter(tags=["catalog"])


@router.get("/categories")
def categories_list(db: Session = Depends(get_db)) -> list:
    return catalog_service.list_categories(db)


@router.post("/categories")
def categories_create(body: dict, db: Session = Depends(get_db)) -> dict:
    return catalog_service.create_category(
        db,
        name=body["name"],
        description=body.get("description"),
    )


@router.get("/suppliers")
def suppliers_list(
    status: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list:
    return catalog_service.list_suppliers(db, status=status)


@router.post("/suppliers")
def suppliers_create(body: dict, db: Session = Depends(get_db)) -> dict:
    return catalog_service.create_supplier(
        db,
        name=body["name"],
        contact_name=body.get("contact_name"),
        email=body.get("email"),
        phone=body.get("phone"),
        address=body.get("address"),
    )


@router.patch("/suppliers/{supplier_id}/status")
def suppliers_status(supplier_id: UUID, body: dict, db: Session = Depends(get_db)) -> dict:
    return catalog_service.update_supplier_status(db, supplier_id, body["status"])


@router.get("/products")
def products_list(
    category_id: UUID | None = None,
    supplier_id: UUID | None = None,
    active_only: bool = Query(True),
    low_stock: bool | None = None,
    db: Session = Depends(get_db),
) -> list:
    return catalog_service.list_products(
        db,
        category_id=category_id,
        supplier_id=supplier_id,
        active_only=active_only,
        low_stock=low_stock,
    )


@router.get("/products/{product_id}")
def products_get(product_id: UUID, db: Session = Depends(get_db)) -> dict:
    return catalog_service.get_product(db, product_id)


@router.post("/products")
def products_create(body: dict, db: Session = Depends(get_db)) -> dict:
    return catalog_service.create_product(
        db,
        name=body["name"],
        unit=body["unit"],
        cost_price=Decimal(str(body["cost_price"])),
        category_id=body.get("category_id"),
        supplier_id=body.get("supplier_id"),
        sku=body.get("sku"),
        description=body.get("description"),
        minimum_stock=Decimal(str(body.get("minimum_stock", 0))),
        sale_price=(
            Decimal(str(body["sale_price"])) if body.get("sale_price") is not None else None
        ),
        initial_stock=Decimal(str(body.get("initial_stock", 0))),
    )


@router.patch("/products/{product_id}")
def products_patch(product_id: UUID, body: dict, db: Session = Depends(get_db)) -> dict:
    return catalog_service.update_product(
        db,
        product_id,
        name=body.get("name"),
        unit=body.get("unit"),
        cost_price=Decimal(str(body["cost_price"])) if "cost_price" in body else None,
        category_id=body.get("category_id"),
        supplier_id=body.get("supplier_id"),
        sku=body.get("sku"),
        description=body.get("description"),
        minimum_stock=(
            Decimal(str(body["minimum_stock"])) if "minimum_stock" in body else None
        ),
        sale_price=(
            Decimal(str(body["sale_price"])) if body.get("sale_price") is not None else None
        ),
        active=body.get("active"),
    )
