# Changelog

Todos los cambios notables por rama respecto a `main`.

## [hashed-passwords] — 2026-06-18

### Autenticación y sesión

- Contraseñas verificadas con **bcrypt** (`verify_password` / `hash_password`); eliminada la comparación en texto plano del stub anterior.
- Emisión de **JWT** reales en el login (`access_token`, `token_type: bearer`) con PyJWT.
- Configuración JWT en `Settings`: `JWT_SECRET_KEY` (obligatoria), `JWT_ALGORITHM` (HS256) y `JWT_EXPIRE_HOURS` (8 h por defecto).
- `GET /auth/me` protegido con cabecera `Authorization: Bearer …` (HTTPBearer); ya no acepta `user_id` por query string.
- Payload de login ampliado con token firmado y expiración alineada a la configuración JWT.
- Mensajes de error para token expirado o inválido.

### Frontend

- Nuevo módulo `session.ts` para persistir sesión en `localStorage` y exponer `getAccessToken`.
- Cliente HTTP (`client.ts`) adjunta automáticamente el Bearer token en cada petición autenticada.
- `validateSession` revalida contra `/auth/me` usando JWT en lugar del UUID en query.
- Tipo `LoginResponse` ampliado con `access_token` y `token_type`.

### Base de datos

- Seeds (`db/populate.sql`, `db/docker-init/02-seed.sql`) con hashes bcrypt para usuarios de demo (contraseñas sin cambiar: `hashed_password_1` … `hashed_password_4`).
- Migración `002-password-hashes.sql` para actualizar bases existentes creadas con el seed anterior.

### Infraestructura

- Dependencias nuevas: `bcrypt`, `PyJWT`.
- Docker Compose carga `backend/.env` vía `env_file` (requerido para `JWT_SECRET_KEY`).
- README del backend actualizado: `.env` debe incluir `DATABASE_URL` y `JWT_SECRET_KEY`.
Cambios notables del proyecto KitchenFlow.

## [simulated-data] — 2026-06-18

### Scripts SQL — datos demo extendidos

- Nuevo script `db/populate-demo-data.sql` y su equivalente para Docker `db/docker-init/03-demo-data.sql` (mismo contenido; el de `docker-init/` se ejecuta automáticamente en orden `03` tras el esquema y el seed básico).
- Comentario en `db/populate.sql` que referencia estos scripts como paso opcional posterior al seed.
- **No modifica el esquema**: solo inserta datos de prueba. Requiere esquema (`create.sql` / `01-schema.sql`) y seed básico (`populate.sql` / `02-seed.sql`) ya aplicados.

Contenido generado por los scripts demo:

| Área | Qué agrega |
|------|------------|
| Catálogo | 8 productos nuevos (cebolla, papa, pollo, chorizo, mantequilla, jugo, agua, masa pizza) |
| Alertas de stock | Ajusta stock bajo en Lechuga, Queso Mozzarella y Carne Vacuno |
| Recetas | 5 recetas nuevas con ingredientes (Lomo Saltado, Pollo a la Plancha, Papas Fritas, Pizza Pepperoni, Combo Bebida) |
| Pedidos | ~90 pedidos históricos en los últimos 30 días + 6 pedidos de hoy con distintos estados (PENDING, PREPARING, READY, DELIVERED, CANCELLED) |
| Mermas | ~35 registros de merma distribuidos en 30 días |
| Inventario | ~60 movimientos (entradas, salidas, ajustes, mermas) con fechas retroactivas |

> **Importante:** estos scripts **no son idempotentes**. Ejecutarlos más de una vez duplica pedidos, mermas y movimientos. Si necesitas volver a cargarlos, reinicia la BD desde cero o elimina manualmente los datos demo antes de reejecutar.

### Actualizar bases de datos locales

#### Opción A — Docker Compose con volumen nuevo (recomendado para empezar de cero)

Desde la raíz del repositorio:

```bash
docker compose down -v
docker compose up --build
```

PostgreSQL aplicará en orden `01-schema.sql`, `02-seed.sql` y `03-demo-data.sql`. Los datos persisten en el volumen `kitchenflow_pgdata`.

#### Opción B — Docker Compose con volumen existente (solo agregar datos demo)

Si ya tienes el esquema y el seed básico pero **no** los datos demo:

```bash
docker compose exec -T postgres psql -U kitchenflow -d kitchenflow \
  -f /docker-entrypoint-initdb.d/03-demo-data.sql
```

(Si el contenedor no monta ese path, copia el archivo al contenedor o usa la ruta local:)

```bash
docker compose exec -T postgres psql -U kitchenflow -d kitchenflow \
  < db/docker-init/03-demo-data.sql
```

#### Opción C — PostgreSQL local sin Docker

Tras aplicar esquema y seed:

