"""Rutas de autenticación (`/login` del front → `POST /api/v1/auth/login`)."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
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
    from app.services import config_service

    user = await auth_service.authenticate_user(body.email, body.password, db)
    branch_name = config_service.get_branch_name(db, user.branch_id)
    return auth_service.build_login_token_payload(user, branch_name=branch_name)


@router.get("/me")
def me(user_id: UUID = Query(...), db: Session = Depends(get_db)) -> dict:
    """
    Valida que la sesión siga vigente: usuario existe y está activo.
    Hasta tener JWT, el front envía el `sub` guardado en localStorage.
    """
    return auth_service.get_current_user_from_token_claims(user_id, db)
