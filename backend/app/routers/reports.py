"""Reportes financieros y exportaciones."""

from uuid import UUID

from fastapi import APIRouter
from fastapi.responses import Response

from app.services import orders_service, reports_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/dashboard/summary")
def dashboard() -> dict:
    return reports_service.dashboard_summary()


@router.get("/sales-aggregate")
def sales_aggregate() -> list:
    """Agrupa ventas según política de órdenes entregadas (ver `orders_service`)."""
    return orders_service.aggregate_sales_for_report()


@router.get("/finance/daily-range")
def finance_daily_range(from_date: str, to_date: str) -> list:
    """Pasar fechas ISO (YYYY-MM-DD); parse interno cuando exista modelo."""
    return reports_service.financial_daily_range(from_date=from_date, to_date=to_date)


@router.get("/margins/recipes")
def margins(limit: int = 20) -> list:
    return reports_service.recipe_margin_ranking(limit=limit)


@router.get("/suppliers/spend")
def supplier_spend(supplier_id: UUID | None = None) -> list:
    return reports_service.supplier_spend_summary(supplier_id=supplier_id)


@router.get("/export/{kind}")
def export_kind(kind: str, from_date: str, to_date: str) -> Response:
    data = reports_service.export_report_csv(kind, from_date=from_date, to_date=to_date)
    return Response(content=data, media_type="text/csv")
