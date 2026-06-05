"""Consultas analíticas y exportaciones."""

import csv
import io
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.inventory_model import InventoryMovement, MovementType
from app.models.orders_model import Order, OrderStatus
from app.models.products_catalog_model import Product, Supplier
from app.models.recipes_model import Recipe
from app.models.waste_model import WasteRecord
from app.services import recipes_service
from app.services.serializers import decimal_str


def _parse_date(value) -> date:
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    return date.fromisoformat(str(value))


def dashboard_summary(db: Session, now=None) -> dict:
    pending_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status.in_([OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY]))
        .scalar()
    )
    low_stock = (
        db.query(func.count(Product.id))
        .filter(Product.active.is_(True), Product.stock <= Product.minimum_stock)
        .scalar()
    )
    waste_count = db.query(func.count(WasteRecord.id)).scalar()
    delivered_revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.status == OrderStatus.DELIVERED)
        .scalar()
    )
    return {
        "pending_orders": pending_orders or 0,
        "products_low_stock": low_stock or 0,
        "waste_records_total": waste_count or 0,
        "delivered_revenue_total": decimal_str(Decimal(str(delivered_revenue or 0))),
    }


def financial_daily_range(db: Session, *, from_date, to_date) -> list:
    start = _parse_date(from_date)
    end = _parse_date(to_date)
    if end < start:
        raise HTTPException(status_code=400, detail="to_date debe ser >= from_date")

    rows = (
        db.query(
            func.date(Order.created_at).label("day"),
            func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
        )
        .filter(
            Order.status == OrderStatus.DELIVERED,
            func.date(Order.created_at) >= start,
            func.date(Order.created_at) <= end,
        )
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )
    return [
        {
            "date": str(day),
            "revenue": decimal_str(Decimal(str(revenue))),
            "waste_cost": "0",
            "estimated_profit": decimal_str(Decimal(str(revenue))),
        }
        for day, revenue in rows
    ]


def recipe_margin_ranking(db: Session, limit: int = 20) -> list:
    recipes = db.query(Recipe).order_by(Recipe.name).limit(limit).all()
    ranking = []
    for recipe in recipes:
        cost_data = recipes_service.estimate_recipe_cost(db, recipe.id)
        ranking.append(
            {
                "recipe_id": cost_data["recipe_id"],
                "recipe_name": recipe.name,
                "estimated_cost": cost_data["estimated_cost"],
                "sale_price": cost_data["sale_price"],
                "margin": cost_data["margin"],
                "margin_percent": cost_data["margin_percent"],
            }
        )
    ranking.sort(key=lambda x: Decimal(x["margin_percent"]), reverse=True)
    return ranking


def supplier_spend_summary(db: Session, supplier_id: UUID | None = None) -> list:
    q = (
        db.query(
            Supplier.id,
            Supplier.name,
            func.coalesce(
                func.sum(InventoryMovement.quantity * Product.cost_price),
                0,
            ).label("spend"),
        )
        .join(Product, Product.supplier_id == Supplier.id)
        .join(InventoryMovement, InventoryMovement.product_id == Product.id)
        .filter(InventoryMovement.movement_type == MovementType.IN)
    )
    if supplier_id is not None:
        q = q.filter(Supplier.id == supplier_id)

    rows = q.group_by(Supplier.id, Supplier.name).order_by(Supplier.name).all()
    return [
        {
            "supplier_id": str(sid),
            "supplier_name": sname,
            "estimated_spend": decimal_str(Decimal(str(spend))),
        }
        for sid, sname, spend in rows
    ]


def export_report_csv(db: Session, kind: str, *, from_date, to_date) -> bytes:
    start = _parse_date(from_date)
    end = _parse_date(to_date)
    allowed = {"inventory", "sales", "waste", "orders"}
    if kind not in allowed:
        raise HTTPException(status_code=400, detail=f"kind debe ser uno de {allowed}")

    buffer = io.StringIO()
    writer = csv.writer(buffer)

    if kind == "orders":
        writer.writerow(["order_number", "status", "total_amount", "created_at"])
        rows = (
            db.query(Order)
            .filter(
                func.date(Order.created_at) >= start,
                func.date(Order.created_at) <= end,
            )
            .order_by(Order.created_at)
            .all()
        )
        for o in rows:
            writer.writerow([o.order_number, o.status.value, o.total_amount, o.created_at])

    elif kind == "waste":
        writer.writerow(["product_id", "quantity", "reason", "created_at"])
        rows = (
            db.query(WasteRecord)
            .filter(
                func.date(WasteRecord.created_at) >= start,
                func.date(WasteRecord.created_at) <= end,
            )
            .all()
        )
        for w in rows:
            writer.writerow([w.product_id, w.quantity, w.reason, w.created_at])

    elif kind == "inventory":
        writer.writerow(["product_id", "movement_type", "quantity", "created_at"])
        rows = (
            db.query(InventoryMovement)
            .filter(
                func.date(InventoryMovement.created_at) >= start,
                func.date(InventoryMovement.created_at) <= end,
            )
            .all()
        )
        for m in rows:
            writer.writerow([m.product_id, m.movement_type.value, m.quantity, m.created_at])

    else:  # sales
        from app.services import orders_service

        rows = orders_service.aggregate_sales_for_report(db, from_date=start, to_date=end)
        writer.writerow(["recipe_id", "recipe_name", "quantity_sold", "revenue"])
        for row in rows:
            writer.writerow(
                [row["recipe_id"], row["recipe_name"], row["quantity_sold"], row["revenue"]]
            )

    return buffer.getvalue().encode("utf-8")
