# Guía de despliegue de KitchenFlow

Informe orientado al cliente para decidir **dónde y cómo hostear** la aplicación KitchenFlow en un entorno real (producción o preproducción).

---

## 1. Resumen ejecutivo

KitchenFlow es una aplicación web compuesta por:

| Componente | Tecnología | Rol |
|------------|------------|-----|
| **Frontend** | React + Vite | Interfaz de usuario (SPA) |
| **Backend** | FastAPI (Python) | API REST y autenticación |
| **Base de datos** | PostgreSQL 16 | Persistencia de datos |
| **Gateway** | nginx | Punto de entrada único: sirve el front y enruta `/api/` al backend |

El proyecto incluye **orquestación con Docker Compose** y perfiles listos para:

- **Desarrollo local** — para el equipo técnico (`docker-compose.yml`).
- **QA / staging** — entorno de pruebas previo a producción (`docker-compose.qa.yml`).
- **Producción** — despliegue recomendado para usuarios finales (`docker-compose.prod.yml`).

**Recomendación general:** el camino más directo y alineado con lo que ya está preparado en el repositorio es desplegar en **un servidor Linux con Docker** (VPS o máquina virtual en la nube). Las plataformas cloud (AWS, GCP, Azure) encajan bien si se usa una **VM** con el mismo flujo; servicios totalmente gestionados (Kubernetes, Cloud Run, Fargate, etc.) son posibles pero **requieren trabajo adicional** no incluido en este repositorio.

---

## 2. Arquitectura en producción

En producción solo se expone **un puerto HTTP** hacia el exterior (por defecto el **80**). PostgreSQL y la API **no** se publican al host: quedan en una red interna de Docker.

```
                    Internet
                        │
                        ▼
              ┌─────────────────┐
              │  Gateway nginx  │  ← único servicio expuesto (HTTP_PORT)
              │  (front + proxy)│
              └────────┬────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
  Archivos estáticos            /api/* → Backend
  (React compilado)             FastAPI :8000
                                       │
                                       ▼
                                 PostgreSQL :5432
                                 (solo red interna)
```

**Comportamiento clave:**

- El frontend en producción usa **same-origin**: las peticiones van a `/api/v1/...` a través del gateway (no hace falta configurar una URL externa de API en el navegador).
- Al arrancar, PostgreSQL inicializa esquema y datos de ejemplo **solo la primera vez** que se crea el volumen de datos.
- El backend aplica **migraciones SQL automáticamente** en cada arranque.
- Existe un endpoint de salud: `GET /health` (accesible vía el gateway).

---

## 3. Requisitos del servidor

### Software obligatorio

- **Sistema operativo:** Linux (Ubuntu 22.04/24.04 LTS, Debian 12 u otra distro estable).
- **Docker** (versión reciente).
- **Docker Compose v2** (comando `docker compose`, no el binario legacy `docker-compose`).
- Acceso **SSH** para administración (en despliegues en la nube).

### Recursos mínimos recomendados

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 vCPU | 2–4 vCPU |
| RAM | 2 GB | 4 GB |
| Disco | 20 GB SSD | 40 GB SSD o más |
| Red | IP pública o balanceador delante | Dominio propio + HTTPS |

Estos valores cubren PostgreSQL, la API con 2 workers (`uvicorn`) y nginx. Si el tráfico crece, conviene escalar verticalmente (más RAM/CPU) o plantear alta disponibilidad con ayuda de infraestructura adicional.

### Puertos

| Puerto | Producción | QA |
|--------|------------|-----|
| Aplicación (gateway) | `80` (configurable) | `8090` (configurable) |
| PostgreSQL hacia el host | **No expuesto** | `5433` (opcional, para herramientas) |
| Adminer (UI de BD) | **No incluido** | `8081` (opcional) |

En producción, abra en el firewall **solo** el puerto HTTP/HTTPS que use el gateway (normalmente 80 y 443 si termina TLS en el servidor o en un balanceador).

