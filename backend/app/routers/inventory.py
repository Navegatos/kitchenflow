"""Movimientos de inventario."""

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.dependency import get_db
from app.services import inventory_service

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/movements")
def list_movements(
    product_id: UUID | None = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> list:
    return inventory_service.list_inventory_movements(
        db,
        product_id=product_id,
        limit=limit,
        offset=offset,
    )


@router.post("/movements")
def create_movement(body: dict, db: Session = Depends(get_db)) -> dict:
    return inventory_service.register_inventory_movement(
        db,
        product_id=UUID(body["product_id"]),
        actor_user_id=UUID(body["actor_user_id"]),
        movement_type=body["movement_type"],
        quantity=Decimal(str(body["quantity"])),
        notes=body.get("notes"),
    )


@router.get("/alerts/low-stock")
def low_stock(db: Session = Depends(get_db)) -> list:
    return inventory_service.list_products_below_minimum(db)
