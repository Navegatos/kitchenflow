"""Usuarios (`/usuarios` en el front)."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.dependency import get_db
from app.services import users_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
def list_users(
    active_only: bool | None = Query(None),
    role: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list:
    return users_service.list_users(db, active_only=active_only, role_filter=role)


@router.get("/{user_id}")
def get_user(user_id: UUID, db: Session = Depends(get_db)) -> dict:
    return users_service.get_user_by_id(db, user_id)


@router.post("")
def create_user(ep: dict, db: Session = Depends(get_db)) -> dict:
    return users_service.create_user(
        db,
        email=ep["email"],
        first_name=ep["first_name"],
        last_name=ep["last_name"],
        password_plain=ep["password"],
        role=ep["role"],
        branch_id=UUID(ep["branch_id"]) if ep.get("branch_id") else None,
    )


@router.patch("/{user_id}")
def patch_user(user_id: UUID, ep: dict, db: Session = Depends(get_db)) -> dict:
    return users_service.update_user(
        db,
        user_id,
        first_name=ep.get("first_name"),
        last_name=ep.get("last_name"),
        email=ep.get("email"),
        role=ep.get("role"),
        active=ep.get("active"),
        branch_id=UUID(ep["branch_id"]) if ep.get("branch_id") else None,
        clear_branch=ep.get("clear_branch", False),
    )


@router.post("/{user_id}/password")
def reset_password(user_id: UUID, ep: dict, db: Session = Depends(get_db)) -> dict:
    users_service.set_user_password(db, user_id, ep["password"])
    return {"ok": True}
