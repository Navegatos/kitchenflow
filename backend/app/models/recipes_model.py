"""
Capa de persistencia para `recipes_service`.

| Service (parámetro)              | Modelo                          |
|----------------------------------|---------------------------------|
| name, description, sale_price    | Recipe                          |
| preparation_time_minutes         | Recipe.preparation_time_minutes |
| created_by                       | Recipe.created_by               |
| status (str, default ACTIVE)     | Recipe.status (enum)            |
| lines[].product_id, quantity     | RecipeIngredient                |

El service calcula costo teórico y margen (`estimate_recipe_cost`) leyendo
`Product.cost_price`; no se persisten en Recipe. La `category` del front se
deriva en el service, no hay columna en Recipe.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class RecipeStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    preparation_time_minutes = Column(Integer)
    sale_price = Column(Numeric(12, 2), nullable=False)
    status = Column(
        Enum(RecipeStatus, name="recipe_status", create_type=False),
        nullable=False,
        default=RecipeStatus.ACTIVE,
    )
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    recipe_id = Column(
        UUID(as_uuid=True),
        ForeignKey("recipes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