---

## 4. Dónde hostear: opciones para el cliente

### 4.1 VPS (servidor virtual dedicado)

**Ejemplos:** DigitalOcean, Hetzner, Linode, Vultr, OVH, proveedores locales.

| Ventajas | Desventajas |
|----------|-------------|
| Coste predecible y bajo | Usted gestiona actualizaciones, backups y seguridad |
| Flujo de despliegue **idéntico** al documentado aquí | Un solo servidor = punto único de fallo |
| Control total del entorno | Escalado horizontal no automático |

**Cuándo tiene sentido:** equipos pequeños, un restaurante o cadena con tráfico moderado, presupuesto ajustado, necesidad de desplegar rápido sin complejidad cloud.

**Flujo típico:** contratar VPS → instalar Docker → clonar repositorio → configurar `prod.env` → `docker compose up`.

---

### 4.2 Amazon Web Services (AWS)

#### Opción A — EC2 (recomendada dentro de AWS)

Una instancia EC2 (Linux) equivale a un VPS. Es la opción que **mejor encaja** con este proyecto sin cambios.

| Ventajas | Desventajas |
|----------|-------------|
| Integración con Route 53 (DNS), ACM (certificados), ALB | Curva de aprendizaje y facturación por servicios |
| Snapshots EBS para backups de disco | Debe configurar security groups (solo 80/443/22) |
| Escalable cambiando tipo de instancia | |

**TLS recomendado en AWS:** Application Load Balancer (ALB) con certificado ACM → reenvío HTTP al puerto `HTTP_PORT` de la EC2. El README del proyecto indica explícitamente terminar SSL **delante** del gateway nginx.

#### Opción B — RDS (PostgreSQL gestionado)

Sustituir el contenedor `postgres` por Amazon RDS es posible, pero **no está automatizado** en el Compose actual: habría que apuntar `DATABASE_URL` a RDS, crear el esquema manualmente o adaptar el despliegue. Solo compensa si ya usan RDS o necesitan backups gestionados por AWS.

#### Opciones menos directas

- **ECS/Fargate, EKS, Elastic Beanstalk:** requieren dividir el stack o reescribir la orquestación; no vienen preparadas en el repo.
- **Lightsail:** similar a VPS con interfaz simplificada; válida si prefieren simplicidad dentro del ecosistema AWS.

---

### 4.3 Google Cloud Platform (GCP)

#### Opción A — Compute Engine (recomendada dentro de GCP)

Máquina virtual Linux = mismo procedimiento que VPS/EC2.

| Ventajas | Desventajas |
|----------|-------------|
| Cloud Load Balancing + certificados gestionados | Configuración de VPC, firewall rules |
| Snapshots de disco | |
| Cloud SQL disponible si más adelante quieren BD gestionada | Cloud SQL implica adaptación manual |

#### Otras opciones GCP

- **Cloud Run / GKE:** orientadas a contenedores desacoplados; no usan directamente el `docker-compose.prod.yml` actual.
- **Firebase Hosting:** solo cubriría el frontend; la API y PostgreSQL irían aparte.

---

### 4.4 Microsoft Azure

#### Opción A — Azure Virtual Machine (recomendada dentro de Azure)

Equivalente a VPS/EC2/Compute Engine.

| Ventajas | Desventajas |
|----------|-------------|
| Azure Database for PostgreSQL (opcional futuro) | NSG, discos y costes por componentes |
| Application Gateway o Front Door para HTTPS | |
| Integración con Azure DNS | |

#### Otras opciones Azure

- **Container Apps / AKS:** requieren adaptar el despliegue fuera de Compose monolítico.
- **App Service:** posible con contenedores custom, pero no es el camino documentado en el proyecto.

---

### 4.5 Tabla comparativa rápida

