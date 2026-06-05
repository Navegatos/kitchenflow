# Modelos SQLAlchemy (KitchenFlow)

Los modelos en esta carpeta reflejan las tablas definidas en `db/docker-init/01-schema.sql` (misma estructura que `db/create.sql`).

| Módulo | Tabla(s) |
|--------|----------|
| `user_model.py` | `users` |
| `products_catalog_model.py` | `categories`, `suppliers`, `products` |
| `inventory_model.py` | `inventory_movements` |
| `recipes_model.py` | `recipes`, `recipe_ingredients` |
| `orders_model.py` | `orders`, `order_items` |
| `waste_model.py` | `waste_records` |
| `reports_model.py` | *(sin tablas — solo consultas sobre otras tablas)* |
| `enums.py` | Valores compartidos con los services (`UserRole`, `OrderStatus`, …) |

---

## Modelos vs services (cómo se relacionan)

Los **services** (`app/services/`) se definieron primero: describen la lógica de negocio, validaciones y el contrato de la API (parámetros `str`, `UUID`, `Decimal`, dicts de respuesta).

Los **modelos** (`app/models/`) son la capa de **persistencia**: mapean tablas PostgreSQL con SQLAlchemy. No implementan reglas de negocio.

| Service | Modelo(s) | Qué hace el service y no el modelo |
|---------|-----------|-------------------------------------|
| `catalog_service` | `Category`, `Supplier`, `Product` | Joins para listados; `initial_stock` → columna `stock` |
| `inventory_service` | `InventoryMovement`, `Product` | Calcula `previous_stock`/`new_stock`; `actor_user_id` → `user_id` |
| `orders_service` | `Order`, `OrderItem` | Transiciones de estado; snapshot de precio en `unit_price` |
| `recipes_service` | `Recipe`, `RecipeIngredient` | Costo/margen calculados; categoría del front derivada |
| `waste_service` | `WasteRecord`, `InventoryMovement` | Transacción stock + movimiento WASTE |
| `reports_service` | *(ninguno propio)* | Agrega KPIs desde varios modelos |
| `users_service` / `auth_service` | `User` | `password_plain` → `password_hash` |

**Tipos:** en la API el service recibe `status: str` o `movement_type: str`; al guardar se usa el enum de `enums.py` (mismos literales: `PENDING`, `IN`, `ACTIVE`, …). Los importas desde `app.models` cuando implementes validación en el service:

```python
from app.models import OrderStatus, MovementType

OrderStatus(new_status)  # valida antes de persistir
```

Cada archivo `*_model.py` incluye en su docstring la tabla de mapeo parámetro del service ↔ columna del modelo.

Importación centralizada:

```python
from app.models import Product, Order, Recipe, InventoryMovement, WasteRecord
```

---

## Requisitos previos

1. **PostgreSQL en marcha** con el esquema y datos de ejemplo:

   ```bash
   # Desde la raíz del repositorio
   docker compose up -d postgres
   ```

   En el primer arranque se aplican `db/docker-init/01-schema.sql` y `02-seed.sql`.

2. **Entorno Python** en `backend/`:

   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate          # Windows
   # source .venv/bin/activate     # Linux / macOS
   pip install -r requirements.txt
   pip install "psycopg[binary]"     # driver PostgreSQL (psycopg v3)
   ```

3. **Variable de entorno** (valor por defecto si usas Compose local):

   ```bash
   # Windows PowerShell
   $env:DATABASE_URL = "postgresql+psycopg://kitchenflow:kitchenflow@localhost:5432/kitchenflow"

   # Linux / macOS
   export DATABASE_URL="postgresql+psycopg://kitchenflow:kitchenflow@localhost:5432/kitchenflow"
   ```

   También puedes crear `backend/.env` con la misma línea.

4. **`PYTHONPATH`** apuntando a `backend/` (desde esa carpeta):

   ```bash
   cd backend
   $env:PYTHONPATH = (Get-Location).Path   # PowerShell
   # export PYTHONPATH="${PWD}"            # bash
   ```

---

## Paso 1 — Comprobar que los modelos cargan (sin base de datos)

No requiere PostgreSQL. Solo valida imports y definición de clases:

```bash
cd backend
python -c "from app.models import Product, Order, Recipe; print('imports OK')"
```

Si no hay error, las clases están bien definidas y registradas en `Base.metadata`.

---

## Paso 2 — Comprobar conexión a PostgreSQL

Usa la sesión ya configurada en `app/db/session.py`:

```bash
cd backend
python -c "
from sqlalchemy import text
from app.db.session import engine
with engine.connect() as conn:
    print(conn.execute(text('SELECT 1')).scalar())
