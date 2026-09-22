from datetime import datetime, date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_

from app.core.db import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user, require_admin, require_host_or_admin
from app.models.user import User
from app.models.room import Room
from app.models.reservation import Reservation, ReservationStatus
from app.models.sale import Sale, SaleDetail, SaleStatus
from app.models.invoice import Invoice, InvoiceDetail, InvoiceStatus
from app.schemas.sale import SaleCreate, SaleStatusUpdate, SaleOut, SaleDetailOut

router = APIRouter(prefix="/sales")


def generate_sale_number(db: Session) -> str:
    today = date.today()
    prefix = f"VTA{today.strftime('%Y%m%d')}"
    last = db.query(Sale).filter(Sale.numeroVenta.like(f"{prefix}%")).order_by(desc(Sale.id)).first()
    seq = 1
    if last and last.numeroVenta:
        try:
            seq = int(last.numeroVenta[-4:]) + 1
        except (ValueError, TypeError):
            seq = 1
    return f"{prefix}{seq:04d}"


def sale_to_out(sale: Sale, user: Optional[User] = None, host: Optional[User] = None,
                room_map: Optional[dict] = None, include_details: bool = True,
                db: Optional[Session] = None) -> SaleOut:
    if user is None and db is not None:
        user = db.query(User).filter(User.id == sale.userId).first()
    if host is None and sale.hostId and db is not None:
        host = db.query(User).filter(User.id == sale.hostId).first()

    details_out = None
    if include_details and sale.details:
        details_out = []
        for d in sale.details:
            room_title = None
            if room_map and d.habitacionId and d.habitacionId in room_map:
                room_title = room_map[d.habitacionId]
            details_out.append(SaleDetailOut(
                id=d.id, saleId=d.saleId, habitacionId=d.habitacionId,
                descripcion=d.descripcion, tipo=d.tipo, cantidad=d.cantidad,
                precioUnitario=float(d.precioUnitario), descuento=float(d.descuento),
                impuesto=float(d.impuesto), subtotal=float(d.subtotal),
                total=float(d.total), habitacionTitulo=room_title
            ))

    reservation_info = None
    if sale.reservationId and sale.reservation:
        reservation_info = f"{sale.reservation.fechaIngreso} - {sale.reservation.fechaSalida}"

    return SaleOut(
        id=sale.id, numeroVenta=sale.numeroVenta, userId=sale.userId,
        reservationId=sale.reservationId, hostId=sale.hostId, fechaVenta=sale.fechaVenta,
        subTotal=float(sale.subTotal), descuento=float(sale.descuento),
        impuestos=float(sale.impuestos), total=float(sale.total),
        metodoPago=sale.metodoPago, estado=sale.estado.value if isinstance(sale.estado, SaleStatus) else sale.estado,
        observaciones=sale.observaciones, createdAt=sale.createdAt, updatedAt=sale.updatedAt,
        userFirstName=user.firstName if user else None,
        userLastName=user.lastName if user else None,
        userEmail=user.email if user else None,
        userDocument=getattr(user, 'documentNumber', None),
        userPhone=user.phone if user else None,
        hostFirstName=host.firstName if host else None,
        hostLastName=host.lastName if host else None,
        reservationInfo=reservation_info,
        details=details_out
    )


@router.get("")
def list_sales(
    fechaInicio: Optional[date] = Query(None),
    fechaFin: Optional[date] = Query(None),
    clienteId: Optional[int] = Query(None),
    hostId: Optional[int] = Query(None),
    habitacionId: Optional[int] = Query(None),
    estado: Optional[str] = Query(None),
    minTotal: Optional[float] = Query(None),
    maxTotal: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Sale).join(SaleDetail, isouter=True)

    if current_user.role == "host":
        query = query.filter(Sale.hostId == current_user.id)
    elif hostId:
        query = query.filter(Sale.hostId == hostId)

    if fechaInicio:
        query = query.filter(Sale.fechaVenta >= fechaInicio)
    if fechaFin:
        query = query.filter(Sale.fechaVenta <= fechaFin)
    if clienteId:
        query = query.filter(Sale.userId == clienteId)
    if habitacionId:
        query = query.filter(SaleDetail.habitacionId == habitacionId)
    if estado:
        query = query.filter(Sale.estado == estado)
    if minTotal:
        query = query.filter(Sale.total >= minTotal)
    if maxTotal:
        query = query.filter(Sale.total <= maxTotal)
    if search:
        like = f"%{search}%"
        user_ids = [u.id for u in db.query(User.id).filter(or_(
            User.firstName.like(like), User.lastName.like(like),
            User.email.like(like), User.documentNumber.like(like)
        )).all()]
        query = query.filter(or_(
            Sale.numeroVenta.like(like),
            Sale.userId.in_(user_ids) if user_ids else False
        ))

    sales = query.order_by(desc(Sale.createdAt)).distinct().all()

    user_ids = {s.userId for s in sales if s.userId}
    host_ids = {s.hostId for s in sales if s.hostId}
    room_ids = set()
    for s in sales:
        for d in s.details or []:
            if d.habitacionId:
                room_ids.add(d.habitacionId)

    users_map = {u.id: u for u in db.query(User).filter(User.id.in_(list(user_ids | host_ids))).all()}
    room_map = {r.id: r.titulo for r in db.query(Room.id, Room.titulo).filter(Room.id.in_(list(room_ids))).all()}

    result = []
    seen = set()
    for s in sales:
        if s.id in seen:
            continue
        seen.add(s.id)
        u = users_map.get(s.userId)
        h = users_map.get(s.hostId)
        result.append(sale_to_out(s, user=u, host=h, room_map=room_map, db=db).model_dump())

    return success_response(
        data={"ventas": result, "total": len(result)},
        message="Listado de ventas"
    )


