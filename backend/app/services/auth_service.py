"""Autenticación y sesiones (stub).

En el modelo `users` la contraseña real irá como `password_hash`; el login del front debe
mandar texto plano (HTTPS) solo para este endpoint que validará contra el hash.
"""

from uuid import UUID

from fastapi import HTTPException

from app.db.dependency import get_db
from app.models.user_model import User
from sqlalchemy.orm import Session
from datetime import datetime, timedelta


def verify_password(plain_password: str, hashed: str) -> bool:
    """
    Esperado: Comparar texto plano con `password_hash` (p. ej. bcrypt/argon2).

    Actualmente seed usa placeholders; al implementar, reemplazar seeds por hashes reales.
    """
    return plain_password == hashed


def hash_password(plain_password: str) -> str:
    """Hash de contraseña; placeholder compatible con seed hasta usar bcrypt."""
    return plain_password


async def authenticate_user(email: str, password: str, db: Session) -> dict:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user


def build_login_token_payload(user: User) -> dict:
    """
    Esperado:
    - Construir payload del JWT (sub=user id UUID, rol, exp, etc.).
    - No debe incluir el hash de contraseña.
    """
    return {
        "sub": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "exp": datetime.now() + timedelta(hours=1)
    }

def get_current_user_from_token_claims(user_id: UUID) -> dict:
    """
    Esperado:
    - Cargar usuario desde BD por UUID; rechazar si inactivo o inexistente.
    - Será llamado por dependencias `Depends()` en rutas protegidas.
    """
    raise HTTPException(status_code=501, detail="get_current_user_from_token_claims: pendiente")
