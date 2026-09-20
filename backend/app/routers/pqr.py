from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.core.db import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.models.reservation import Reservation
from app.models.pqr import PQR, PQRType, PQRStatus
from app.schemas.pqr import PQRCreate, PQRStatusUpdate, PQRAnswer, PQROut

router = APIRouter(prefix="/pqr")


def generate_radicado(db: Session) -> str:
    today = datetime.now()
    prefix = f"PQR{today.strftime('%Y%m%d')}"
    last = db.query(PQR).filter(PQR.numeroRadicado.like(f"{prefix}%")).order_by(desc(PQR.id)).first()
    seq = 1
    if last and last.numeroRadicado:
        try:
            seq = int(last.numeroRadicado[-4:]) + 1
        except (ValueError, TypeError):
            seq = 1
    return f"{prefix}{seq:04d}"


def pqr_to_out(pqr: PQR, user: Optional[User] = None, admin: Optional[User] = None,
               reservation: Optional[Reservation] = None) -> PQROut:
    res_info = None
    if reservation:
        res_info = f"{reservation.fechaIngreso} - {reservation.fechaSalida}"

    return PQROut(
        id=pqr.id, numeroRadicado=pqr.numeroRadicado, userId=pqr.userId,
        tipo=pqr.tipo.value if isinstance(pqr.tipo, PQRType) else pqr.tipo,
        titulo=pqr.titulo, descripcion=pqr.descripcion,
        estado=pqr.estado.value if isinstance(pqr.estado, PQRStatus) else pqr.estado,
        prioridad=pqr.prioridad, reservationId=pqr.reservationId,
        respuesta=pqr.respuesta, answeredBy=pqr.answeredBy,
        fechaRespuesta=pqr.fechaRespuesta, createdAt=pqr.createdAt, updatedAt=pqr.updatedAt,
        userFirstName=user.firstName if user else None,
        userLastName=user.lastName if user else None,
        userEmail=user.email if user else None,
        answeredByName=f"{admin.firstName} {admin.lastName}" if admin else None,
        reservationInfo=res_info
    )


@router.get("")
def list_pqr(
    tipo: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    prioridad: Optional[str] = Query(None),
    userId: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(PQR)

    if current_user.role == "user":
        query = query.filter(PQR.userId == current_user.id)
    elif current_user.role == "host":
        query = query.join(Reservation, PQR.reservationId == Reservation.id, isouter=True).join(
            User, Reservation.habitacionId != None, isouter=True
        ).filter(or_(PQR.userId == current_user.id, False))

    if tipo:
        query = query.filter(PQR.tipo == tipo)
    if estado:
        query = query.filter(PQR.estado == estado)
    if prioridad:
        query = query.filter(PQR.prioridad == prioridad)
    if userId and current_user.role == "admin":
        query = query.filter(PQR.userId == userId)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(
            PQR.titulo.like(like), PQR.descripcion.like(like),
            PQR.numeroRadicado.like(like), PQR.respuesta.like(like)
        ))

    pqrs = query.order_by(desc(PQR.createdAt)).all()

    user_ids = {p.userId for p in pqrs if p.userId}
    admin_ids = {p.answeredBy for p in pqrs if p.answeredBy}
    res_ids = {p.reservationId for p in pqrs if p.reservationId}

    users_map = {u.id: u for u in db.query(User).filter(User.id.in_(list(user_ids | admin_ids))).all()}
    res_map = {r.id: r for r in db.query(Reservation).filter(Reservation.id.in_(list(res_ids))).all()} if res_ids else {}

    result = [
        pqr_to_out(
            p, user=users_map.get(p.userId),
            admin=users_map.get(p.answeredBy) if p.answeredBy else None,
            reservation=res_map.get(p.reservationId) if p.reservationId else None
        ).model_dump()
        for p in pqrs
    ]

    return success_response(
        data={"pqrs": result, "total": len(result)},
        message="Listado PQR"
    )


