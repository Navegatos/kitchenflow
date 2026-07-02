# KitchenFlow

Aplicación web con frontend en React (Vite), API en FastAPI y PostgreSQL. La orquestación está definida en Docker Compose con tres perfiles: **desarrollo local**, **QA** y **producción**.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose v2
- (Opcional, desarrollo sin contenedores) Python 3.12+, Node.js 20+ y PostgreSQL 16 accesible localmente

## Desarrollo local

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

## Entorno QA (staging)

Stack similar a producción (front compilado + nginx + API con workers), con herramientas extra para pruebas: Swagger expuesto, Adminer y PostgreSQL accesible desde el host.

```bash
cp deploy/env/qa.env.example deploy/env/qa.env
# Opcional: ajustar puertos o credenciales en deploy/env/qa.env

docker compose --env-file deploy/env/qa.env -f docker-compose.qa.yml up -d --build
```

| Servicio | URL / puerto (valores por defecto) |
|----------|-------------------------------------|
| Aplicación | http://localhost:8090 |
| Swagger | http://localhost:8090/docs |
| Adminer | http://localhost:8081 — servidor `postgres`, BD/usuario/clave según `deploy/env/qa.env` |
| PostgreSQL | `localhost:5433` |

Detener y eliminar contenedores:

```bash
docker compose --env-file deploy/env/qa.env -f docker-compose.qa.yml down
```

Reiniciar datos QA desde cero:

```bash
docker compose --env-file deploy/env/qa.env -f docker-compose.qa.yml down -v
docker compose --env-file deploy/env/qa.env -f docker-compose.qa.yml up -d --build
```

## Entorno productivo

Un único punto de entrada (**gateway nginx**): sirve el front estático y enruta `/api/` al backend. PostgreSQL y la API no se publican al host.

```bash
cp deploy/env/prod.env.example deploy/env/prod.env
# Obligatorio: definir POSTGRES_PASSWORD, JWT_SECRET_KEY y CORS_ORIGINS reales

docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml up -d --build
```

| Servicio | URL / puerto (valores por defecto) |
|----------|-------------------------------------|
| Aplicación | http://localhost:80 (configurable con `HTTP_PORT` en `deploy/env/prod.env`) |
| Health check | http://localhost/health |

Detener:

```bash
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml down
```

### Notas de despliegue

- Los archivos `deploy/env/*.env` están en `.gitignore`; no subas secretos al repositorio.
- El front en prod/QA usa **same-origin** (`VITE_API_URL=""`): las peticiones van a `/api/v1/...` a través del gateway.
- Para TLS/HTTPS delante del gateway, termina SSL en un balanceador o proxy inverso externo y reenvía tráfico HTTP al puerto `HTTP_PORT`.
- Volúmenes separados por entorno: `kitchenflow_pgdata` (dev), `kitchenflow_pgdata_qa`, `kitchenflow_pgdata_prod`.

## Estructura del repositorio

| Carpeta   | Contenido |
|-----------|-----------|
| `front/`  | SPA React + Vite |
| `backend/` | API FastAPI (`uvicorn`) |
| `db/`     | SQL de esquema y seed (`docker-init/` para Compose; `create.sql` / `populate.sql` como referencia o carga manual) |
| `deploy/` | Dockerfile del gateway nginx, configs nginx y plantillas de variables de entorno |

Para ejecutar solo una parte (solo front, solo API o solo base de datos), consulta el `README.md` dentro de cada carpeta.
