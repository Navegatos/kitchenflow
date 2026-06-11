# Changelog

Todos los cambios notables de la rama `dale-tu-front` respecto a `main`.

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
