"""Catálogos de configuración, permisos y ajustes de la aplicación."""

import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base
from app.models.user_model import UserRole


class RecipeCategory(Base):
    __tablename__ = "recipe_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(120), nullable=False, unique=True)
    sort_order = Column(Integer, nullable=False, default=0)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.now)


class ProductUnit(Base):
    __tablename__ = "product_units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    code = Column(String(50), nullable=False, unique=True)
    label = Column(String(100), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)
    active = Column(Boolean, nullable=False, default=True)


class WasteReason(Base):
    __tablename__ = "waste_reasons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(150), nullable=False, unique=True)
    sort_order = Column(Integer, nullable=False, default=0)
    active = Column(Boolean, nullable=False, default=True)


class LookupOption(Base):
    __tablename__ = "lookup_options"

    group_key = Column(String(50), primary_key=True)
    value = Column(String(100), primary_key=True)
    label = Column(String(200), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)


class PermissionFeature(Base):
    __tablename__ = "permission_features"

    key = Column(String(100), primary_key=True)
    label = Column(String(200), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)


class RoleFeaturePermission(Base):
    __tablename__ = "role_feature_permissions"

    role = Column(
        Enum(UserRole, name="user_role", create_type=False),
        primary_key=True,
    )
    feature_key = Column(
        String(100),
        ForeignKey("permission_features.key", ondelete="CASCADE"),
        primary_key=True,
    )
    allowed = Column(Boolean, nullable=False, default=True)


class RoutePermission(Base):
    __tablename__ = "route_permissions"

    path = Column(String(200), primary_key=True)
    role = Column(
        Enum(UserRole, name="user_role", create_type=False),
        primary_key=True,
    )


class AppSettings(Base):
    __tablename__ = "app_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_name = Column(String(200), nullable=False, default="")
    business_address = Column(Text)
    business_phone = Column(String(50))
    business_email = Column(String(255))
    business_rut = Column(String(50))
    business_category = Column(String(100))
    currency = Column(String(10), nullable=False, default="CLP")
    tax_rate = Column(Numeric(5, 2), nullable=False, default=19)
    tax_name = Column(String(50), nullable=False, default="IVA")
    include_vat = Column(Boolean, nullable=False, default=True)
    margin_target = Column(Numeric(5, 2), nullable=False, default=65)
    waste_alert = Column(Numeric(5, 2), nullable=False, default=5)
    toteat_enabled = Column(Boolean, nullable=False, default=False)
    toteat_api_key = Column(Text)
    toteat_sync = Column(String(20), nullable=False, default="auto")
    webhook_url = Column(Text)
    notify_low_stock = Column(Boolean, nullable=False, default=True)
    notify_high_waste = Column(Boolean, nullable=False, default=True)
    notify_daily_report = Column(Boolean, nullable=False, default=True)
    notify_weekly_report = Column(Boolean, nullable=False, default=False)
    notify_profit_alert = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
