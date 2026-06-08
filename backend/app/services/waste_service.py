"""Mermas y costo estimado de pérdida."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.products_catalog_model import Product
from app.models.waste_model import WasteRecord
from app.services.serializers import decimal_str, dt_iso, uuid_str


def _waste_to_dict(
    record: WasteRecord,
    *,
    product_name: str | None = None,
    registered_by_email: str | None = None,
) -> dict:
    return {
        "id": uuid_str(record.id),
        "product_id": uuid_str(record.product_id),
        "product_name": product_name,
        "quantity": decimal_str(record.quantity),
        "reason": record.reason,
        "registered_by": uuid_str(record.registered_by),
        "registered_by_email": registered_by_email,
        "created_at": dt_iso(record.created_at),
    }


def list_waste_records(
    db: Session,
    *,
    product_id: UUID | None = None,
    from_date=None,
    to_date=None,
) -> list:
    from app.models.user_model import User

    q = (
        db.query(WasteRecord, Product.name, User.email)
        .join(Product, WasteRecord.product_id == Product.id)
        .outerjoin(User, WasteRecord.registered_by == User.id)
    )
    if product_id is not None:
        q = q.filter(WasteRecord.product_id == product_id)
    if from_date is not None:
        q = q.filter(WasteRecord.created_at >= from_date)
    if to_date is not None:
        q = q.filter(WasteRecord.created_at <= to_date)

    rows = q.order_by(WasteRecord.created_at.desc()).all()
    return [
        _waste_to_dict(r, product_name=pname, registered_by_email=uemail)
        for r, pname, uemail in rows
    ]


def register_waste(
    db: Session,
    *,
    product_id: UUID,
    quantity: Decimal,
    reason: str | None,
    registered_by: UUID | None,
) -> dict:
    from app.models.inventory_model import InventoryMovement, MovementType

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="quantity debe ser mayor a 0")

    product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    previous = Decimal(str(product.stock))
    new_stock = previous - quantity
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Stock insuficiente para registrar merma")

    record = WasteRecord(
        product_id=product_id,
        quantity=quantity,
        reason=reason,
        registered_by=registered_by,
    )
    movement = InventoryMovement(
        product_id=product_id,
        user_id=registered_by,
        movement_type=MovementType.WASTE,
        quantity=quantity,
        previous_stock=previous,
        new_stock=new_stock,
        notes=reason or "Registro de merma",
    )
    product.stock = new_stock
    db.add(record)
    db.add(movement)
    db.commit()
    db.refresh(record)
    return _waste_to_dict(record, product_name=product.name)


def waste_cost_estimate(db: Session, product_id: UUID, quantity: Decimal) -> Decimal:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Decimal(str(product.cost_price)) * quantity
