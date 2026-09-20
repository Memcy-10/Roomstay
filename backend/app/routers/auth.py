from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_random_token,
)
from app.core.responses import success_response, error_response
from app.dependencies.auth import get_current_user
from app.models.role import Role
from app.models.user import User
from app.models.password_recovery import PasswordRecovery
from app.schemas.auth import (
    RoleOut,
    RegisterRequest,
    LoginRequest,
    RecoverPasswordRequest,
    ResetPasswordRequest,
    UserSafe,
    AuthResponse,
)
from app.core.config import settings

router = APIRouter(prefix="/auth")


@router.get("/roles")
def get_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    roles_out = [RoleOut.model_validate(r) for r in roles]
    return success_response(data={"roles": roles_out}, message="Roles obtenidos")


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="EMAIL_EXISTS",
        )

    existing_doc = db.query(User).filter(User.documentNumber == payload.documentNumber).first()
    if existing_doc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="DOCUMENT_EXISTS",
        )

    hashed_pw = hash_password(payload.password)
    user = User(
        firstName=payload.firstName,
        lastName=payload.lastName,
        documentType=payload.documentType,
        documentNumber=payload.documentNumber,
        address=payload.address,
        phone=payload.phone,
        email=payload.email,
        password=hashed_pw,
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id, email=user.email, role=user.role)
    user_safe = UserSafe.model_validate(user)
    return success_response(
        data=AuthResponse(user=user_safe, token=token).model_dump(),
        message="Registro exitoso",
        status_code=201,
    )


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.estado != "activo" or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales invÃ¡lidas",
        )

    token = create_access_token(user_id=user.id, email=user.email, role=user.role)
    user_safe = UserSafe.model_validate(user)
    return success_response(
        data=AuthResponse(user=user_safe, token=token).model_dump(),
        message="Inicio de sesiÃ³n exitoso",
    )


@router.post("/recover-password")
def recover_password(payload: RecoverPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    response_data = {"emailSent": True}

    if user:
        token = generate_random_token()
        expires_at = datetime.utcnow() + timedelta(hours=1)
        recovery = PasswordRecovery(
            email=payload.email,
            token=token,
            expiresAt=expires_at,
        )
        db.add(recovery)
        db.commit()

        print(f"[MOCK-EMAIL] RecuperaciÃ³n de contraseÃ±a para {payload.email} -> token: {token}")

        if settings.ENV == "development":
            response_data["token"] = token

    return success_response(data=response_data, message="Si el correo existe, se enviÃ³ un enlace de recuperaciÃ³n")


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    recovery = (
        db.query(PasswordRecovery)
        .filter(
            PasswordRecovery.token == payload.token,
            PasswordRecovery.usado == False,
            PasswordRecovery.expiresAt > datetime.utcnow(),
        )
        .first()
    )

    if not recovery:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invÃ¡lido o expirado",
        )

    user = db.query(User).filter(User.email == recovery.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario no encontrado",
        )

    user.password = hash_password(payload.newPassword)
    recovery.usado = True
    db.commit()

    return success_response(message="ContraseÃ±a actualizada correctamente")


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    user_safe = UserSafe.model_validate(current_user)
    return success_response(data=user_safe.model_dump(), message="Usuario actual")
