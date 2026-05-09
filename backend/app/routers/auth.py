"""Rutas de autenticación (`/login` del front → `POST /api/v1/auth/login`)."""

from uuid import UUID

from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginBody(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
def login(body: LoginBody) -> dict:
    """
    Valida credenciales y debe devolver token (JWT) y metadatos mínimos del usuario.
    """
    user = auth_service.authenticate_user(body.email, body.password)
    return auth_service.build_login_token_payload(user)


@router.get("/me")
def me_stub() -> dict:
    """
    Stub: en producción leer `Authorization: Bearer` y resolver usuario.
    Aquí solo dispara el stub de carga por UUID (siempre 501 hasta JWT).
    """
    return auth_service.get_current_user_from_token_claims(UUID(int=0))
