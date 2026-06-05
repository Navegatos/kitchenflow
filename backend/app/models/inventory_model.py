"""
Capa de persistencia para `inventory_service`.

| Service (parámetro) | Modelo (columna)      |
|---------------------|-----------------------|
| actor_user_id       | user_id               |
| movement_type (str) | movement_type (enum)  |
| quantity            | quantity              |
| notes               | notes                 |

El service calcula `previous_stock` y `new_stock` y actualiza `Product.stock`
en la misma transacción; esos campos no vienen del router, los escribe el service.
Stock actual vive en `Product` (`products_catalog_model`), no aquí.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class MovementType(str, enum.Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUSTMENT = "ADJUSTMENT"
    WASTE = "WASTE"


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    movement_type = Column(
        Enum(MovementType, name="movement_type", create_type=False),
        nullable=False,
    )
    quantity = Column(Numeric(12, 2), nullable=False)
    previous_stock = Column(Numeric(12, 2), nullable=False)
    new_stock = Column(Numeric(12, 2), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
