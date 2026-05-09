"""Usuarios (`/usuarios` en el front)."""

from uuid import UUID

from fastapi import APIRouter, Query

from app.services import users_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
def list_users(
    active_only: bool | None = Query(None),
    role: str | None = Query(None),
) -> list:
    return users_service.list_users(active_only=active_only, role_filter=role)


@router.get("/{user_id}")
def get_user(user_id: UUID) -> dict:
    return users_service.get_user_by_id(user_id)


@router.post("")
def create_user(ep: dict) -> dict:
    """Cuerpo: email, first_name, last_name, password, role."""
    return users_service.create_user(
        email=ep["email"],
        first_name=ep["first_name"],
        last_name=ep["last_name"],
        password_plain=ep["password"],
        role=ep["role"],
    )


@router.patch("/{user_id}")
def patch_user(user_id: UUID, ep: dict) -> dict:
    return users_service.update_user(
        user_id,
        first_name=ep.get("first_name"),
        last_name=ep.get("last_name"),
        email=ep.get("email"),
        role=ep.get("role"),
        active=ep.get("active"),
    )


@router.post("/{user_id}/password")
def reset_password(user_id: UUID, ep: dict) -> dict:
    users_service.set_user_password(user_id, ep["password"])
    return {"ok": True}
