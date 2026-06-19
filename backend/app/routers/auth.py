"""Rutas de autenticación (`/login` del front → `POST /api/v1/auth/login`)."""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.dependency import get_db
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer()


class LoginBody(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
async def login(body: LoginBody, db: Session = Depends(get_db)) -> dict:
    """Valida credenciales y devuelve JWT con metadatos mínimos del usuario."""
    from app.services import config_service

    user = await auth_service.authenticate_user(body.email, body.password, db)
    branch_name = config_service.get_branch_name(db, user.branch_id)
    return auth_service.build_login_token_payload(user, branch_name=branch_name)


@router.get("/me")
def me(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> dict:
    """Valida el JWT y devuelve datos del usuario (renueva token si sigue activo)."""
    user_id = auth_service.get_user_id_from_token(credentials.credentials)
    return auth_service.get_current_user_from_token_claims(user_id, db)
