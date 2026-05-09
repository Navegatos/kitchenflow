# KitchenFlow

Aplicación web con frontend en React (Vite), API en FastAPI y PostgreSQL. La orquestación local está definida en Docker Compose.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose v2
- (Opcional, desarrollo sin contenedores) Python 3.12+, Node.js 20+ y PostgreSQL 16 accesible localmente

## Ejecutar todo el proyecto con Docker

Desde la raíz del repositorio:

```bash
docker compose up --build
```

En el primer arranque, PostgreSQL aplica automáticamente el esquema y datos de ejemplo desde `db/docker-init/`.

| Servicio    | URL / puerto |
|------------|----------------|
| Frontend   | http://localhost:5173 |
| API        | http://localhost:8000 |
| OpenAPI / Swagger | http://localhost:8000/docs |
| Adminer (PostgreSQL en el navegador) | http://localhost:8080 — sistema PostgreSQL, servidor `postgres`, base `kitchenflow`, usuario y contraseña `kitchenflow` |
| PostgreSQL | `localhost:5432` (usuario/clave/BD: `kitchenflow`) |

Para detener:

```bash
docker compose down
```

Los datos de PostgreSQL persisten en el volumen `kitchenflow_pgdata`. Para empezar de cero con una BD vacía y volver a ejecutar los scripts de `docker-init`:

```bash
docker compose down -v
docker compose up --build
```

## Estructura del repositorio

| Carpeta   | Contenido |
|-----------|-----------|
| `front/`  | SPA React + Vite |
| `backend/` | API FastAPI (`uvicorn`) |
| `db/`     | SQL de esquema y seed (`docker-init/` para Compose; `create.sql` / `populate.sql` como referencia o carga manual) |

Para ejecutar solo una parte (solo front, solo API o solo base de datos), consulta el `README.md` dentro de cada carpeta.
