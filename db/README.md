# Base de datos (KitchenFlow)

Scripts SQL para **PostgreSQL**: esquema, datos de ejemplo y la copia que usa Docker al inicializar el volumen.

## Contenido

| Archivo / carpeta | Uso |
|-------------------|-----|
| `docker-init/01-schema.sql` | Esquema aplicado automáticamente al crear el volumen de Postgres en Compose. |
| `docker-init/02-seed.sql` | Datos de ejemplo (seed), mismo contexto que el anterior. |
| `create.sql` | Referencia o creación manual del esquema (equivalente conceptual al init). |
| `populate.sql` | Referencia o carga manual de datos de ejemplo. |

Los scripts en `docker-init/` se ejecutan en orden por nombre al primer arranque del contenedor Postgres (solo si el directorio de datos está vacío).

## Ejecutar solo la base de datos con Docker Compose

Desde la raíz del repositorio:

```bash
docker compose up postgres adminer
```

- PostgreSQL: `localhost:5432` — usuario `kitchenflow`, contraseña `kitchenflow`, base `kitchenflow`.
- Adminer: http://localhost:8080 — sistema **PostgreSQL**, servidor **`postgres`**, usuario/clave/BD **`kitchenflow`**.

Para solo Postgres (sin Adminer):

```bash
docker compose up postgres
```

## Carga manual con `psql`

Si tienes PostgreSQL instalado localmente o un contenedor expuesto en el puerto 5432:

```bash
psql -h localhost -U kitchenflow -d kitchenflow -f create.sql
psql -h localhost -U kitchenflow -d kitchenflow -f populate.sql
```

(Ajusta host, usuario y base si tu entorno es distinto.)

## Reiniciar datos desde cero (Compose)

Los scripts de `docker-init/` no se vuelven a ejecutar si el volumen ya existe. Para forzar una nueva inicialización:

```bash
docker compose down -v
docker compose up postgres
```

**Advertencia:** `-v` elimina el volumen con todos los datos de Postgres del proyecto en Compose.
