"""Pedidos y líneas."""

from uuid import UUID

from fastapi import APIRouter, Query

from app.services import orders_service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("")
def list_orders(
    status: str | None = Query(None),
) -> list:
    return orders_service.list_orders(status=status)


@router.get("/{order_id}")
def get_order(order_id: UUID) -> dict:
    return orders_service.get_order(order_id)


@router.post("")
def create_order(body: dict) -> dict:
    """
    Cuerpo: created_by (opcional), notes, items: [{recipe_id, quantity}, ...].
    """
    items = body.get("items", [])
    return orders_service.create_order_with_items(
        created_by=UUID(body["created_by"]) if body.get("created_by") else None,
        notes=body.get("notes"),
        items=items,
    )


@router.patch("/{order_id}/status")
def patch_status(order_id: UUID, body: dict) -> dict:
    return orders_service.update_order_status(
        order_id,
        body["status"],
        actor_user_id=UUID(body["actor_user_id"]) if body.get("actor_user_id") else None,
    )