@router.get("/me")
def my_sales(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sales = db.query(Sale).filter(Sale.userId == current_user.id).order_by(desc(Sale.createdAt)).all()

    result = []
    room_ids = set()
    for s in sales:
        for d in s.details or []:
            if d.habitacionId:
                room_ids.add(d.habitacionId)
    room_map = {r.id: r.titulo for r in db.query(Room.id, Room.titulo).filter(Room.id.in_(list(room_ids))).all()}

    for s in sales:
        result.append(sale_to_out(s, user=current_user, room_map=room_map).model_dump())
    return success_response(data={"ventas": result, "total": len(result)}, message="Mis ventas")


@router.get("/{sale_id}")
def get_sale(
    sale_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    is_admin = current_user.role == "admin"
    is_owner = sale.userId == current_user.id
    is_host = sale.hostId == current_user.id

    if not (is_admin or is_owner or is_host):
        raise HTTPException(status_code=403, detail="No autorizado")

    user = db.query(User).filter(User.id == sale.userId).first()
    host = db.query(User).filter(User.id == sale.hostId).first() if sale.hostId else None

    room_ids = [d.habitacionId for d in sale.details or [] if d.habitacionId]
    room_map = {r.id: r.titulo for r in db.query(Room.id, Room.titulo).filter(Room.id.in_(room_ids)).all()} if room_ids else {}

    return success_response(
        data=sale_to_out(sale, user=user, host=host, room_map=room_map).model_dump(),
        message="Venta obtenida"
    )


@router.post("")
def create_sale(
    payload: SaleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reserva = None
    if payload.reservationId:
        reserva = db.query(Reservation).filter(Reservation.id == payload.reservationId).first()
        if not reserva:
            raise HTTPException(status_code=404, detail="Reservación no encontrada")
        if reserva.userId != current_user.id and current_user.role not in ["admin", "host"]:
            raise HTTPException(status_code=403, detail="No autorizado para esta reservación")

    room = None
    if reserva:
        room = db.query(Room).filter(Room.id == reserva.habitacionId).first()

    if not payload.details:
        raise HTTPException(status_code=400, detail="Se requiere al menos un detalle")

    sub_total_calc = 0
    for d in payload.details:
        st = (d.cantidad * d.precioUnitario) - d.descuento + d.impuesto
        sub_total_calc += st

    subTotal = payload.subTotal if payload.subTotal is not None else sub_total_calc
    descuento = payload.descuento
    impuestos = payload.impuestos
    total = payload.total if payload.total is not None else (subTotal - descuento + impuestos)

    num_venta = generate_sale_number(db)

    sale = Sale(
        numeroVenta=num_venta,
        userId=reserva.userId if reserva else current_user.id,
        reservationId=payload.reservationId,
        hostId=room.hostId if room else payload.hostId,
        fechaVenta=payload.fechaVenta or date.today(),
        subTotal=subTotal,
        descuento=descuento,
        impuestos=impuestos,
        total=total,
        metodoPago=payload.metodoPago,
        estado=SaleStatus(payload.estado) if payload.estado in [e.value for e in SaleStatus] else SaleStatus.completada,
        observaciones=payload.observaciones,
        createdBy=current_user.id
    )
    db.add(sale)
    db.flush()

    for d in payload.details:
        subtotal_linea = d.cantidad * d.precioUnitario
        total_linea = subtotal_linea - d.descuento + d.impuesto
        detail = SaleDetail(
            saleId=sale.id, habitacionId=d.habitacionId, descripcion=d.descripcion,
            tipo=d.tipo, cantidad=d.cantidad, precioUnitario=d.precioUnitario,
            descuento=d.descuento, impuesto=d.impuesto,
            subtotal=subtotal_linea, total=total_linea
        )
        db.add(detail)

    db.commit()
    db.refresh(sale)

    user = db.query(User).filter(User.id == sale.userId).first()
    host = db.query(User).filter(User.id == sale.hostId).first() if sale.hostId else None
    room_ids = [d.habitacionId for d in sale.details or [] if d.habitacionId]
    room_map = {r.id: r.titulo for r in db.query(Room.id, Room.titulo).filter(Room.id.in_(room_ids)).all()} if room_ids else {}

    return success_response(
        data=sale_to_out(sale, user=user, host=host, room_map=room_map).model_dump(),
        message="Venta creada", status_code=201
    )


@router.post("/pay-reservation/{reservation_id}")
@router.post("/from-reservation/{reservation_id}")
def pay_reservation(
    reservation_id: int,
    metodoPago: str = Query("tarjeta"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.routers.invoices import generate_invoice_number, invoice_to_out

    reserva = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")

    room = db.query(Room).filter(Room.id == reserva.habitacionId).first()

    is_owner = reserva.userId == current_user.id
    is_host = room is not None and room.hostId == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_owner or is_host or is_admin):
        raise HTTPException(status_code=403, detail="No autorizado para procesar el pago de esta reservación")

    existing_sale = db.query(Sale).filter(Sale.reservationId == reservation_id, Sale.estado != SaleStatus.cancelada).first()

    if existing_sale:
        sale = existing_sale
    else:
        num_venta = generate_sale_number(db)
        total_sale = float(reserva.total)

        sale = Sale(
            numeroVenta=num_venta, userId=reserva.userId, reservationId=reserva.id,
            hostId=room.hostId if room else None, fechaVenta=date.today(),
            subTotal=total_sale, descuento=0, impuestos=0, total=total_sale,
            metodoPago=metodoPago, estado=SaleStatus.completada,
            observaciones=f"Pago realizado mediante {metodoPago} para reservación #{reserva.id}",
            createdBy=current_user.id
        )
        db.add(sale)
        db.flush()

        desc = f"Estadía en {room.titulo}" if room else "Servicio de hospedaje"
        detail = SaleDetail(
            saleId=sale.id, habitacionId=reserva.habitacionId, descripcion=desc,
            tipo="habitacion", cantidad=reserva.totalNoches,
            precioUnitario=float(reserva.precioNoche), descuento=0, impuesto=0,
            subtotal=float(reserva.total), total=float(reserva.total)
        )
        db.add(detail)

    reserva.estado = ReservationStatus.pagada
    db.flush()

    existing_invoice = db.query(Invoice).filter(Invoice.saleId == sale.id, Invoice.estado != InvoiceStatus.anulada).first()
    if not existing_invoice:
        num_factura = generate_invoice_number(db)
        invoice = Invoice(
            numeroFactura=num_factura,
            saleId=sale.id,
            userId=reserva.userId,
            fechaEmision=date.today(),
            fechaVencimiento=date.today() + timedelta(days=30),
            subTotal=sale.subTotal,
            descuento=sale.descuento,
            impuestos=sale.impuestos,
            total=sale.total,
            estado=InvoiceStatus.pagada,
            notas=f"Factura generada por pago de reservación #{reserva.id}",
        )
        db.add(invoice)
        db.flush()

        if sale.details:
            for d in sale.details:
                inv_detail = InvoiceDetail(
                    invoiceId=invoice.id, descripcion=d.descripcion,
                    cantidad=d.cantidad, precioUnitario=d.precioUnitario,
                    descuento=d.descuento, impuesto=d.impuesto,
                    subtotal=d.subtotal, total=d.total
                )
                db.add(inv_detail)
    else:
        invoice = existing_invoice

    db.commit()
    db.refresh(sale)
    db.refresh(invoice)

    user = db.query(User).filter(User.id == sale.userId).first()
    host = db.query(User).filter(User.id == sale.hostId).first() if sale.hostId else None
    room_map = {room.id: room.titulo} if room else {}

    sale_data = sale_to_out(sale, user=user, host=host, room_map=room_map).model_dump()
    invoice_data = invoice_to_out(invoice, user=user, sale=sale).model_dump()

    return success_response(
        data={"venta": sale_data, "factura": invoice_data, "sale": sale_data, "invoice": invoice_data},
        message="Pago procesado exitosamente y factura generada.",
        status_code=200
    )


@router.patch("/{sale_id}/status")
def update_sale_status(
    sale_id: int,
    payload: SaleStatusUpdate,
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    estados_validos = [e.value for e in SaleStatus]
    if payload.estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Opciones: {estados_validos}")

    sale.estado = SaleStatus(payload.estado)
    db.commit()
    db.refresh(sale)

    user = db.query(User).filter(User.id == sale.userId).first()
    host = db.query(User).filter(User.id == sale.hostId).first() if sale.hostId else None
    room_ids = [d.habitacionId for d in sale.details or [] if d.habitacionId]
    room_map = {r.id: r.titulo for r in db.query(Room.id, Room.titulo).filter(Room.id.in_(room_ids)).all()} if room_ids else {}

    return success_response(
        data=sale_to_out(sale, user=user, host=host, room_map=room_map).model_dump(),
        message="Estado de venta actualizado"
    )
