"""Configuración global de la aplicación (singleton en app_settings)."""

from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.config_model import AppSettings
from app.services.serializers import decimal_str, dt_iso, uuid_str


def _settings_to_dict(row: AppSettings) -> dict:
    return {
        "id": uuid_str(row.id),
        "business": {
            "name": row.business_name,
            "address": row.business_address,
            "phone": row.business_phone,
            "email": row.business_email,
            "rut": row.business_rut,
            "category": row.business_category,
        },
        "financial": {
            "currency": row.currency,
            "tax_rate": decimal_str(row.tax_rate),
            "tax_name": row.tax_name,
            "include_vat": row.include_vat,
            "margin_target": decimal_str(row.margin_target),
            "waste_alert": decimal_str(row.waste_alert),
        },
        "integrations": {
            "toteat_enabled": row.toteat_enabled,
            "toteat_api_key": row.toteat_api_key,
            "toteat_sync": row.toteat_sync,
            "webhook_url": row.webhook_url,
        },
        "notifications": {
            "low_stock": row.notify_low_stock,
            "high_waste": row.notify_high_waste,
            "daily_report": row.notify_daily_report,
            "weekly_report": row.notify_weekly_report,
            "profit_alert": row.notify_profit_alert,
        },
        "updated_at": dt_iso(row.updated_at),
    }


def _get_singleton(db: Session) -> AppSettings:
    row = db.query(AppSettings).order_by(AppSettings.updated_at.desc()).first()
    if not row:
        raise HTTPException(status_code=404, detail="Configuración no inicializada")
    return row


def get_settings(db: Session) -> dict:
    return _settings_to_dict(_get_singleton(db))


def update_settings(db: Session, body: dict) -> dict:
    row = _get_singleton(db)

    business = body.get("business")
    if business:
        if "name" in business:
            row.business_name = business["name"]
        if "address" in business:
            row.business_address = business["address"]
        if "phone" in business:
            row.business_phone = business["phone"]
        if "email" in business:
            row.business_email = business["email"]
        if "rut" in business:
            row.business_rut = business["rut"]
        if "category" in business:
            row.business_category = business["category"]

    financial = body.get("financial")
    if financial:
        if "currency" in financial:
            row.currency = financial["currency"]
        if "tax_rate" in financial:
            row.tax_rate = Decimal(str(financial["tax_rate"]))
        if "tax_name" in financial:
            row.tax_name = financial["tax_name"]
        if "include_vat" in financial:
            row.include_vat = bool(financial["include_vat"])
        if "margin_target" in financial:
            row.margin_target = Decimal(str(financial["margin_target"]))
        if "waste_alert" in financial:
            row.waste_alert = Decimal(str(financial["waste_alert"]))

    integrations = body.get("integrations")
    if integrations:
        if "toteat_enabled" in integrations:
            row.toteat_enabled = bool(integrations["toteat_enabled"])
        if "toteat_api_key" in integrations:
            row.toteat_api_key = integrations["toteat_api_key"]
        if "toteat_sync" in integrations:
            row.toteat_sync = integrations["toteat_sync"]
        if "webhook_url" in integrations:
            row.webhook_url = integrations["webhook_url"]

    notifications = body.get("notifications")
    if notifications:
        if "low_stock" in notifications:
            row.notify_low_stock = bool(notifications["low_stock"])
        if "high_waste" in notifications:
            row.notify_high_waste = bool(notifications["high_waste"])
        if "daily_report" in notifications:
            row.notify_daily_report = bool(notifications["daily_report"])
        if "weekly_report" in notifications:
            row.notify_weekly_report = bool(notifications["weekly_report"])
        if "profit_alert" in notifications:
            row.notify_profit_alert = bool(notifications["profit_alert"])

    db.commit()
    db.refresh(row)
    return _settings_to_dict(row)
