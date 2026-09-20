import json
from datetime import datetime, date, timedelta
from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user, require_host_or_admin
from app.models.user import User
from app.models.room import Room
from app.models.reservation import Reservation, ReservationStatus
from app.schemas.reservation import (
    ReservationCreate,
    ReservationStatusUpdate,
    ReservationOut,
    AvailabilityResponse,
)

router = APIRouter(prefix="/reservations")


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


def calc_noches(fechaIngreso: date, fechaSalida: date) -> int:
    diff = (fechaSalida - fechaIngreso).days
    return max(1, ceil(diff)) if diff > 0 else 1


def check_conflicto(
    db: Session,
    habitacionId: int,
    ingreso: date,
    salida: date,
    exclude_id: Optional[int] = None,
) -> bool:
    query = db.query(Reservation).filter(
        Reservation.habitacionId == habitacionId,
        Reservation.estado.in_([ReservationStatus.pendiente, ReservationStatus.confirmada]),
        Reservation.fechaIngreso < salida,
        Reservation.fechaSalida > ingreso,
    )
    if exclude_id:
        query = query.filter(Reservation.id != exclude_id)
    return query.first() is not None


def reservation_to_out(res: Reservation, room: Optional[Room] = None, user: Optional[User] = None, host: Optional[User] = None) -> ReservationOut:
    if room is None:
        room = res.room
    if user is None:
        user = res.user
    if host is None and room and room.hostId:
        host = db.query(User).filter(User.id == room.hostId).first() if 'db' in globals() else None

    return ReservationOut(
        id=res.id,
        userId=res.userId,
        habitacionId=res.habitacionId,
        fechaIngreso=res.fechaIngreso,
        fechaSalida=res.fechaSalida,
        huespedes=res.huespedes,
        precioNoche=float(res.precioNoche) if res.precioNoche else 0,
        totalNoches=res.totalNoches,
        total=float(res.total) if res.total else 0,
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


@router.get("/availability")
def check_availability(
    habitacionId: int = Query(...),
    fechaIngreso: date = Query(...),
    fechaSalida: date = Query(...),
    db: Session = Depends(get_db),
):
    room = db.query(Room).filter(Room.id == habitacionId).first()
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    if fechaSalida <= fechaIngreso:
        return success_response(
            data=AvailabilityResponse(disponible=False, motivo="Fecha de salida debe ser posterior a la de ingreso").model_dump(),
            message="Fechas inválidas",
        )

    if not room.disponible:
        return success_response(
            data=AvailabilityResponse(disponible=False, motivo="Habitación no disponible").model_dump(),
            message="No disponible",
        )

    if check_conflicto(db, habitacionId, fechaIngreso, fechaSalida):
        return success_response(
            data=AvailabilityResponse(disponible=False, motivo="Fechas ocupadas").model_dump(),
            message="Conflicto de fechas",
        )

    noches = calc_noches(fechaIngreso, fechaSalida)
    return success_response(
        data=AvailabilityResponse(disponible=True, noches=noches).model_dump(),
        message="Disponible",
    )


@router.get("/me")
def get_my_reservations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = (
        db.query(Reservation, Room)
        .join(Room, Reservation.habitacionId == Room.id)
        .filter(Reservation.userId == current_user.id)
        .order_by(Reservation.createdAt.desc())
        .all()
    )

    reservaciones = []
    seen = set()
    for res, room in results:
        if res.id in seen:
            continue
        seen.add(res.id)
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
            habitacionTitulo=room.titulo,
            habitacionImage=room.imageUrl,
            habitacionPrecio=float(room.precio),
            habitacionCapacidad=room.capacidad,
            habitacionUbicacion=room.ubicacion,
            hostId=room.hostId,
            userFirstName=user.firstName,
            userLastName=user.lastName,
            userEmail=user.email,
            userPhone=user.phone,
        )
        reservaciones.append(r.model_dump())

    return success_response(
        data={"reservaciones": reservaciones, "total": len(reservaciones)},
        message="Mis reservaciones obtenidas",
    )


@router.get("/host")
def get_host_reservations(
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Reservation, Room)
        .join(Room, Reservation.habitacionId == Room.id)
    )
    if current_user.role != "admin":
        query = query.filter(Room.hostId == current_user.id)

    results = query.order_by(Reservation.createdAt.desc()).all()

    reservaciones = []
    seen = set()
    for res, room in results:
        if res.id in seen:
            continue
        seen.add(res.id)
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
            habitacionTitulo=room.titulo,
            habitacionImage=room.imageUrl,
            habitacionPrecio=float(room.precio),
            habitacionCapacidad=room.capacidad,
            habitacionUbicacion=room.ubicacion,
            hostId=room.hostId,
            userFirstName=user.firstName,
            userLastName=user.lastName,
            userEmail=user.email,
            userPhone=user.phone,
        )
        reservaciones.append(r.model_dump())

    return success_response(
        data={"reservaciones": reservaciones, "total": len(reservaciones)},
        message="Reservaciones de host obtenidas",
    )


