"""Reportes financieros y exportaciones."""

from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db.dependency import get_db
from app.services import orders_service, reports_service

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/dashboard/summary")
def dashboard(db: Session = Depends(get_db)) -> dict:
    return reports_service.dashboard_summary(db)


@router.get("/sales-aggregate")
def sales_aggregate(db: Session = Depends(get_db)) -> list:
    return orders_service.aggregate_sales_for_report(db)


@router.get("/finance/daily-range")
def finance_daily_range(
    from_date: str,
    to_date: str,
    db: Session = Depends(get_db),
) -> list:
    return reports_service.financial_daily_range(db, from_date=from_date, to_date=to_date)


@router.get("/margins/recipes")
def margins(limit: int = 20, db: Session = Depends(get_db)) -> list:
    return reports_service.recipe_margin_ranking(db, limit=limit)


@router.get("/suppliers/spend")
def supplier_spend(
    supplier_id: UUID | None = None,
    db: Session = Depends(get_db),
) -> list:
    return reports_service.supplier_spend_summary(db, supplier_id=supplier_id)


@router.get("/export/{kind}")
def export_kind(
    kind: str,
    from_date: str,
    to_date: str,
    db: Session = Depends(get_db),
) -> Response:
    data = reports_service.export_report_csv(db, kind, from_date=from_date, to_date=to_date)
    return Response(content=data, media_type="text/csv")
