# Backend (KitchenFlow API)

API REST con [FastAPI](https://fastapi.tiangolo.com/), servida con Uvicorn en el puerto **8000**.

## Ejecutar solo el backend con Docker

Desde la raíz del repositorio (necesitas PostgreSQL accesible con la misma URL que espera la app):

```bash
docker compose up --build backend postgres
```

La variable `DATABASE_URL` que usa Compose apunta al servicio `postgres` dentro de la red Docker.

## Ejecutar solo el backend en tu máquina (sin Docker del API)

1. Ten PostgreSQL en marcha (por ejemplo con `docker compose up postgres` desde la raíz del repo).

2. Crea un entorno virtual e instala dependencias:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

3. Configura la URL de base de datos (coincide con el valor por defecto si usas Compose solo para Postgres):

```bash
export DATABASE_URL='postgresql+psycopg://kitchenflow:kitchenflow@localhost:5432/kitchenflow'
```

Crea un archivo `.env` en `backend/` (puedes copiar `.env.example`) con al menos `DATABASE_URL` y `JWT_SECRET_KEY`.

4. Arranca Uvicorn desde la carpeta `backend/` para que el paquete `app` se resuelva bien:

```bash
cd backend
export PYTHONPATH="${PWD}"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Documentación interactiva: http://127.0.0.1:8000/docs  
- Comprobación rápida: http://127.0.0.1:8000/health  

Asegúrate de que `CORS_ORIGINS` incluya el origen del front si llamas desde el navegador (por defecto ya incluye `http://localhost:5173`; puedes definir `CORS_ORIGINS` en `.env` separando varios orígenes por comas).

---

## Cómo añadir un endpoint (ejemplo breve)

El proyecto agrupa rutas en routers bajo `app/routers/` y delega la lógica en `app/services/`. Los routers se registran en `app/main.py` con prefijo `/api/v1`.

### 1. Router nuevo

Crea `app/routers/ejemplo.py`:

```python
from fastapi import APIRouter

router = APIRouter(prefix="/ejemplo", tags=["ejemplo"])


@router.get("/hola")
def hola() -> dict[str, str]:
    return {"mensaje": "hola"}
```

### 2. Registrar el router

En `app/main.py`, importa el módulo y añade:

```python
from app.routers import ejemplo

app.include_router(ejemplo.router, prefix="/api/v1")
```

La ruta quedará disponible como **GET** `/api/v1/ejemplo/hola`.

Para operaciones con persistencia, sigue el patrón de los routers existentes: el endpoint llama a funciones en `app/services/` y el router solo valida entrada/salida (modelos Pydantic) y códigos HTTP.
