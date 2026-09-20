import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user, require_host_or_admin
from app.models.user import User
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomUpdate, RoomOut

router = APIRouter(prefix="/rooms")


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


def dump_servicios(servs):
    if isinstance(servs, list):
        return json.dumps(servs, ensure_ascii=False)
    return servs


def room_to_out(room: Room, host: Optional[User] = None) -> RoomOut:
    if host is None and room.hostId:
        host = room.host
    return RoomOut(
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


@router.get("/")
def get_rooms(
    tipo: Optional[str] = Query(None),
    minPrecio: Optional[float] = Query(None),
    maxPrecio: Optional[float] = Query(None),
    ubicacion: Optional[str] = Query(None),
    disponibles: Optional[bool] = Query(None),
    hostId: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Room).outerjoin(User, Room.hostId == User.id)

    if tipo:
        query = query.filter(Room.tipo == tipo)
    if minPrecio is not None:
        query = query.filter(Room.precio >= minPrecio)
    if maxPrecio is not None:
        query = query.filter(Room.precio <= maxPrecio)
    if ubicacion:
        query = query.filter(Room.ubicacion.like(f"%{ubicacion}%"))
    if disponibles is not None:
        query = query.filter(Room.disponible == disponibles)
    if hostId is not None:
        query = query.filter(Room.hostId == hostId)

    rooms = query.order_by(Room.createdAt.desc()).all()

    habitaciones = []
    for room in rooms:
        habitaciones.append(room_to_out(room).model_dump())

    return success_response(
        data={"habitaciones": habitaciones, "total": len(habitaciones)},
        message="Habitaciones obtenidas",
    )


@router.get("/me")
def get_my_rooms(
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Room).outerjoin(User, Room.hostId == User.id)

    if current_user.role == "admin":
        host_id_q = Query(None)
    else:
        query = query.filter(Room.hostId == current_user.id)

    rooms = query.order_by(Room.createdAt.desc()).all()
    habitaciones = [room_to_out(r).model_dump() for r in rooms]

    return success_response(
        data={"habitaciones": habitaciones, "total": len(habitaciones)},
        message="Mis habitaciones obtenidas",
    )


@router.get("/{room_id}")
def get_room_detail(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    host = None
    if room.hostId:
        host = db.query(User).filter(User.id == room.hostId).first()

    return success_response(
        data=room_to_out(room, host).model_dump(),
        message="Habitación obtenida",
    )


@router.post("/")
def create_room(
    payload: RoomCreate,
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    host_id = current_user.id
    if current_user.role == "admin" and payload.hostId is not None:
        host = db.query(User).filter(User.id == payload.hostId).first()
        if host:
            host_id = payload.hostId

    room = Room(
        hostId=host_id,
        titulo=payload.titulo,
        descripcion=payload.descripcion,
        precio=payload.precio,
        ubicacion=payload.ubicacion,
        capacidad=payload.capacidad,
        tipo=payload.tipo,
        servicios=dump_servicios(payload.servicios),
        imageUrl=str(payload.imageUrl) if payload.imageUrl else "",
        disponible=payload.disponible,
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    host = db.query(User).filter(User.id == host_id).first()
    return success_response(
        data=room_to_out(room, host).model_dump(),
        message="Habitación creada",
        status_code=201,
    )


@router.put("/{room_id}")
def update_room(
    room_id: int,
    payload: RoomUpdate,
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    if current_user.role != "admin" and room.hostId != current_user.id:
        raise HTTPException(status_code=403, detail="NOT_OWNER")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key == "servicios":
            setattr(room, key, dump_servicios(value))
        elif key == "imageUrl" and value is not None:
            setattr(room, key, str(value))
        else:
            setattr(room, key, value)

    db.commit()
    db.refresh(room)

    host = db.query(User).filter(User.id == room.hostId).first() if room.hostId else None
    return success_response(
        data=room_to_out(room, host).model_dump(),
        message="Habitación actualizada",
    )


@router.delete("/{room_id}")
def delete_room(
    room_id: int,
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    if current_user.role != "admin" and room.hostId != current_user.id:
        raise HTTPException(status_code=403, detail="NOT_OWNER")

    db.delete(room)
    db.commit()
    return success_response(message="Habitación eliminada")
