from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.db import get_db
from app.core.security import hash_password
from app.core.responses import success_response
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.models.room import Room
from app.models.reservation import Reservation, ReservationStatus
from app.schemas.admin import AdminUserCreate, AdminUserUpdate
from app.schemas.auth import UserSafe
from app.schemas.reservation import ReservationOut

router = APIRouter(prefix="/admin", dependencies=[Depends(get_current_user), Depends(require_admin)])


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(desc(User.createdAt)).all()
    users_out = [UserSafe.model_validate(u).model_dump() for u in users]
    return success_response(
        data={"users": users_out, "total": len(users_out)},
        message="Usuarios obtenidos",
    )


@router.post("/users")
def create_user(
    payload: AdminUserCreate,
    db: Session = Depends(get_db),
):
    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="EMAIL_EXISTS")

    existing_doc = db.query(User).filter(User.documentNumber == payload.documentNumber).first()
    if existing_doc:
        raise HTTPException(status_code=409, detail="DOCUMENT_EXISTS")

    user = User(
        firstName=payload.firstName,
        lastName=payload.lastName,
        documentType=payload.documentType,
        documentNumber=payload.documentNumber,
        address=payload.address,
        phone=payload.phone,
        email=payload.email,
        password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user_out = UserSafe.model_validate(user).model_dump()
    return success_response(data=user_out, message="Usuario creado", status_code=201)


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    data = payload.model_dump(exclude_unset=True)

    if "email" in data and data["email"] != user.email:
        existing = db.query(User).filter(User.email == data["email"], User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="EMAIL_EXISTS")

    if "documentNumber" in data and data["documentNumber"] != user.documentNumber:
        existing = db.query(User).filter(User.documentNumber == data["documentNumber"], User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=409, detail="DOCUMENT_EXISTS")

    for key, value in data.items():
        if key == "password" and value is not None:
            setattr(user, key, hash_password(value))
        else:
            setattr(user, key, value)

    db.commit()
    db.refresh(user)

    user_out = UserSafe.model_validate(user).model_dump()
    return success_response(data=user_out, message="Usuario actualizado")


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="SELF_DELETE")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(user)
    db.commit()
    return success_response(message="Usuario eliminado")


@router.get("/reservations")
def get_all_reservations(
    db: Session = Depends(get_db),
):
    results = (
        db.query(Reservation, Room, User, User)
        .join(Room, Reservation.habitacionId == Room.id, isouter=True)
        .join(User, Reservation.userId == User.id, isouter=True)
        .outerjoin(User, Room.hostId == User.id)
        .order_by(desc(Reservation.createdAt))
        .all()
    )

    reservaciones = []
    seen = set()
    for res, room, user, host in results:
        if res.id in seen:
            continue
        seen.add(res.id)
        r = ReservationOut(
            id=res.id,
            userId=res.userId,
            habitacionId=res.habitacionId,
            fechaIngreso=res.fechaIngreso,
            fechaSalida=res.fechaSalida,
            huespedes=res.huespedes,
            precioNoche=float(res.precioNoche),
            totalNoches=res.totalNoches,
            total=float(res.total),
            estado=res.estado.value if isinstance(res.estado, ReservationStatus) else res.estado,
            notas=res.notas,
            createdAt=res.createdAt,
            updatedAt=res.updatedAt,
            habitacionTitulo=room.titulo if room else None,
            habitacionImage=room.imageUrl if room else None,
            habitacionPrecio=float(room.precio) if room and room.precio else None,
            habitacionCapacidad=room.capacidad if room else None,
            habitacionUbicacion=room.ubicacion if room else None,
            hostId=room.hostId if room else None,
            userFirstName=user.firstName if user else None,
            userLastName=user.lastName if user else None,
            userEmail=user.email if user else None,
            userPhone=user.phone if user else None,
        )
        reservaciones.append(r.model_dump())

    return success_response(
        data={"reservaciones": reservaciones, "total": len(reservaciones)},
        message="Todas las reservaciones obtenidas",
    )


@router.patch("/reservations/{res_id}/status")
def admin_update_status(
    res_id: int,
    payload: dict,
    db: Session = Depends(get_db),
):
    res = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")

    nuevo_estado = payload.get("estado")
    if nuevo_estado not in ["pendiente", "confirmada", "cancelada", "completada"]:
        raise HTTPException(status_code=400, detail="Estado inválido")

    res.estado = ReservationStatus(nuevo_estado)
    db.commit()
    db.refresh(res)

    room = db.query(Room).filter(Room.id == res.habitacionId).first()
    user = db.query(User).filter(User.id == res.userId).first()

    r = ReservationOut(
        id=res.id,
        userId=res.userId,
        habitacionId=res.habitacionId,
        fechaIngreso=res.fechaIngreso,
        fechaSalida=res.fechaSalida,
        huespedes=res.huespedes,
        precioNoche=float(res.precioNoche),
        totalNoches=res.totalNoches,
        total=float(res.total),
        estado=res.estado.value if isinstance(res.estado, ReservationStatus) else res.estado,
        notas=res.notas,
        createdAt=res.createdAt,
        updatedAt=res.updatedAt,
        habitacionTitulo=room.titulo if room else None,
        habitacionImage=room.imageUrl if room else None,
        habitacionPrecio=float(room.precio) if room and room.precio else None,
        habitacionCapacidad=room.capacidad if room else None,
        habitacionUbicacion=room.ubicacion if room else None,
        hostId=room.hostId if room else None,
        userFirstName=user.firstName if user else None,
        userLastName=user.lastName if user else None,
        userEmail=user.email if user else None,
        userPhone=user.phone if user else None,
    )

    return success_response(data=r.model_dump(), message="Estado actualizado")
