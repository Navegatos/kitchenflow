"""Catálogo: `categories`, `suppliers`, `products` (el front los trata como ingredientes)."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException


def list_categories() -> list:
    """
    Esperado: Devolver todas las categorías para filtros y formularios de producto.
    """
    raise HTTPException(status_code=501, detail="list_categories: pendiente")


def create_category(*, name: str, description: str | None) -> dict:
    """
    Esperado: Insert en `categories` respetando `UNIQUE(name)`.
    """
    raise HTTPException(status_code=501, detail="create_category: pendiente")


def list_suppliers(*, status: str | None = None) -> list:
    """
    Esperado: Listar `suppliers` filtrando por `supplier_status` si aplica.
    """
    raise HTTPException(status_code=501, detail="list_suppliers: pendiente")


def create_supplier(
    *,
    name: str,
    contact_name: str | None,
    email: str | None,
    phone: str | None,
    address: str | None,
) -> dict:
    """
    Esperado: Insert en `suppliers`.
    """
    raise HTTPException(status_code=501, detail="create_supplier: pendiente")


def update_supplier_status(supplier_id: UUID, status: str) -> dict:
    """
    Esperado: Cambiar `status` a ACTIVE/INACTIVE.
    """
    raise HTTPException(status_code=501, detail="update_supplier_status: pendiente")


def list_products(
    *,
    category_id: UUID | None = None,
    supplier_id: UUID | None = None,
    active_only: bool = True,
    low_stock: bool | None = None,
) -> list:
    """
    Esperado:
    - Join `products` con `categories` y `suppliers` para enriquecer respuesta
      (equivalente a `mockData.Ingredient`: nombre categoría, proveedor, stock, mínimos).
    - `low_stock`: `stock <= minimum_stock`.
    """
    raise HTTPException(status_code=501, detail="list_products: pendiente")


def get_product(product_id: UUID) -> dict:
    """
    Esperado: Detalle de producto con relaciones o 404.
    """
    raise HTTPException(status_code=501, detail="get_product: pendiente")


def create_product(
    *,
    name: str,
    unit: str,
    cost_price: Decimal,
    category_id: UUID | None,
    supplier_id: UUID | None,
    sku: str | None,
    description: str | None,
    minimum_stock: Decimal,
    sale_price: Decimal | None,
    initial_stock: Decimal,
) -> dict:
    """
    Esperado:
    - Insert en `products` con `stock=initial_stock`.
    - Opcional: si `initial_stock > 0`, insertar `inventory_movements` tipo `IN`
      con `previous_stock=0`, `new_stock=initial_stock` y `user_id` del actor.
    """
    raise HTTPException(status_code=501, detail="create_product: pendiente")


def update_product(
    product_id: UUID,
    *,
    name: str | None = None,
    unit: str | None = None,
    cost_price: Decimal | None = None,
    category_id: UUID | None = None,
    supplier_id: UUID | None = None,
    sku: str | None = None,
    description: str | None = None,
    minimum_stock: Decimal | None = None,
    sale_price: Decimal | None = None,
    active: bool | None = None,
) -> dict:
    """
    Esperado: Actualizar metadatos; **no** alterar `stock` aquí (usar movimientos).
    """
    raise HTTPException(status_code=501, detail="update_product: pendiente")
