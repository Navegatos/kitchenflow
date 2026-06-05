"""Utilidades compartidas para serializar respuestas de services."""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from uuid import UUID


def dt_iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def decimal_str(value: Decimal | None) -> str | None:
    if value is None:
        return None
    return str(value)


def enum_val(value: Enum | str | None) -> str | None:
    if value is None:
        return None
    return value.value if isinstance(value, Enum) else str(value)


def uuid_str(value: UUID | int | None) -> str | None:
    if value is None:
        return None
    return str(value)


def parse_uuid(value: UUID | str | None) -> UUID | None:
    if value is None:
        return None
    if isinstance(value, UUID):
        return value
    return UUID(str(value))
