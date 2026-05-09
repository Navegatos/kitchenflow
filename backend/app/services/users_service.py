"""Usuarios: alineados a `Login`, `Users` del front (`mockData.AppUser` → tablas reales)."""

from uuid import UUID

from fastapi import HTTPException


def list_users(*, active_only: bool | None = None, role_filter: str | None = None) -> list:
    """
    Esperado:
    - Listar `users` con filtros opcionales (activo, rol).
    - Mapear rol BD (`ADMIN`…`WAITER`) a lo que consuma el front si difiere (`admin`/`operator`).
    """
    raise HTTPException(status_code=501, detail="list_users: pendiente")


def get_user_by_id(user_id: UUID) -> dict:
    """
    Esperado: Devolver un usuario o 404 si no existe.
    """
    raise HTTPException(status_code=501, detail="get_user_by_id: pendiente")


def create_user(
    *,
    email: str,
    first_name: str,
    last_name: str,
    password_plain: str,
    role: str,
) -> dict:
    """
    Esperado:
    - Validar unicidad de `email`.
    - Calcular hash con `auth_service.hash_password`.
    - Insert en `users` con `role` válido (`user_role`).
    """
    raise HTTPException(status_code=501, detail="create_user: pendiente")


def update_user(
    user_id: UUID,
    *,
    first_name: str | None = None,
    last_name: str | None = None,
    email: str | None = None,
    role: str | None = None,
    active: bool | None = None,
) -> dict:
    """
    Esperado: `PATCH`/`PUT` sobre `users`; rechazar cambios ilegales por rol del solicitante.
    """
    raise HTTPException(status_code=501, detail="update_user: pendiente")


def set_user_password(user_id: UUID, new_plain_password: str) -> None:
    """
    Esperado: Actualizar `password_hash` (flujo recuperación / admin).
    """
    raise HTTPException(status_code=501, detail="set_user_password: pendiente")


def touch_last_login(user_id: UUID) -> None:
    """
    Esperado:
    - El mock del front muestra `lastLogin`; BD actual no tiene la columna.
    - Opciones: tabla `sessions`/`audit_login` o migración nueva columna
      `users.last_login_at`. Actualizar timestamps al login OK.
    """
    raise HTTPException(status_code=501, detail="touch_last_login: pendiente")
