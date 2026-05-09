"""Pedidos: `orders`, `order_items`; enlaza con página `Sales` y flujo cocina/barra."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException


def list_orders(
    *,
    status: str | None = None,
    from_date=None,
    to_date=None,
) -> list:
    """
    Esperado:
    - Listado con ítems (recetas, cantidades, subtotales).
    - `order_number` es SERIAL útil para pantalla tipo ticket.
    """
    raise HTTPException(status_code=501, detail="list_orders: pendiente")


def get_order(order_id: UUID) -> dict:
    """
    Esperado: Pedido completo + ítems o 404.
    """
    raise HTTPException(status_code=501, detail="get_order: pendiente")


def create_order_with_items(
    *,
    created_by: UUID | None,
    notes: str | None,
    items: list[dict],
) -> dict:
    """
    Esperado:
    - `items`: lista de `{ "recipe_id", "quantity" }`.
    - Para cada línea obtener `sale_price` de `recipes` activa, calcular `subtotal`,
      sumar `total_amount`.
    - Insert `orders` + `order_items` en transacción.
    - **Descuento de inventario** (OUT por producto según `recipe_ingredients * quantity`)
      puede hacerse aquí o vía servicio de inventario en el mismo commit.
    """
    raise HTTPException(status_code=501, detail="create_order_with_items: pendiente")


def update_order_status(order_id: UUID, new_status: str, *, actor_user_id: UUID | None = None) -> dict:
    """
    Esperado:
    - Validar transiciones (`PENDING` → `PREPARING` → `READY` → `DELIVERED`/`CANCELLED`).
    - Al cancelar, revertir consumo de inventario si ya se aplicó (regla de negocio).
    """
    raise HTTPException(status_code=501, detail="update_order_status: pendiente")


def aggregate_sales_for_report(
    *,
    from_date=None,
    to_date=None,
    recipe_id: UUID | None = None,
) -> list:
    """
    Esperado:
    - Agrupar ventas reales desde `orders`/`order_items` con joins a `recipes`.
    - Alimenta gráficas tipo `salesRecords` / `dailyFinancials` del mock.
    """
    raise HTTPException(status_code=501, detail="aggregate_sales_for_report: pendiente")


def derive_unit_price_snapshot(recipe_id: UUID) -> Decimal:
    """
    Esperado: Devolver `recipes.sale_price` vigente capturado en el ítem (ya guardado como
    `unit_price` en cada `order_items` — útil helper al crear orden).
    """
    raise HTTPException(status_code=501, detail="derive_unit_price_snapshot: pendiente")
