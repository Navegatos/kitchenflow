"""Consultas analíticas: `Dashboard`, `Finance`, `Reports`."""


from uuid import UUID

from fastapi import HTTPException


def dashboard_summary(now=None) -> dict:
    """
    Esperado:
    - KPI agregados: ventas hoy/semana, mermas, productos bajo stock, pedidos pendientes.
    """
    raise HTTPException(status_code=501, detail="dashboard_summary: pendiente")


def financial_daily_range(*, from_date, to_date) -> list:
    """
    Esperado:
    - Por día: ingreso (órdenes `DELIVERED` o según política),
      costo de lo vendido (desde ingredientes de recetas),
      mermas, utilidad aproximada (similar a `DailyFinancial` del mock).
    """
    raise HTTPException(status_code=501, detail="financial_daily_range: pendiente")


def export_report_csv(kind: str, *, from_date, to_date) -> bytes:
    """
    Esperado:
    - `kind` ∈ { inventory, sales, waste, orders }.
    - Generar CSV en memoria para descarga desde `Reports`.
    """
    raise HTTPException(status_code=501, detail="export_report_csv: pendiente")


def recipe_margin_ranking(limit: int = 20) -> list:
    """
    Esperado: Listar recetas ordenadas por margen (usa `estimate_recipe_cost` lógica).
    """
    raise HTTPException(status_code=501, detail="recipe_margin_ranking: pendiente")


def supplier_spend_summary(supplier_id: UUID | None = None) -> list:
    """
    Esperado:
    - Estimar compras por proveedor vía movimientos `IN` y `cost_price` o integración futura
      con facturas (no existe tabla hoy → agregación desde movimientos).
    """
    raise HTTPException(status_code=501, detail="supplier_spend_summary: pendiente")
