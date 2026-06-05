"""Usuarios del sistema."""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user_model import User
from app.services import auth_service
from app.services.serializers import dt_iso, uuid_str

_VALID_ROLES = {"ADMIN", "MANAGER", "CHEF", "WAITER"}


def _user_to_dict(user: User) -> dict:
    return {
        "id": uuid_str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "active": user.active,
        "created_at": dt_iso(user.created_at),
        "updated_at": dt_iso(user.updated_at),
    }


def _validate_role(role: str) -> str:
    role = role.upper()
    if role not in _VALID_ROLES:
        raise HTTPException(status_code=400, detail="role inválido")
    return role


def list_users(
    db: Session,
    *,
    active_only: bool | None = None,
    role_filter: str | None = None,
) -> list:
    q = db.query(User)
    if active_only is True:
        q = q.filter(User.active.is_(True))
    elif active_only is False:
        q = q.filter(User.active.is_(False))
    if role_filter is not None:
        q = q.filter(User.role == _validate_role(role_filter))
    return [_user_to_dict(u) for u in q.order_by(User.last_name, User.first_name).all()]


def get_user_by_id(db: Session, user_id: UUID) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return _user_to_dict(user)


def create_user(
    db: Session,
    *,
    email: str,
    first_name: str,
    last_name: str,
    password_plain: str,
    role: str,
) -> dict:
    user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        password_hash=auth_service.hash_password(password_plain),
        role=_validate_role(role),
        active=True,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email ya registrado") from None
    db.refresh(user)
    return _user_to_dict(user)


def update_user(
    db: Session,
    user_id: UUID,
    *,
    first_name: str | None = None,
    last_name: str | None = None,
    email: str | None = None,
    role: str | None = None,
    active: bool | None = None,
) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
    if email is not None:
        user.email = email
    if role is not None:
        user.role = _validate_role(role)
    if active is not None:
        user.active = active

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email ya registrado") from None
    db.refresh(user)
    return _user_to_dict(user)


def set_user_password(db: Session, user_id: UUID, new_plain_password: str) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.password_hash = auth_service.hash_password(new_plain_password)
    db.commit()


def touch_last_login(db: Session, user_id: UUID) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.commit()
