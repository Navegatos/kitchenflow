"""Mermas (`waste_records`) y página `Waste`."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException


def list_waste_records(
    *,
    product_id: UUID | None = None,
    from_date=None,
    to_date=None,
) -> list:
    """
    Esperado:
    - Listar mermas con joins a `products` y `users` (registrador).
    - Permite vistas similares a `mockData.wasteRecords`.
    """
    raise HTTPException(status_code=501, detail="list_waste_records: pendiente")


def register_waste(
    *,
    product_id: UUID,
    quantity: Decimal,
    reason: str | None,
    registered_by: UUID | None,
) -> dict:
    """
    Esperado:
    - Insert en `waste_records`.
    - Descontar `products.stock` y registrar también `inventory_movements` tipo `WASTE`
      (consistente con el enum `movement_type`).
    Todo en una transacción.
    """
    raise HTTPException(status_code=501, detail="register_waste: pendiente")


def waste_cost_estimate(product_id: UUID, quantity: Decimal) -> Decimal:
    """
    Esperado: Cantidad × `products.cost_price` para mostrar costo de pérdida.
    """
    raise HTTPException(status_code=501, detail="waste_cost_estimate: pendiente")
