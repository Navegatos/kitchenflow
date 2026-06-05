# Version — cambios realizados (KitchenFlow)

Historial de lo implementado en modelos, services, routers y documentación.  
**Última actualización:** junio 2026

---

## Resumen ejecutivo

| Antes | Ahora |
|-------|-------|
| Services devolvían **501** (`pendiente`) | **Persistencia real** con SQLAlchemy + PostgreSQL |
| Solo `POST /categories` implementado (1er paso) | **Todos los services** del dominio implementados |
| Routers sin sesión de BD | Routers con `Depends(get_db)` → `Session` |
| Sin guía de JSON | `backend/docs/API_JSON.md` (POST/PATCH) |

**Pendiente:** `GET /auth/me` y JWT (`get_current_user_from_token_claims` sigue en stub).

---

## 1. Arquitectura (patrón único)

Todos los endpoints siguen el mismo flujo probado con categorías:

```
HTTP Request (JSON)
    ↓
Router  —  Depends(get_db) inyecta Session
    ↓
Service —  lógica + db.add/commit + helpers _xxx_to_dict
    ↓
Model   —  SQLAlchemy ↔ tabla PostgreSQL
    ↓
Respuesta JSON (ids como string, decimales como string, fechas ISO)
```

### Archivos clave

| Rol | Ubicación |
|-----|-----------|
| Sesión BD | `app/db/session.py`, `app/db/dependency.py` (`get_db`) |
| Serialización | `app/services/serializers.py` |
| Models | `app/models/*.py` |
| Services | `app/services/*.py` |
| Routers | `app/routers/*.py` |

### Convenciones de respuesta

- UUID → `"id": "550e8400-..."`
- `Decimal` → `"cost_price": "1200.00"`
- Enums → `"status": "PENDING"`
- Fechas → `"created_at": "2026-06-04T12:00:00"`

Errores habituales:

| Código | Caso |
|--------|------|
| **404** | Recurso no encontrado |
| **409** | Duplicado (email, SKU, nombre categoría) |
| **400** | Validación (stock insuficiente, transición de pedido inválida, enum incorrecto) |

---

## 2. Modelos SQLAlchemy (capa de persistencia)

Creados/alineados con `db/docker-init/01-schema.sql`:

| Módulo | Tablas |
|--------|--------|
| `products_catalog_model.py` | `categories`, `suppliers`, `products` |
| `inventory_model.py` | `inventory_movements` |
| `orders_model.py` | `orders`, `order_items` |
| `recipes_model.py` | `recipes`, `recipe_ingredients` |
| `waste_model.py` | `waste_records` |
| `user_model.py` | `users` (existente, probado por el equipo) |
| `reports_model.py` | Sin tablas (solo consultas) |

Import central: `from app.models import Product, Order, Recipe, ...`

Documentación de prueba: `backend/app/models/README.md` + `backend/scripts/verify_models.py`

---

## 3. Services implementados

### `catalog_service.py`

| Función | Operación |
|---------|-----------|
| `list_categories` | Listar categorías |
| `create_category` | **Create** — primera implementación probada |
| `list_suppliers` | Listar proveedores (filtro `status`) |
| `create_supplier` | **Create** |
| `update_supplier_status` | **Update** estado ACTIVE/INACTIVE |
| `list_products` | Listar con join categoría/proveedor, filtros `low_stock` |
| `get_product` | Detalle enriquecido |
| `create_product` | **Create** + movimiento `IN` si `initial_stock > 0` |
| `update_product` | **Update** metadatos (no toca `stock`) |

### `inventory_service.py`

| Función | Operación |
|---------|-----------|
| `register_inventory_movement` | **Create** — actualiza `products.stock` en la misma transacción |
| `list_inventory_movements` | Historial con nombre producto y email usuario |
| `list_products_below_minimum` | Alertas (reusa listado catálogo `low_stock=true`) |

Tipos de movimiento: `IN`, `OUT`, `ADJUSTMENT` (ajuste absoluto), `WASTE`.

### `recipes_service.py`

| Función | Operación |
|---------|-----------|
| `list_recipes` | Listar con ingredientes anidados |
| `get_recipe` | Detalle + ingredientes |
| `create_recipe` | **Create** |
| `update_recipe` | **Update** |
| `replace_recipe_ingredients` | **Update** (PUT) — reemplaza todas las líneas |
| `list_menu_recipes` | Recetas ACTIVE para menú |
| `estimate_recipe_cost` | Costo teórico y margen vs `sale_price` |

