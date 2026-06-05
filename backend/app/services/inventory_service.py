"""Inventario: movimientos de stock y alertas."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.inventory_model import InventoryMovement, MovementType
from app.models.products_catalog_model import Product
from app.services.serializers import decimal_str, dt_iso, enum_val, uuid_str


def _movement_to_dict(
    movement: InventoryMovement,
    *,
    product_name: str | None = None,
    user_email: str | None = None,
) -> dict:
    return {
        "id": uuid_str(movement.id),
        "product_id": uuid_str(movement.product_id),
        "product_name": product_name,
        "user_id": uuid_str(movement.user_id),
        "user_email": user_email,
        "movement_type": enum_val(movement.movement_type),
        "quantity": decimal_str(movement.quantity),
        "previous_stock": decimal_str(movement.previous_stock),
        "new_stock": decimal_str(movement.new_stock),
        "notes": movement.notes,
        "created_at": dt_iso(movement.created_at),
    }


def _parse_movement_type(value: str) -> MovementType:
    try:
        return MovementType(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="movement_type inválido") from exc


def _apply_stock_delta(current: Decimal, movement_type: MovementType, quantity: Decimal) -> Decimal:
    if movement_type == MovementType.IN:
        return current + quantity
    if movement_type in (MovementType.OUT, MovementType.WASTE):
        return current - quantity
    if movement_type == MovementType.ADJUSTMENT:
        return quantity
    raise HTTPException(status_code=400, detail="movement_type no soportado")


def register_inventory_movement(
    db: Session,
    *,
    product_id: UUID,
    actor_user_id: UUID,
    movement_type: str,
    quantity: Decimal,
    notes: str | None = None,
) -> dict:
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="quantity debe ser mayor a 0")

    mtype = _parse_movement_type(movement_type)
    product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    previous = Decimal(str(product.stock))
    new_stock = _apply_stock_delta(previous, mtype, quantity)
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    movement = InventoryMovement(
        product_id=product_id,
        user_id=actor_user_id,
        movement_type=mtype,
        quantity=quantity,
        previous_stock=previous,
        new_stock=new_stock,
        notes=notes,
    )
    product.stock = new_stock
    db.add(movement)
    db.commit()
    db.refresh(movement)
    return _movement_to_dict(movement, product_name=product.name)


def list_inventory_movements(
    db: Session,
    *,
    product_id: UUID | None = None,
    from_date=None,
    to_date=None,
    limit: int = 100,
    offset: int = 0,
) -> list:
    from app.models.user_model import User

    q = (
        db.query(InventoryMovement, Product.name, User.email)
        .join(Product, InventoryMovement.product_id == Product.id)
        .outerjoin(User, InventoryMovement.user_id == User.id)
    )
    if product_id is not None:
        q = q.filter(InventoryMovement.product_id == product_id)
    if from_date is not None:
        q = q.filter(InventoryMovement.created_at >= from_date)
    if to_date is not None:
        q = q.filter(InventoryMovement.created_at <= to_date)

    rows = (
        q.order_by(InventoryMovement.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        _movement_to_dict(m, product_name=pname, user_email=uemail)
        for m, pname, uemail in rows
    ]


def list_products_below_minimum(db: Session) -> list:
    from app.services import catalog_service

    return catalog_service.list_products(db, active_only=True, low_stock=True)