"
```

Debe imprimir `1`. Si falla:

- Revisa que `postgres` esté levantado: `docker compose ps`
- Revisa host/puerto/usuario/clave en `DATABASE_URL`
- Confirma que tienes instalado `psycopg`

---

## Paso 3 — Leer datos del seed (prueba real de modelos)

Con la BD poblada por `02-seed.sql`, ejecuta:

```bash
cd backend
python -c "
from app.db.session import SessionLocal
from app.models import Product, Order, Recipe, Category

db = SessionLocal()
try:
    print('Productos:', db.query(Product).count())
    print('Categorías:', db.query(Category).count())
    print('Pedidos:', db.query(Order).count())
    print('Recetas:', db.query(Recipe).count())

    p = db.query(Product).first()
    if p:
        print('Primer producto:', p.name, p.stock, p.unit)
finally:
    db.close()
"
```

Resultado esperado (aproximado, según el seed):

- Varios productos, categorías, pedidos y recetas con conteos > 0
- El primer producto debería ser algo como `Tomate` con stock numérico

Si los conteos son **0**, la BD existe pero no tiene datos: borra el volumen y vuelve a levantar Postgres para re-ejecutar el init:

```bash
docker compose down -v
docker compose up -d postgres
```

---

## Paso 4 — Ver tablas mapeadas por SQLAlchemy

Lista las tablas que SQLAlchemy conoce a partir de los modelos importados:

```bash
cd backend
python -c "
import app.models  # registra todos los modelos en Base.metadata
from app.db.base import Base
print(sorted(Base.metadata.tables.keys()))
"
```

Deberías ver, entre otras: `users`, `categories`, `suppliers`, `products`, `inventory_movements`, `recipes`, `recipe_ingredients`, `orders`, `order_items`, `waste_records`.

> **Importante:** este proyecto **no** usa `Base.metadata.create_all()` para crear la BD. Las tablas las crea el SQL de `db/docker-init/`. Los modelos deben coincidir con ese esquema, no al revés.

---

## Paso 5 — Verificar en Adminer (opcional)

Con Compose en marcha:

1. Abre http://localhost:8080
2. Sistema: **PostgreSQL**
3. Servidor: `postgres` (desde el navegador en tu máquina usa `localhost` si entras por puerto 5432 directamente en Adminer local)
4. Usuario / contraseña / BD: `kitchenflow` / `kitchenflow` / `kitchenflow`

Compara filas en `products` o `orders` con lo que devuelve el script del paso 3.

---

## Script de verificación completo

Hay un script listo en `backend/scripts/verify_models.py`. Ejecución:

```bash
cd backend
python scripts/verify_models.py
```

Comprueba conexión a PostgreSQL y cuenta filas en `products`, `categories`, `orders` y `recipes`.

---

## Errores frecuentes

| Error | Causa probable | Solución |
|-------|----------------|----------|
| `ModuleNotFoundError: app` | `PYTHONPATH` incorrecto | Ejecuta desde `backend/` con `PYTHONPATH` apuntando ahí |
| `No module named 'psycopg'` | Falta el driver | `pip install "psycopg[binary]"` |
| `connection refused` | Postgres no corre | `docker compose up -d postgres` |
| `relation "products" does not exist` | Esquema no aplicado | Recrea el volumen o ejecuta `01-schema.sql` manualmente |
| Enum / tipo incompatible | Modelo desalineado con BD | Revisa `db/docker-init/01-schema.sql` y el modelo correspondiente |