@router.get("/{res_id}")
def get_reservation_detail(
    res_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    res = (
        db.query(Reservation)
        .join(Room, Reservation.habitacionId == Room.id)
        .filter(Reservation.id == res_id)
        .first()
    )
    if not res:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")

    room = db.query(Room).filter(Room.id == res.habitacionId).first()
    user = db.query(User).filter(User.id == res.userId).first()
    host = db.query(User).filter(User.id == room.hostId).first() if room and room.hostId else None

    if (
        current_user.role != "admin"
        and res.userId != current_user.id
        and (room is None or room.hostId != current_user.id)
    ):
        raise HTTPException(status_code=403, detail="No autorizado")

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

    return success_response(data=r.model_dump(), message="Reservación obtenida")


@router.post("/")
def create_reservation(
    payload: ReservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    room = db.query(Room).filter(Room.id == payload.habitacionId).first()
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    if not room.disponible:
        raise HTTPException(status_code=400, detail="Habitación no disponible")

    today = date.today()
    if payload.fechaIngreso < today:
        raise HTTPException(status_code=400, detail="Fecha de ingreso no puede ser en el pasado")

    if payload.fechaSalida <= payload.fechaIngreso:
        raise HTTPException(status_code=400, detail="Fechas inválidas")

    if payload.huespedes > room.capacidad:
        raise HTTPException(status_code=400, detail="Cantidad de huéspedes supera la capacidad")

    if check_conflicto(db, payload.habitacionId, payload.fechaIngreso, payload.fechaSalida):
        raise HTTPException(status_code=409, detail="Conflicto de fechas")

    if room.hostId == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes reservar tu propia habitación")

    noches = calc_noches(payload.fechaIngreso, payload.fechaSalida)
    precio_noche = float(room.precio)
    total = precio_noche * noches

    reservation = Reservation(
        userId=current_user.id,
        habitacionId=payload.habitacionId,
        fechaIngreso=payload.fechaIngreso,
        fechaSalida=payload.fechaSalida,
        huespedes=payload.huespedes,
        precioNoche=precio_noche,
        totalNoches=noches,
        total=total,
        estado=ReservationStatus.confirmada,
        notas=payload.notas,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    user = db.query(User).filter(User.id == reservation.userId).first()
    host = db.query(User).filter(User.id == room.hostId).first() if room.hostId else None

    r = ReservationOut(
        id=reservation.id,
        userId=reservation.userId,
        habitacionId=reservation.habitacionId,
        fechaIngreso=reservation.fechaIngreso,
        fechaSalida=reservation.fechaSalida,
        huespedes=reservation.huespedes,
        precioNoche=float(reservation.precioNoche),
        totalNoches=reservation.totalNoches,
        total=float(reservation.total),
        estado=reservation.estado.value if isinstance(reservation.estado, ReservationStatus) else reservation.estado,
        notas=reservation.notas,
        createdAt=reservation.createdAt,
        updatedAt=reservation.updatedAt,
        habitacionTitulo=room.titulo,
        habitacionImage=room.imageUrl,
        habitacionPrecio=float(room.precio),
        habitacionCapacidad=room.capacidad,
        habitacionUbicacion=room.ubicacion,
        hostId=room.hostId,
        userFirstName=user.firstName if user else None,
        userLastName=user.lastName if user else None,
        userEmail=user.email if user else None,
        userPhone=user.phone if user else None,
    )

    return success_response(data=r.model_dump(), message="Reservación creada", status_code=201)


@router.patch("/{res_id}/status")
def update_reservation_status(
    res_id: int,
    payload: ReservationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    res = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")

    room = db.query(Room).filter(Room.id == res.habitacionId).first()

    is_owner = res.userId == current_user.id
    is_host = room is not None and room.hostId == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_admin or is_owner or is_host):
        raise HTTPException(status_code=403, detail="No autorizado")

    if payload.estado == "completada" and not (is_host or is_admin):
        raise HTTPException(status_code=403, detail="Solo host o admin pueden marcar como completada")

    res.estado = ReservationStatus(payload.estado)
    db.commit()
    db.refresh(res)

    user = db.query(User).filter(User.id == res.userId).first()
    host = db.query(User).filter(User.id == room.hostId).first() if room and room.hostId else None

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


@router.delete("/{res_id}")
def cancel_reservation(
    res_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    res = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")

    room = db.query(Room).filter(Room.id == res.habitacionId).first()

    is_owner = res.userId == current_user.id
    is_host = room is not None and room.hostId == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_admin or is_owner or is_host):
        raise HTTPException(status_code=403, detail="No autorizado")

    res.estado = ReservationStatus.cancelada
    db.commit()

    return success_response(message="Reservación cancelada")
