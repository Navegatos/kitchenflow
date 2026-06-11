"""Pedidos y líneas."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.orders_model import Order, OrderItem, OrderStatus
from app.models.recipes_model import Recipe, RecipeStatus
from app.services.serializers import decimal_str, dt_iso, enum_val, parse_uuid, uuid_str

_VALID_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.PENDING: {OrderStatus.PREPARING, OrderStatus.CANCELLED},
    OrderStatus.PREPARING: {OrderStatus.READY, OrderStatus.CANCELLED},
    OrderStatus.READY: {OrderStatus.DELIVERED, OrderStatus.CANCELLED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
}


def _parse_order_status(status: str) -> OrderStatus:
    try:
        return OrderStatus(status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="status inválido") from exc


def _order_item_to_dict(item: OrderItem, recipe_name: str | None = None) -> dict:
    return {
        "id": uuid_str(item.id),
        "recipe_id": uuid_str(item.recipe_id),
        "recipe_name": recipe_name,
        "quantity": item.quantity,
        "unit_price": decimal_str(item.unit_price),
        "subtotal": decimal_str(item.subtotal),
    }


def _order_to_dict(order: Order, *, items: list[dict] | None = None) -> dict:
    data = {
        "id": uuid_str(order.id),
        "order_number": order.order_number,
        "status": enum_val(order.status),
        "total_amount": decimal_str(order.total_amount),
        "notes": order.notes,
        "created_by": uuid_str(order.created_by),
        "created_at": dt_iso(order.created_at),
        "updated_at": dt_iso(order.updated_at),
    }
    if items is not None:
        data["items"] = items
    return data


def derive_unit_price_snapshot(db: Session, recipe_id: UUID) -> Decimal:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    if recipe.status != RecipeStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Receta inactiva")
    return Decimal(str(recipe.sale_price))


def _load_order_items(db: Session, order_id: UUID) -> list[dict]:
    rows = (
        db.query(OrderItem, Recipe.name)
        .join(Recipe, OrderItem.recipe_id == Recipe.id)
        .filter(OrderItem.order_id == order_id)
        .all()
    )
    return [_order_item_to_dict(item, rname) for item, rname in rows]


def list_orders(
    db: Session,
    *,
    status: str | None = None,
    from_date=None,
    to_date=None,
) -> list:
    q = db.query(Order)
    if status is not None:
        q = q.filter(Order.status == _parse_order_status(status))
    if from_date is not None:
        q = q.filter(Order.created_at >= from_date)
    if to_date is not None:
        q = q.filter(Order.created_at <= to_date)

    orders = q.order_by(Order.created_at.desc()).all()
    return [
        _order_to_dict(o, items=_load_order_items(db, o.id))
        for o in orders
    ]


def get_order(db: Session, order_id: UUID) -> dict:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return _order_to_dict(order, items=_load_order_items(db, order_id))


def create_order_with_items(
    db: Session,
    *,
    created_by: UUID | None,
    notes: str | None,
    items: list[dict],
) -> dict:
    if not items:
        raise HTTPException(status_code=400, detail="items no puede estar vacío")

    order = Order(notes=notes, created_by=created_by, status=OrderStatus.PENDING)
    db.add(order)
    db.flush()

    total = Decimal("0")
    for raw in items:
        recipe_id = parse_uuid(raw["recipe_id"])
        quantity = int(raw["quantity"])
        if quantity < 1:
            raise HTTPException(status_code=400, detail="quantity debe ser >= 1")

        unit_price = derive_unit_price_snapshot(db, recipe_id)
        subtotal = unit_price * quantity
        total += subtotal
        db.add(
            OrderItem(
                order_id=order.id,
                recipe_id=recipe_id,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal,
            )
        )

    order.total_amount = total
    db.commit()
    db.refresh(order)
    return get_order(db, order.id)


def update_order_status(
    db: Session,
    order_id: UUID,
    new_status: str,
    *,
    actor_user_id: UUID | None = None,
) -> dict:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    target = _parse_order_status(new_status)
    allowed = _VALID_TRANSITIONS.get(order.status, set())
    if target not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Transición no permitida: {order.status.value} → {target.value}",
        )

    order.status = target
    db.commit()
    db.refresh(order)
    return get_order(db, order_id)


def aggregate_sales_for_report(
    db: Session,
    *,
    from_date=None,
    to_date=None,
    recipe_id: UUID | None = None,
) -> list:
    q = (
        db.query(OrderItem, Recipe.name, Order)
        .join(Order, OrderItem.order_id == Order.id)
        .join(Recipe, OrderItem.recipe_id == Recipe.id)
        .filter(Order.status == OrderStatus.DELIVERED)
    )
    if from_date is not None:
        q = q.filter(Order.created_at >= from_date)
    if to_date is not None:
        q = q.filter(Order.created_at <= to_date)
    if recipe_id is not None:
        q = q.filter(OrderItem.recipe_id == recipe_id)

    from app.services import config_service, recipes_service

    totals: dict[tuple[str, str], dict] = {}
    for item, recipe_name, order in q.all():
        key = (str(item.recipe_id), recipe_name)
        if key not in totals:
            recipe = db.query(Recipe).filter(Recipe.id == item.recipe_id).first()
            cost_data = recipes_service.estimate_recipe_cost(db, item.recipe_id)
            unit_cost = Decimal(str(cost_data["estimated_cost"]))
            totals[key] = {
                "recipe_id": str(item.recipe_id),
                "recipe_name": recipe_name,
                "category_id": str(recipe.category_id) if recipe and recipe.category_id else None,
                "category_name": (
                    config_service.get_recipe_category_name(db, recipe.category_id)
                    if recipe
                    else None
                ),
                "unit_cost": unit_cost,
                "quantity_sold": 0,
                "revenue": Decimal("0"),
            }
        totals[key]["quantity_sold"] += item.quantity
        totals[key]["revenue"] += Decimal(str(item.subtotal))

    result = []
    for row in sorted(totals.values(), key=lambda x: x["recipe_name"]):
        qty = row["quantity_sold"]
        revenue = row["revenue"]
        total_cost = row["unit_cost"] * qty
        profit = revenue - total_cost
        margin_pct = (profit / revenue * 100) if revenue > 0 else Decimal("0")
        result.append({
            "recipe_id": row["recipe_id"],
            "recipe_name": row["recipe_name"],
            "category_id": row["category_id"],
            "category_name": row["category_name"],
            "quantity_sold": qty,
            "revenue": decimal_str(revenue),
            "unit_cost": decimal_str(row["unit_cost"]),
            "total_cost": decimal_str(total_cost),
            "profit": decimal_str(profit),
            "margin_percent": str(margin_pct.quantize(Decimal("0.01"))),
        })
    return result
