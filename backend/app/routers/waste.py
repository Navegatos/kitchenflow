"""Registros de merma."""

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Query

from app.services import waste_service

router = APIRouter(prefix="/waste", tags=["waste"])


@router.get("/records")
def list_records(product_id: UUID | None = None) -> list:
    return waste_service.list_waste_records(product_id=product_id)


@router.post("/records")
def create_record(body: dict) -> dict:
    return waste_service.register_waste(
        product_id=UUID(body["product_id"]),
        quantity=Decimal(str(body["quantity"])),
        reason=body.get("reason"),
        registered_by=UUID(body["registered_by"]) if body.get("registered_by") else None,
    )


@router.get("/estimate-cost")
def estimate(product_id: UUID, quantity: str = Query(...)) -> dict:
    cost = waste_service.waste_cost_estimate(product_id, Decimal(quantity))
    return {"estimated_cost": str(cost)}