| Criterio | VPS | AWS EC2 | GCP Compute Engine | Azure VM |
|----------|-----|---------|-------------------|----------|
| Alineación con el repo | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| Simplicidad | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ |
| Certificados HTTPS gestionados | Manual / Let's Encrypt | ACM + ALB | Managed certs + LB | App Gateway / Front Door |
| BD gestionada (opcional) | No (contenedor) | RDS | Cloud SQL | Azure Database |
| Coste inicial típico | Bajo | Medio | Medio | Medio |

**Conclusión para la decisión:** cualquier opción basada en **una VM Linux + Docker** es válida. La elección suele depender de contratos existentes, región, soporte y preferencia de facturación, no de limitaciones técnicas del producto.

---

## 5. Despliegue paso a paso (producción)

Los siguientes pasos asumen un servidor Linux recién aprovisionado con acceso root o sudo.

### Paso 1 — Preparar el servidor

1. Actualizar el sistema e instalar Docker siguiendo la [documentación oficial de Docker](https://docs.docker.com/engine/install/).
2. Verificar:

```bash
docker --version
docker compose version
```

3. Configurar firewall (ejemplo con `ufw`):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp   # si terminará HTTPS en este servidor
sudo ufw enable
```

4. (Opcional) Crear un usuario de despliegue con permisos Docker, en lugar de operar siempre como root.

### Paso 2 — Obtener el código

Clonar el repositorio en el servidor (o copiar un artefacto de release acordado con el proveedor):

```bash
git clone <URL_DEL_REPOSITORIO> kitchenflow
cd kitchenflow
```

Use la rama o tag acordado para producción (por ejemplo `main` o una release etiquetada).

### Paso 3 — Configurar variables de entorno (CRÍTICO)

Copie la plantilla y edítela **en el servidor**. Este archivo **no debe subirse a Git** (está en `.gitignore`).

```bash
cp deploy/env/prod.env.example deploy/env/prod.env
nano deploy/env/prod.env   # o el editor que prefiera
```

Contenido de referencia (`deploy/env/prod.env.example`):

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `HTTP_PORT` | No (default `80`) | Puerto en el host donde escucha el gateway nginx |
| `POSTGRES_USER` | Sí | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | **Sí — cambiar** | Contraseña fuerte de la base de datos |
| `POSTGRES_DB` | Sí | Nombre de la base de datos |
| `JWT_SECRET_KEY` | **Sí — cambiar** | Secreto para firmar tokens de sesión (mín. 32 caracteres aleatorios) |
| `CORS_ORIGINS` | **Sí — cambiar** | URL pública de la aplicación (ej. `https://app.sudominio.com`), sin barra final |

**Generar secretos seguros (ejemplos):**

```bash
# Contraseña de PostgreSQL (32 bytes en base64)
openssl rand -base64 32

# JWT secret (64 caracteres hex)
openssl rand -hex 32
```

**Ejemplo de `deploy/env/prod.env` configurado:**

```env
HTTP_PORT=80

POSTGRES_USER=kitchenflow
POSTGRES_PASSWORD=<contraseña_larga_generada>
POSTGRES_DB=kitchenflow

JWT_SECRET_KEY=<secreto_jwt_generado>
CORS_ORIGINS=https://app.ejemplo.com
```

> **Importante:** si cambia `POSTGRES_PASSWORD` después del primer arranque, debe coincidir con la contraseña ya almacenada en el volumen de PostgreSQL o reconfigurar la BD manualmente. Lo habitual es definir secretos definitivos **antes** del primer `up` en producción.

### Paso 4 — Construir y levantar el stack

Desde la raíz del repositorio:

```bash
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml up -d --build
```

Docker Compose:

1. Crea la red interna `kitchenflow-prod`.
2. Levanta PostgreSQL con volumen persistente `kitchenflow_pgdata_prod`.
3. Ejecuta scripts de `db/docker-init/` **solo si el volumen está vacío** (primera instalación).
4. Arranca el backend (espera a que PostgreSQL esté healthy) y aplica migraciones en `backend/migrations/`.
5. Construye el gateway (compila el frontend + nginx) y lo expone en `HTTP_PORT`.

### Paso 5 — Verificar que funciona

```bash
# Estado de contenedores
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml ps

# Health check
curl -s http://localhost/health
# Respuesta esperada: JSON con estado OK

# Logs (si algo falla)
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml logs -f
```

Abra en el navegador la URL del servidor (IP o dominio). Debe cargarse la pantalla de login.

### Paso 6 — DNS y dominio

1. Cree un registro **A** (o **AAAA** si usa IPv6) apuntando su dominio a la IP pública del servidor o del balanceador.
2. Actualice `CORS_ORIGINS` en `deploy/env/prod.env` con la URL final (`https://...`) y reinicie el backend:

```bash
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml up -d backend
```

### Paso 7 — HTTPS (certificados TLS)

El gateway nginx **interno** escucha en HTTP (puerto 80 dentro del contenedor). El README recomienda **terminar TLS fuera** del contenedor. Opciones habituales:

| Enfoque | Descripción |
|---------|-------------|
| **Balanceador cloud** | AWS ALB + ACM, GCP HTTPS LB, Azure Application Gateway — certificado gestionado, tráfico HTTP hacia el puerto 80 de la VM |
| **Reverse proxy en el host** | Caddy, Traefik o nginx en la máquina, con Let's Encrypt, proxy_pass a `localhost:80` |
| **Cloudflare** | Proxy naranja + SSL flexible o full; el origen puede seguir en HTTP en localhost |

**Datos sensibles en certificados:**

- Guarde claves privadas (`.key`, PEM) con permisos restrictivos (`chmod 600`).
- Renueve certificados Let's Encrypt antes de caducar (automatizable con cron o Caddy).
- No incluya certificados ni claves en el repositorio Git.

---

## 6. Entorno QA (preproducción)

Antes de producción, puede validar un stack casi idéntico con herramientas extra (Swagger, Adminer, PostgreSQL accesible desde fuera).

```bash
cp deploy/env/qa.env.example deploy/env/qa.env
# Editar credenciales en deploy/env/qa.env

docker compose --env-file deploy/env/qa.env -f docker-compose.qa.yml up -d --build
```

| Servicio | URL por defecto |
|----------|-----------------|
| Aplicación | http://localhost:8090 |
| Swagger (documentación API) | http://localhost:8090/docs |
| Adminer (explorar BD) | http://localhost:8081 |
| PostgreSQL desde el host | `localhost:5433` |

**Seguridad en QA:** no exponga Adminer ni el puerto de PostgreSQL a Internet sin restricción por IP o VPN. En QA compartido, cambie `JWT_SECRET_KEY` y `POSTGRES_PASSWORD` respecto a los valores de ejemplo.

Para reiniciar datos QA desde cero:

```bash
docker compose --env-file deploy/env/qa.env -f docker-compose.qa.yml down -v
docker compose --env-file deploy/env/qa.env -f docker-compose.qa.yml up -d --build
```

---

## 7. Configuración sensible — checklist de seguridad

### 7.1 Variables y secretos

| Elemento | Riesgo si se filtra | Acción |
|----------|---------------------|--------|
| `POSTGRES_PASSWORD` | Acceso total a datos de negocio | Valor único, largo, solo en `deploy/env/prod.env` |
| `JWT_SECRET_KEY` | Suplantación de sesiones de usuario | Generar aleatorio; rotar implica cerrar sesiones activas |
| `deploy/env/prod.env` | Compromiso completo del entorno | Permisos `600`, backup cifrado, nunca en Git |
| `backend/.env` | Solo desarrollo local | No usar en producción; prod usa variables del Compose |

### 7.2 Usuarios de la aplicación (datos de demo)

En la **primera inicialización**, PostgreSQL carga usuarios de ejemplo definidos en `db/docker-init/`. Las contraseñas de demo documentadas en migraciones son del tipo `hashed_password_1` … `hashed_password_4` (usuarios `admin@kitchenflow.cl`, `manager@kitchenflow.cl`, etc.).

**En producción debe:**

1. Cambiar las contraseñas de todos los usuarios demo desde la aplicación o la API.
2. Crear usuarios reales con roles adecuados.
3. Eliminar o desactivar cuentas que no vaya a usar.

No deje credenciales de demo activas en un entorno accesible al público.

### 7.3 Red y exposición de servicios

- En **producción**, solo el gateway está publicado; PostgreSQL y la API no tienen puertos en el host.
- No abra Adminer ni Swagger en producción (no forman parte del Compose de prod).
- Restrinja SSH por clave pública; deshabilite login root por contraseña si es posible.

### 7.4 Copias de seguridad

Los datos viven en el volumen Docker **`kitchenflow_pgdata_prod`**.

**Backup lógico (recomendado):**

```bash
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U kitchenflow kitchenflow > backup_$(date +%Y%m%d).sql
```

Programe este comando con **cron** o el scheduler del cloud. Almacene backups cifrados fuera del mismo servidor (S3, Google Cloud Storage, Azure Blob, otro datacenter).

**Restauración:** detener tráfico, restaurar con `psql` o recrear volumen según procedimiento acordado con su equipo técnico.

### 7.5 Actualizaciones

Para desplegar una nueva versión del código:

```bash
cd kitchenflow
git pull   # o desplegar nuevo tag
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml up -d --build
```

Las migraciones SQL nuevas se aplican solas al reiniciar el backend. Conviene hacer backup antes de actualizar.

---

## 8. Operaciones habituales

### Detener la aplicación

```bash
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml down
```

Los datos en el volumen **se conservan**.

### Reiniciar un servicio

```bash
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml restart gateway
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml restart backend
```

### Ver logs

```bash
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml logs -f gateway
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml logs -f backend
docker compose --env-file deploy/env/prod.env -f docker-compose.prod.yml logs -f postgres
```

### Comprobar salud

- **Gateway:** `GET http://<su-dominio>/health`
- **Contenedores:** columna `healthy` en `docker compose ... ps`

---

## 9. Estructura de despliegue en el repositorio

| Ruta | Función |
|------|---------|
| `docker-compose.prod.yml` | Orquestación de producción |
| `docker-compose.qa.yml` | Orquestación de QA |
| `deploy/env/prod.env.example` | Plantilla de variables de producción |
| `deploy/env/qa.env.example` | Plantilla de variables de QA |
| `deploy/Dockerfile.gateway` | Build del front + imagen nginx |
| `deploy/nginx/prod.conf` | Reglas nginx (SPA + proxy `/api/`) |
| `backend/Dockerfile.prod` | Imagen de la API con workers |
| `db/docker-init/` | Esquema y seed inicial de PostgreSQL |

---

## 10. Resumen de decisión para el cliente

1. **¿Presupuesto bajo y simplicidad?** → VPS (Hetzner, DigitalOcean, etc.).
2. **¿Ya están en AWS y quieren integración empresarial?** → EC2 + ALB + ACM; RDS solo si justifica el coste extra.
3. **¿Ecosistema Google?** → Compute Engine + load balancer gestionado.
4. **¿Contrato Microsoft / Azure?** → Azure VM + Application Gateway o Front Door.

En todos los casos el **procedimiento técnico es el mismo:** Linux, Docker, archivo `deploy/env/prod.env` con secretos reales, `docker compose -f docker-compose.prod.yml up -d --build`, dominio, HTTPS delante del gateway y política de backups.

Para dudas de implementación concreta (elección de tamaño de instancia, diseño de red o alta disponibilidad), conviene validar con el equipo de desarrollo o un integrador de infraestructura usando este documento como base.

---

*Documento generado a partir del estado actual del repositorio KitchenFlow. No modifica el código del proyecto.*
