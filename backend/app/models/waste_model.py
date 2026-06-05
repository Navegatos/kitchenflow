"""
Capa de persistencia para `waste_service`.

| Service (parámetro) | Modelo (columna)   |
|---------------------|--------------------|
| product_id          | product_id         |
| quantity            | quantity           |
| reason              | reason             |
| registered_by       | registered_by      |

El service también crea un `InventoryMovement` tipo WASTE y descuenta
`Product.stock`; eso es lógica transaccional, no columnas extra aquí.
`waste_cost_estimate` usa `Product.cost_price` * quantity sin persistir.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Numeric(12, 2), nullable=False)
    reason = Column(Text)
    registered_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
