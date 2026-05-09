"""Autenticación y sesiones (stub).

En el modelo `users` la contraseña real irá como `password_hash`; el login del front debe
mandar texto plano (HTTPS) solo para este endpoint que validará contra el hash.
"""

from uuid import UUID

from fastapi import HTTPException


def verify_password(plain_password: str, hashed: str) -> bool:
    """
    Esperado: Comparar texto plano con `password_hash` (p. ej. bcrypt/argon2).

    Actualmente seed usa placeholders; al implementar, reemplazar seeds por hashes reales.
    """
    raise HTTPException(status_code=501, detail="verify_password: pendiente")


def hash_password(plain_password: str) -> str:
    """
    Esperado: Generar hash seguro para persistir en `users.password_hash` al crear/editar usuario.
    """
    raise HTTPException(status_code=501, detail="hash_password: pendiente")


def authenticate_user(email: str, password: str) -> dict:
    """
    Esperado:
    - Buscar `users` por `email` activo (`active`).
    - Verificar contraseña con `verify_password`.
    - Si falla credenciales, error 401.
    - En éxito, devolver un dict serializable para el JWT o sesión (id, rol, nombre).
    """
    raise HTTPException(status_code=501, detail="authenticate_user: pendiente")


def build_login_token_payload(user_row: dict) -> dict:
    """
    Esperado:
    - Construir payload del JWT (sub=user id UUID, rol, exp, etc.).
    - No debe incluir el hash de contraseña.
    """
    raise HTTPException(status_code=501, detail="build_login_token_payload: pendiente")


def get_current_user_from_token_claims(user_id: UUID) -> dict:
    """
    Esperado:
    - Cargar usuario desde BD por UUID; rechazar si inactivo o inexistente.
    - Será llamado por dependencias `Depends()` en rutas protegidas.
    """
    raise HTTPException(status_code=501, detail="get_current_user_from_token_claims: pendiente")
