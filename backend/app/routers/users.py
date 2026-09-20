import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.db import get_db
from app.core.security import hash_password, verify_password
from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.favorite import Favorite
from app.models.room import Room
from app.models.contact import Contact
from app.schemas.user import UserProfile, ProfileStatsResponse, UpdateProfileRequest
from app.schemas.auth import ChangePasswordRequest, UserSafe
from app.schemas.room import RoomOut, FavoriteOut

router = APIRouter(prefix="/user", dependencies=[Depends(get_current_user)])


def parse_servicios(raw):
    if not raw:
        return []
    if isinstance(raw, list):
        return raw
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except Exception:
            return []
    return []


@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav_count = db.query(func.count(Favorite.id)).filter(Favorite.userId == current_user.id).scalar() or 0
    msg_count = db.query(func.count(Contact.id)).filter(Contact.userId == current_user.id).scalar() or 0

    user_profile = UserProfile.model_validate(current_user)
    return success_response(
        data=ProfileStatsResponse(
            user=user_profile,
            stats={"favoritos": fav_count, "mensajes": msg_count},
        ).model_dump(),
        message="Perfil obtenido",
    )


@router.put("/profile")
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)

    if "email" in data and data["email"] != current_user.email:
        existing = db.query(User).filter(User.email == data["email"], User.id != current_user.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="EMAIL_EXISTS",
            )

    for key, value in data.items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)

    user_profile = UserProfile.model_validate(current_user)
    return success_response(data=user_profile.model_dump(), message="Perfil actualizado")


@router.put("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.old_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta",
        )

    current_user.password = hash_password(payload.new_password)
    db.commit()
    return success_response(message="Contraseña actualizada correctamente")


@router.get("/favorites")
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Favorite, Room, User)
        .join(Room, Favorite.habitacionId == Room.id)
        .outerjoin(User, Room.hostId == User.id)
        .filter(Favorite.userId == current_user.id)
        .order_by(Favorite.createdAt.desc())
    )
    results = query.all()

    favoritos = []
    for fav, room, host in results:
        room_data = RoomOut(
            id=room.id,
            hostId=room.hostId,
            titulo=room.titulo,
            descripcion=room.descripcion,
            precio=float(room.precio) if room.precio else 0,
            ubicacion=room.ubicacion,
            capacidad=room.capacidad,
            tipo=room.tipo,
            servicios=parse_servicios(room.servicios),
            imageUrl=room.imageUrl,
            disponible=room.disponible,
            createdAt=room.createdAt,
            hostFirstName=host.firstName if host else None,
            hostLastName=host.lastName if host else None,
            hostEmail=host.email if host else None,
            hostPhone=host.phone if host else None,
        )
        fav_out = FavoriteOut(
            favoritoId=fav.id,
            favoritoAt=fav.createdAt,
            habitacion=room_data,
        )
        favoritos.append(fav_out.model_dump())

    return success_response(
        data={"favoritos": favoritos, "total": len(favoritos)},
        message="Favoritos obtenidos",
    )


@router.post("/favorites/{room_id}")
def toggle_favorite_add(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Favorite)
        .filter(Favorite.userId == current_user.id, Favorite.habitacionId == room_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return success_response(data={"isFavorite": False}, message="Eliminado de favoritos")

    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    fav = Favorite(userId=current_user.id, habitacionId=room_id)
    db.add(fav)
    db.commit()
    return success_response(data={"isFavorite": True}, message="Agregado a favoritos")


@router.delete("/favorites/{room_id}")
def toggle_favorite_del(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Favorite)
        .filter(Favorite.userId == current_user.id, Favorite.habitacionId == room_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return success_response(data={"isFavorite": False}, message="Eliminado de favoritos")

    return success_response(data={"isFavorite": False}, message="No estaba en favoritos")
