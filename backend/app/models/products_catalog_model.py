"""
Capa de persistencia para `catalog_service`.

| Service (parámetro)     | Modelo (columna)   |
|-------------------------|--------------------|
| category name/description | Category           |
| supplier status         | Supplier.status    |
| initial_stock (create)  | Product.stock      |
| cost_price, sale_price  | Numeric en Product |
| active_only / low_stock | filtros en service, no columnas extra |

El service enriquece listados con joins (nombre categoría, proveedor); el modelo
solo guarda FKs `category_id` y `supplier_id`.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class SupplierStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(120), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.now)


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(150), nullable=False)
    contact_name = Column(String(150))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    status = Column(
        Enum(SupplierStatus, name="supplier_status", create_type=False),
        nullable=False,
        default=SupplierStatus.ACTIVE,
    )
    created_at = Column(DateTime, default=datetime.now)


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), index=True)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    sku = Column(String(100), unique=True)
    unit = Column(String(50), nullable=False)
    stock = Column(Numeric(12, 2), nullable=False, default=0)
    minimum_stock = Column(Numeric(12, 2), nullable=False, default=0)
    cost_price = Column(Numeric(12, 2), nullable=False)
    sale_price = Column(Numeric(12, 2))
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