```bash
psql -h localhost -U kitchenflow -d kitchenflow -f db/create.sql
psql -h localhost -U kitchenflow -d kitchenflow -f db/populate.sql
psql -h localhost -U kitchenflow -d kitchenflow -f db/populate-demo-data.sql
```

#### Opción D — Volumen antiguo sin tablas de configuración

Si la BD se creó **antes** de la migración de sucursales y permisos, al arrancar la API se aplica automáticamente `backend/migrations/001-config-branches.sql` (registrada en `schema_migrations`). Alternativa manual:

```bash
psql -h localhost -U kitchenflow -d kitchenflow -f backend/migrations/001-config-branches.sql
```

Después de eso, aplica los datos demo con la opción B o C según tu entorno.

#### Verificación rápida

Con Adminer (http://localhost:8080) o `psql`, comprueba que existan filas recientes en `orders`, `waste_records` e `inventory_movements` (por ejemplo, pedidos con `created_at` en los últimos 30 días).

---

## [dale-tu-front] — 2026-06-11

### Autenticación y sesión

- Integración del frontend con la API de autenticación (login asíncrono, manejo de errores y estado de carga).
- Introducción de `GUEST_USER` para el estado no autenticado.
- Validación de sesión en el endpoint `/auth/me`: verifica que el usuario exista y esté activo.
- Función `get_current_user_from_token_claims` ampliada con comprobaciones en base de datos.
- Nueva función `validateSession` en el frontend para revalidar sesiones locales contra el backend.
- Mensajes de error de autenticación traducidos al español.
- Manejo mejorado de usuarios inactivos en el servicio de autenticación.

### Control de acceso por roles

- Control de acceso basado en roles (RBAC) para rutas y navegación.
- Módulo `permissions.ts` en el frontend para definir permisos por rol.
- Componentes de layout (`Sidebar`, `Topbar`, `Root`) actualizados para respetar permisos del usuario.
- Mapeo de roles de usuario ampliado con nuevos roles y funciones de gestión ajustadas.
- Nuevo router y servicio de permisos en el backend (`permissions.py`, `permissions_service.py`).

### Capa API del frontend

- Cliente HTTP centralizado (`api/client.ts`) con manejo de tokens y errores.
- Servicios por dominio: autenticación, catálogo, configuración, inventario, órdenes, permisos, recetas, reportes, ajustes, usuarios y mermas.
- Tipos TypeScript para contratos de la API (`api/types.ts`) y tipos de dominio (`domain/types.ts`).
- Mappers para transformar respuestas del backend al modelo del frontend (`api/mappers.ts`).
- Traducción de errores de la API al español (`api/errors.ts`).
- Variable de entorno de ejemplo para la URL de la API (`front/.env.example`).

### Inventario y páginas conectadas a la API

- Página de Inventario conectada a la API (productos y movimientos), con estados de carga y error.
- Páginas refactorizadas para consumir datos reales en lugar de mocks: Dashboard, Finanzas, Entrada de inventario, Menú, Recetas, Reportes, Ventas, Mermas, Usuarios y Ajustes.
- Reducción significativa de datos mock (`mockData.ts` simplificado).
- Gestión de usuarios con operaciones asíncronas e indicadores de carga.

### Configuración y permisos (backend)

- Nuevos modelos de configuración: sucursales, categorías de recetas, unidades de producto y motivos de merma (`config_model.py`).
- Servicios de configuración y ajustes (`config_service.py`, `settings_service.py`).
- Routers expuestos para configuración de catálogo, ajustes y permisos.
- Script de migración `001-config-branches.sql` y módulo `migrate.py` para aplicar migraciones al arranque.
- Modelo de usuario ampliado con asociación a sucursales y campos adicionales.
- Recetas y usuarios vinculados a sucursales y categorías.

### Base de datos

- Esquema actualizado en `db/create.sql` y `db/populate.sql`.
- Scripts de inicialización Docker ampliados (`db/docker-init/01-schema.sql`, `02-seed.sql`).
- Migración SQL `backend/migrations/001-config-branches.sql` con estructura de configuración.

### UI y assets

- Componente `Switch` actualizado en la página de Ajustes.
- Build de producción del frontend actualizado (`front/dist/`).
- Assets JS y CSS regenerados con las nuevas funcionalidades.

### Infraestructura

- Ejecución de migraciones integrada en el arranque de la aplicación (`main.py`).
- Ajuste menor en `backend/Dockerfile`.

---

### Commits incluidos

| Hash     | Descripción |
|----------|-------------|
| `5824596` | Refactor authentication and inventory management |
| `b3457ae` | Implement error translation and role-based access control |
| `170969a` | Implement configuration and permissions management |
| `6561fb7` | Update frontend assets and refactor settings page |
| `45ddd97` | Enhance authentication and session validation |

### Resumen de archivos

- **68 archivos** modificados
- **+4 776** líneas añadidas / **-1 738** líneas eliminadas