@router.get("/me")
def my_pqr(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pqrs = db.query(PQR).filter(PQR.userId == current_user.id).order_by(desc(PQR.createdAt)).all()
    res_ids = {p.reservationId for p in pqrs if p.reservationId}
    res_map = {r.id: r for r in db.query(Reservation).filter(Reservation.id.in_(list(res_ids))).all()} if res_ids else {}
    admin_ids = {p.answeredBy for p in pqrs if p.answeredBy}
    admins_map = {u.id: u for u in db.query(User).filter(User.id.in_(list(admin_ids))).all()} if admin_ids else {}

    result = [
        pqr_to_out(p, user=current_user, admin=admins_map.get(p.answeredBy) if p.answeredBy else None,
                   reservation=res_map.get(p.reservationId) if p.reservationId else None).model_dump()
        for p in pqrs
    ]
    return success_response(data={"pqrs": result, "total": len(result)}, message="Mis PQR")


@router.get("/{pqr_id}")
def get_pqr(
    pqr_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrado")

    is_admin = current_user.role == "admin"
    is_owner = pqr.userId == current_user.id
    if not (is_admin or is_owner):
        raise HTTPException(status_code=403, detail="No autorizado")

    user = db.query(User).filter(User.id == pqr.userId).first()
    admin = db.query(User).filter(User.id == pqr.answeredBy).first() if pqr.answeredBy else None
    reservation = db.query(Reservation).filter(Reservation.id == pqr.reservationId).first() if pqr.reservationId else None

    return success_response(
        data=pqr_to_out(pqr, user=user, admin=admin, reservation=reservation).model_dump(),
        message="PQR obtenido"
    )


@router.post("")
def create_pqr(
    payload: PQRCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tipos_validos = [t.value for t in PQRType]
    if payload.tipo not in tipos_validos:
        raise HTTPException(status_code=400, detail=f"Tipo inválido. Opciones: {tipos_validos}")

    if payload.reservationId:
        res = db.query(Reservation).filter(Reservation.id == payload.reservationId).first()
        if not res:
            raise HTTPException(status_code=404, detail="Reservación no encontrada")
        if res.userId != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Reservación no pertenece al usuario")

    num_radicado = generate_radicado(db)

    pqr = PQR(
        numeroRadicado=num_radicado, userId=current_user.id, tipo=PQRType(payload.tipo),
        titulo=payload.titulo, descripcion=payload.descripcion, estado=PQRStatus.pendiente,
        prioridad=payload.prioridad, reservationId=payload.reservationId
    )
    db.add(pqr)
    db.commit()
    db.refresh(pqr)

    reservation = db.query(Reservation).filter(Reservation.id == pqr.reservationId).first() if pqr.reservationId else None
    return success_response(
        data=pqr_to_out(pqr, user=current_user, reservation=reservation).model_dump(),
        message="PQR creado exitosamente. Número de radicado: " + num_radicado,
        status_code=201
    )


@router.patch("/{pqr_id}/status")
def update_pqr_status(
    pqr_id: int,
    payload: PQRStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrado")

    estados_validos = [e.value for e in PQRStatus]
    if payload.estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Opciones: {estados_validos}")

    pqr.estado = PQRStatus(payload.estado)
    db.commit()
    db.refresh(pqr)

    user = db.query(User).filter(User.id == pqr.userId).first()
    admin = db.query(User).filter(User.id == pqr.answeredBy).first() if pqr.answeredBy else None
    reservation = db.query(Reservation).filter(Reservation.id == pqr.reservationId).first() if pqr.reservationId else None

    return success_response(
        data=pqr_to_out(pqr, user=user, admin=admin, reservation=reservation).model_dump(),
        message="Estado PQR actualizado"
    )


@router.post("/{pqr_id}/answer")
def answer_pqr(
    pqr_id: int,
    payload: PQRAnswer,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    pqr = db.query(PQR).filter(PQR.id == pqr_id).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrado")

    pqr.respuesta = payload.respuesta
    pqr.answeredBy = current_user.id
    pqr.fechaRespuesta = datetime.now()
    pqr.estado = PQRStatus.respondida

    db.commit()
    db.refresh(pqr)

    user = db.query(User).filter(User.id == pqr.userId).first()
    reservation = db.query(Reservation).filter(Reservation.id == pqr.reservationId).first() if pqr.reservationId else None

    return success_response(
        data=pqr_to_out(pqr, user=user, admin=current_user, reservation=reservation).model_dump(),
        message="Respuesta enviada"
    )
