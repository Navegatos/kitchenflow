"""Inventario: `inventory_movements` y reglas de stock en `products`."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException


def list_inventory_movements(
    *,
    product_id: UUID | None = None,
    from_date=None,
    to_date=None,
    limit: int = 100,
    offset: int = 0,
) -> list:
    """
    Esperado:
    - Historial de movimientos con join a `users` y `products`.
    - Mapear `movement_type` BD (IN, OUT, ADJUSTMENT, WASTE) a etiquetas del front
      (`purchase`, `usage`, `waste`, `adjustment`) si se desea compatibilidad con `mockData`.
    """
    raise HTTPException(status_code=501, detail="list_inventory_movements: pendiente")


def register_inventory_movement(
    *,
    product_id: UUID,
    actor_user_id: UUID,
    movement_type: str,
    quantity: Decimal,
    notes: str | None = None,
) -> dict:
    """
    Esperado:
    - Leer `products.stock` actual (bloqueo pesimista/optimista).
    - Calcular `previous_stock`, `new_stock` según tipo:
      - IN: aumenta stock.
      - OUT: descuenta (producción, venta no modelada aquí — ver órdenes).
      - ADJUSTMENT/WASTE según política del negocio.
    - Insert en `inventory_movements` **y** update atómico de `products.stock`.
    - Opcionalmente, para desechos grandes delegar también en `waste_records`.
    """
    raise HTTPException(status_code=501, detail="register_inventory_movement: pendiente")


def list_products_below_minimum() -> list:
    """
    Esperado: Lista de alertas tipo dashboard (`inventory` / `reports`).
    """
    raise HTTPException(status_code=501, detail="list_products_below_minimum: pendiente")
