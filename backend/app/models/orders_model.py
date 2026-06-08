"""
Capa de persistencia para `orders_service`.

| Service (parámetro / concepto) | Modelo                         |
|--------------------------------|--------------------------------|
| created_by                     | Order.created_by               |
| notes                          | Order.notes                    |
| items[].recipe_id, quantity    | OrderItem.recipe_id, quantity  |
| derive_unit_price_snapshot     | OrderItem.unit_price (snapshot)|
| subtotal por línea             | OrderItem.subtotal             |
| total_amount                   | Order.total_amount             |
| new_status (str)               | Order.status (enum)            |
| order_number (ticket UI)       | Order.order_number (serial)    |

El service valida transiciones de estado y descuenta inventario; el modelo
solo almacena el resultado.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Identity, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    PREPARING = "PREPARING"
    READY = "READY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_number = Column(Integer, Identity(), unique=True, nullable=False)
    status = Column(
        Enum(OrderStatus, name="order_status", create_type=False),
        nullable=False,
        default=OrderStatus.PENDING,
        index=True,
    )
    total_amount = Column(Numeric(12, 2), nullable=False, default=0)
    notes = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recipe_id = Column(UUID(as_uuid=True), ForeignKey("recipes.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
