# JSON — Create (POST) y Update (PATCH/PUT)

Cuerpos JSON para **crear** y **editar** recursos en la API. Solo operaciones de escritura.

- **Base URL:** `http://localhost:8000/api/v1`
- **Header:** `Content-Type: application/json`
- **Swagger:** http://localhost:8000/docs

En **PATCH** y en rutas con `{id}` en la URL, reemplaza el UUID en la ruta con un ID real de tu BD.

```sql
-- Obtener IDs del seed (Adminer o psql)
SELECT id, email FROM users;
SELECT id, name FROM recipes;
SELECT id, name FROM products;
SELECT id, name FROM categories;
SELECT id, name FROM suppliers;
SELECT id, notes FROM orders;
```

**Enums válidos:**

| Campo | Valores |
|-------|---------|
| `role` | `ADMIN`, `MANAGER`, `CHEF`, `WAITER` |
| `movement_type` | `IN`, `OUT`, `ADJUSTMENT`, `WASTE` |
| `status` (pedido) | `PENDING`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED` |
| `status` (receta) | `ACTIVE`, `INACTIVE` |
| `status` (proveedor) | `ACTIVE`, `INACTIVE` |

Precios y cantidades: número o string (`3500` o `"3500"`).

---

## Auth

### Create — `POST /auth/login`

```json
{
  "email": "admin@kitchenflow.cl",
  "password": "hashed_password_1"
}
```

---

## Usuarios

### Create — `POST /users`

```json
{
  "email": "nuevo@kitchenflow.cl",
  "first_name": "Ana",
  "last_name": "Pérez",
  "password": "mi_clave_secreta",
  "role": "WAITER"
}
```

| Campo | Obligatorio |
|-------|-------------|
| `email`, `first_name`, `last_name`, `password`, `role` | sí |

### Update — `PATCH /users/{user_id}`

Envía solo los campos a cambiar:

```json
{
  "first_name": "Ana",
  "last_name": "García",
  "email": "ana.garcia@kitchenflow.cl",
  "role": "CHEF",
  "active": false
}
```

### Update (contraseña) — `POST /users/{user_id}/password`

```json
{
  "password": "nueva_clave_secreta"
}
```

---

## Catálogo

### Create — `POST /categories`

```json
{
  "name": "Condimentos",
  "description": "Salsas, especias y aderezos"
}
```

| Campo | Obligatorio |
|-------|-------------|
| `name` | sí |
| `description` | no |

> No hay PATCH de categoría en la API actual.

### Create — `POST /suppliers`

```json
{
  "name": "Proveedor Norte",
  "contact_name": "Luis Ramírez",
  "email": "luis@provenorte.cl",
  "phone": "+56944444444",
  "address": "Antofagasta"
}
```

| Campo | Obligatorio |
|-------|-------------|
| `name` | sí |
| `contact_name`, `email`, `phone`, `address` | no |

### Update — `PATCH /suppliers/{supplier_id}/status`

```json
{
  "status": "INACTIVE"
}
```

### Create — `POST /products`

```json
{
  "name": "Aceite oliva",
  "unit": "litro",
  "cost_price": 3500,
  "sale_price": 5200,
  "sku": "COND-001",
  "description": "Aceite extra virgen",
  "category_id": "UUID-CATEGORIA",
  "supplier_id": "UUID-PROVEEDOR",
  "minimum_stock": 5,
  "initial_stock": 20
}
```

| Campo | Obligatorio | Notas |
|-------|-------------|-------|
| `name`, `unit`, `cost_price` | sí | |
| `initial_stock` | no | default `0` → guarda en `stock` |
| `minimum_stock` | no | default `0` |
| resto | no | |

### Update — `PATCH /products/{product_id}`

```json
{
  "name": "Aceite oliva premium",
  "unit": "litro",
  "cost_price": 3800,
  "sale_price": 5500,
  "sku": "COND-001-B",
  "description": "Extra virgen 1L",
  "category_id": "UUID-CATEGORIA",
  "supplier_id": "UUID-PROVEEDOR",
  "minimum_stock": 8,
  "active": true
}
```

Todos los campos son opcionales; manda solo lo que quieras modificar. **No** se puede cambiar `stock` aquí (usa movimientos de inventario).

---

## Inventario

### Create — `POST /inventory/movements`

```json
{
  "product_id": "UUID-PRODUCTO",
  "actor_user_id": "UUID-USUARIO",
  "movement_type": "IN",
  "quantity": 25,
  "notes": "Compra semanal"
}
```

| Campo | Obligatorio |
|-------|-------------|
| `product_id`, `actor_user_id`, `movement_type`, `quantity` | sí |
| `notes` | no |

Otro ejemplo (salida de stock):

```json
{
  "product_id": "UUID-PRODUCTO",
  "actor_user_id": "UUID-CHEF",
  "movement_type": "OUT",
  "quantity": 2.5,
  "notes": "Uso en cocina"
}
```

> No hay PATCH de movimientos; son registros inmutables.

---

## Recetas

### Create — `POST /recipes`

```json
{
  "name": "Pizza Margarita",
  "description": "Masa, salsa y mozzarella",
  "preparation_time_minutes": 25,
  "sale_price": 12990,
  "created_by": "UUID-CHEF",
  "status": "ACTIVE"
}
```

| Campo | Obligatorio | Default |
|-------|-------------|---------|
| `name`, `sale_price` | sí | |
| `status` | no | `ACTIVE` |
| `description`, `preparation_time_minutes`, `created_by` | no | |

### Update — `PATCH /recipes/{recipe_id}`

```json
{
  "name": "Pizza Margarita XL",
  "description": "Versión familiar",
  "preparation_time_minutes": 30,
  "sale_price": 15990,
  "status": "INACTIVE"
}
```

Todos opcionales.

### Update (ingredientes) — `PUT /recipes/{recipe_id}/ingredients`

Reemplaza la lista completa de ingredientes:

```json
{
  "lines": [
    {
      "product_id": "UUID-PRODUCTO-1",
      "quantity": 0.25
    },
    {
      "product_id": "UUID-PRODUCTO-2",
      "quantity": 1
    }
  ]
}
```

| Campo | Obligatorio |
|-------|-------------|
| `lines` | sí (puede ser `[]` para vaciar) |
| `lines[].product_id`, `lines[].quantity` | sí en cada línea |

---

## Pedidos

### Create — `POST /orders`

```json
{
  "created_by": "UUID-MESERO",
  "notes": "Mesa 5 — sin cebolla",
  "items": [
    {
      "recipe_id": "UUID-HAMBURGUESA",
      "quantity": 2
    },
    {
      "recipe_id": "UUID-ENSALADA",
      "quantity": 1
    }
  ]
}
```

| Campo | Obligatorio |
|-------|-------------|
| `items` | sí |
| `items[].recipe_id`, `items[].quantity` | sí en cada ítem |
| `created_by`, `notes` | no |

Mínimo:

```json
{
  "items": [
    { "recipe_id": "UUID-RECETA", "quantity": 1 }
  ]
}
```

No envíes `unit_price`, `subtotal` ni `total_amount`; los calcula el service.

### Update — `PATCH /orders/{order_id}/status`

```json
{
  "status": "PREPARING",
  "actor_user_id": "UUID-CHEF"
}
```

| Campo | Obligatorio |
|-------|-------------|
| `status` | sí |
| `actor_user_id` | no |

---

## Mermas

### Create — `POST /waste/records`

```json
{
  "product_id": "UUID-PRODUCTO",
  "quantity": 3,
  "reason": "Producto vencido",
  "registered_by": "UUID-USUARIO"
}
```

| Campo | Obligatorio |
|-------|-------------|
| `product_id`, `quantity` | sí |
| `reason`, `registered_by` | no |

> No hay PATCH de mermas en la API actual.

---

## Resumen CRUD (solo escritura)

| Recurso | Create (POST) | Update (PATCH / PUT) |
|---------|---------------|----------------------|
| Login | `/auth/login` | — |
| Usuario | `/users` | `/users/{id}` · `/users/{id}/password` |
| Categoría | `/categories` | — |
| Proveedor | `/suppliers` | `/suppliers/{id}/status` |
| Producto | `/products` | `/products/{id}` |
| Movimiento inventario | `/inventory/movements` | — |
| Receta | `/recipes` | `/recipes/{id}` · `PUT .../ingredients` |
| Pedido | `/orders` | `/orders/{id}/status` |
| Merma | `/waste/records` | — |

Reportes: sin POST/PATCH (solo consultas).

---

## curl rápido

**Create pedido:**

```bash
curl -X POST "http://localhost:8000/api/v1/orders" \
  -H "Content-Type: application/json" \
  -d "{\"items\":[{\"recipe_id\":\"UUID-RECETA\",\"quantity\":2}]}"
```

**Update estado pedido:**

```bash
curl -X PATCH "http://localhost:8000/api/v1/orders/UUID-PEDIDO/status" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"PREPARING\"}"
```

**PowerShell (Create):**

```powershell
$body = @{ items = @(@{ recipe_id = "UUID-RECETA"; quantity = 2 }) } | ConvertTo-Json -Depth 3
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/api/v1/orders" -ContentType "application/json" -Body $body
```

---

## JSON → modelo (campos que cambian de nombre)

| JSON en la API | Columna en BD / modelo |
|----------------|------------------------|
| `password` | `User.password_hash` (hash en el service) |
| `initial_stock` | `Product.stock` |
| `actor_user_id` | `InventoryMovement.user_id` |
| `items[].recipe_id` | `OrderItem.recipe_id` |
| `lines[].product_id` | `RecipeIngredient.product_id` |
