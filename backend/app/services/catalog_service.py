"""Catálogo: `categories`, `suppliers`, `products`."""

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.inventory_model import InventoryMovement, MovementType
from app.models.products_catalog_model import Category, Product, Supplier, SupplierStatus
from app.services import config_service
from app.services.serializers import decimal_str, dt_iso, enum_val, parse_uuid, uuid_str


def _category_to_dict(category: Category) -> dict:
    return {
        "id": uuid_str(category.id),
        "name": category.name,
        "description": category.description,
        "created_at": dt_iso(category.created_at),
    }


def _supplier_to_dict(supplier: Supplier) -> dict:
    return {
        "id": uuid_str(supplier.id),
        "name": supplier.name,
        "contact_name": supplier.contact_name,
        "email": supplier.email,
        "phone": supplier.phone,
        "address": supplier.address,
        "status": enum_val(supplier.status),
        "created_at": dt_iso(supplier.created_at),
    }


def _product_to_dict(
    product: Product,
    *,
    category_name: str | None = None,
    supplier_name: str | None = None,
) -> dict:
    return {
        "id": uuid_str(product.id),
        "name": product.name,
        "description": product.description,
        "sku": product.sku,
        "unit": product.unit,
        "stock": decimal_str(product.stock),
        "minimum_stock": decimal_str(product.minimum_stock),
        "cost_price": decimal_str(product.cost_price),
        "sale_price": decimal_str(product.sale_price),
        "active": product.active,
        "category_id": uuid_str(product.category_id),
        "supplier_id": uuid_str(product.supplier_id),
        "category_name": category_name,
        "supplier_name": supplier_name,
        "created_at": dt_iso(product.created_at),
        "updated_at": dt_iso(product.updated_at),
    }


def _parse_supplier_status(status: str) -> SupplierStatus:
    try:
        return SupplierStatus(status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="status inválido") from exc


def list_categories(db: Session) -> list:
    rows = db.query(Category).order_by(Category.name).all()
    return [_category_to_dict(c) for c in rows]


def create_category(db: Session, *, name: str, description: str | None) -> dict:
    category = Category(name=name, description=description)
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Ya existe una categoría con ese nombre",
        ) from None
    db.refresh(category)
    return _category_to_dict(category)


def list_suppliers(db: Session, *, status: str | None = None) -> list:
    q = db.query(Supplier)
    if status is not None:
        q = q.filter(Supplier.status == _parse_supplier_status(status))
    rows = q.order_by(Supplier.name).all()
    return [_supplier_to_dict(s) for s in rows]


def create_supplier(
    db: Session,
    *,
    name: str,
    contact_name: str | None,
    email: str | None,
    phone: str | None,
    address: str | None,
) -> dict:
    supplier = Supplier(
        name=name,
        contact_name=contact_name,
        email=email,
        phone=phone,
        address=address,
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return _supplier_to_dict(supplier)


def update_supplier_status(db: Session, supplier_id: UUID, status: str) -> dict:
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    supplier.status = _parse_supplier_status(status)
    db.commit()
    db.refresh(supplier)
    return _supplier_to_dict(supplier)


def list_products(
    db: Session,
    *,
    category_id: UUID | None = None,
    supplier_id: UUID | None = None,
    active_only: bool = True,
    low_stock: bool | None = None,
) -> list:
    q = (
        db.query(Product, Category.name, Supplier.name)
        .outerjoin(Category, Product.category_id == Category.id)
        .outerjoin(Supplier, Product.supplier_id == Supplier.id)
    )
    if category_id is not None:
        q = q.filter(Product.category_id == category_id)
    if supplier_id is not None:
        q = q.filter(Product.supplier_id == supplier_id)
    if active_only:
        q = q.filter(Product.active.is_(True))
    if low_stock is True:
        q = q.filter(Product.stock <= Product.minimum_stock)
    elif low_stock is False:
        q = q.filter(Product.stock > Product.minimum_stock)

    return [
        _product_to_dict(p, category_name=cat_name, supplier_name=sup_name)
        for p, cat_name, sup_name in q.order_by(Product.name).all()
    ]


def get_product(db: Session, product_id: UUID) -> dict:
    row = (
        db.query(Product, Category.name, Supplier.name)
        .outerjoin(Category, Product.category_id == Category.id)
        .outerjoin(Supplier, Product.supplier_id == Supplier.id)
        .filter(Product.id == product_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product, cat_name, sup_name = row
    return _product_to_dict(product, category_name=cat_name, supplier_name=sup_name)


def create_product(
    db: Session,
    *,
    name: str,
    unit: str,
    cost_price: Decimal,
    category_id: UUID | str | None,
    supplier_id: UUID | str | None,
    sku: str | None,
    description: str | None,
    minimum_stock: Decimal,
    sale_price: Decimal | None,
    initial_stock: Decimal,
) -> dict:
    unit = config_service.validate_product_unit(db, unit)
    product = Product(
        name=name,
        unit=unit,
        cost_price=cost_price,
        category_id=parse_uuid(category_id),
        supplier_id=parse_uuid(supplier_id),
        sku=sku,
        description=description,
        minimum_stock=minimum_stock,
        sale_price=sale_price,
        stock=initial_stock,
    )
    db.add(product)
    try:
        db.flush()
        if initial_stock > 0:
            db.add(
                InventoryMovement(
                    product_id=product.id,
                    user_id=None,
                    movement_type=MovementType.IN,
                    quantity=initial_stock,
                    previous_stock=Decimal("0"),
                    new_stock=initial_stock,
                    notes="Stock inicial al crear producto",
                )
            )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="SKU duplicado u otra restricción violada",
        ) from None
    db.refresh(product)
    return get_product(db, product.id)


def update_product(
    db: Session,
    product_id: UUID,
    *,
    name: str | None = None,
    unit: str | None = None,
    cost_price: Decimal | None = None,
    category_id: UUID | str | None = None,
    supplier_id: UUID | str | None = None,
    sku: str | None = None,
    description: str | None = None,
    minimum_stock: Decimal | None = None,
    sale_price: Decimal | None = None,
    active: bool | None = None,
) -> dict:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if name is not None:
        product.name = name
    if unit is not None:
        product.unit = unit
    if cost_price is not None:
        product.cost_price = cost_price
    if category_id is not None:
        product.category_id = parse_uuid(category_id)
    if supplier_id is not None:
        product.supplier_id = parse_uuid(supplier_id)
    if sku is not None:
        product.sku = sku
    if description is not None:
        product.description = description
    if minimum_stock is not None:
        product.minimum_stock = minimum_stock
    if sale_price is not None:
        product.sale_price = sale_price
    if active is not None:
        product.active = active

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="SKU duplicado") from None
    db.refresh(product)
    return get_product(db, product.id)
