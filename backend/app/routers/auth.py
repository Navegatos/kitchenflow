"""Rutas de autenticación (`/login` del front → `POST /api/v1/auth/login`)."""

from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr

from app.services import auth_service
from app.db.dependency import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginBody(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
async def login(body: LoginBody, db: Session = Depends(get_db)) -> dict:
    """
    Valida credenciales y debe devolver token (JWT) y metadatos mínimos del usuario.
    """
    user = await auth_service.authenticate_user(body.email, body.password, db)
    return auth_service.build_login_token_payload(user)


@router.get("/me")
def me_stub() -> dict:
    """
    Stub: en producción leer `Authorization: Bearer` y resolver usuario.
    Aquí solo dispara el stub de carga por UUID (siempre 501 hasta JWT).
    """
    return auth_service.get_current_user_from_token_claims(UUID(int=0))