### `orders_service.py`

| Función | Operación |
|---------|-----------|
| `list_orders` / `get_order` | Listado y detalle con ítems |
| `create_order_with_items` | **Create** — calcula `unit_price`, `subtotal`, `total_amount` |
| `update_order_status` | **Update** — valida transiciones de estado |
| `derive_unit_price_snapshot` | Helper interno (precio receta activa) |
| `aggregate_sales_for_report` | Ventas agrupadas por receta (pedidos DELIVERED) |

Transiciones permitidas:

```
PENDING → PREPARING | CANCELLED
PREPARING → READY | CANCELLED
READY → DELIVERED | CANCELLED
DELIVERED / CANCELLED → (final)
```

### `waste_service.py`

| Función | Operación |
|---------|-----------|
| `list_waste_records` | Listar con producto y registrador |
| `register_waste` | **Create** — inserta merma + movimiento WASTE + descuenta stock (una transacción) |
| `waste_cost_estimate` | `quantity × cost_price` |

### `users_service.py`

| Función | Operación |
|---------|-----------|
| `list_users` | Filtros `active_only`, `role` |
| `get_user_by_id` | Detalle |
| `create_user` | **Create** — usa `auth_service.hash_password` |
| `update_user` | **Update** |
| `set_user_password` | **Update** contraseña |
| `touch_last_login` | Stub mínimo (sin columna `last_login` en BD) |

Roles válidos: `ADMIN`, `MANAGER`, `CHEF`, `WAITER`.

### `reports_service.py`

| Función | Descripción |
|---------|-------------|
| `dashboard_summary` | KPIs: pedidos pendientes, bajo stock, mermas, ingresos entregados |
| `financial_daily_range` | Ingresos por día (órdenes DELIVERED) |
| `recipe_margin_ranking` | Recetas ordenadas por margen % |
| `supplier_spend_summary` | Gasto estimado por proveedor (movimientos IN) |
| `export_report_csv` | CSV: `inventory`, `sales`, `waste`, `orders` |

### `auth_service.py`

| Función | Estado |
|---------|--------|
| `authenticate_user` / `login` | Funcional con seed |
| `hash_password` | Placeholder (texto plano, igual que seed) |
| `get_current_user_from_token_claims` | **501** — JWT pendiente |

---

## 4. Routers actualizados

Todos los routers de dominio pasan `db: Session = Depends(get_db)` al service:

- `products_catalog.py` — catálogo completo
- `inventory.py`
- `orders.py`
- `recipes.py`
- `waste.py`
- `users_.py`
- `reports.py`

`auth.py` ya usaba `get_db` en login.

---

## 5. Primera prueba exitosa (referencia)

**Request:** `POST /api/v1/categories`

```json
{
  "name": "Condimentos",
  "description": "Salsas, especias y aderezos"
}
```

**Antes:** `501` — `"create_category: pendiente"`  
**Después:** `200` — `{ "id", "name", "description", "created_at" }`

Ese mismo patrón se replicó en el resto de services.

---

## 6. Documentación relacionada

| Archivo | Contenido |
|---------|-----------|
| `backend/docs/API_JSON.md` | JSON para **POST (Create)** y **PATCH/PUT (Update)** |
| `backend/app/models/README.md` | Cómo verificar models contra Postgres |
| `Version.md` | Este archivo |

---

## 7. Cómo probar

```bash
docker compose up -d postgres
cd backend
pip install -r requirements.txt "psycopg[binary]"
uvicorn app.main:app --reload --port 8000
```

- Swagger: http://127.0.0.1:8000/docs  
- Ejemplos JSON: `backend/docs/API_JSON.md`  
- Models: `python scripts/verify_models.py`

---

## 8. Próximos pasos sugeridos

1. JWT real en `auth_service` + proteger rutas
2. Hash bcrypt/argon2 en contraseñas (reemplazar seed)
3. Descuento de inventario al crear/cancelar pedidos
4. Pydantic schemas en routers (en lugar de `dict` libre)
5. Tests automatizados por service

---

## 9. Changelog cronológico

1. **Modelos** — SQLAlchemy para todas las tablas del esquema  
2. **Docs models** — README + `verify_models.py`  
3. **API_JSON.md** — guía JSON Create/Update  
4. **create_category** — primer service funcional (POST categorías)  
5. **serializers.py** — helpers compartidos de respuesta  
6. **Implementación completa** — todos los services + routers con `get_db`  
7. **Version.md** — este documento actualizado
