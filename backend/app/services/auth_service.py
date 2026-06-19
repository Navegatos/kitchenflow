"""Autenticación con contraseñas bcrypt y tokens JWT."""

from datetime import datetime, timedelta, timezone
from uuid import UUID

import bcrypt
import jwt
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.user_model import User
from app.services.serializers import enum_val, uuid_str


def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode(), hashed.encode())
    except ValueError:
        return False


def create_access_token(*, user_id: UUID, role: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expire_hours)
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=401, detail="Token expirado") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Token inválido") from exc


def get_user_id_from_token(token: str) -> UUID:
    claims = decode_access_token(token)
    try:
        return UUID(claims["sub"])
    except (KeyError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=401, detail="Token inválido") from exc


async def authenticate_user(email: str, password: str, db: Session) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    if not user.active:
        raise HTTPException(status_code=403, detail="Usuario desactivado")
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    return user


def build_login_token_payload(user: User, *, branch_name: str | None = None) -> dict:
    settings = get_settings()
    role = enum_val(user.role)
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expire_hours)

    return {
        "access_token": create_access_token(user_id=user.id, role=role),
        "token_type": "bearer",
        "sub": uuid_str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": role,
        "branch_id": uuid_str(user.branch_id),
        "branch_name": branch_name,
        "exp": expire.isoformat(),
    }


def get_current_user_from_token_claims(user_id: UUID, db: Session) -> dict:
    """
    Carga usuario desde BD por UUID; rechaza si inactivo o inexistente.
    Usado por `/auth/me` y dependencias `Depends()` en rutas protegidas.
    """
    from app.services import config_service

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    if not user.active:
        raise HTTPException(status_code=403, detail="Usuario desactivado")
    branch_name = config_service.get_branch_name(db, user.branch_id)
    return build_login_token_payload(user, branch_name=branch_name)
