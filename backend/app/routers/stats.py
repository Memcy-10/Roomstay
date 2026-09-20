from datetime import date, datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract, and_

from app.core.db import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user, require_admin, require_host_or_admin
from app.models.user import User
from app.models.room import Room
from app.models.reservation import Reservation, ReservationStatus
from app.models.sale import Sale, SaleDetail, SaleStatus
from app.models.invoice import Invoice, InvoiceStatus
from app.models.pqr import PQR, PQRStatus, PQRType
from app.schemas.stats import StatsOut, KPIData

router = APIRouter(prefix="/stats")


def month_start(d: date) -> date:
    return d.replace(day=1)


def _safe_float(v) -> float:
    try:
        return float(v) if v is not None else 0.0
    except (TypeError, ValueError):
        return 0.0


@router.get("/overview")
def get_overview_stats(
    fechaInicio: Optional[date] = Query(None),
    fechaFin: Optional[date] = Query(None),
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    today = date.today()
    if not fechaFin:
        fechaFin = today
    if not fechaInicio:
        fechaInicio = month_start(fechaFin)

    host_id_filter = None
    if current_user.role == "host":
        host_id_filter = current_user.id

    total_usuarios = db.query(func.count(User.id)).filter(User.estado == "activo").scalar() or 0
    total_habitaciones = db.query(func.count(Room.id)).scalar() or 0

    reservas_query = db.query(func.count(Reservation.id))
    ventas_query = db.query(func.count(Sale.id), func.coalesce(func.sum(Sale.total), 0))
    facturacion_query = db.query(func.coalesce(func.sum(Invoice.total), 0))

    if host_id_filter:
        reservas_query = reservas_query.join(Room, Reservation.habitacionId == Room.id).filter(Room.hostId == host_id_filter)
        ventas_query = ventas_query.filter(Sale.hostId == host_id_filter)
        facturacion_query = facturacion_query.join(Sale, Invoice.saleId == Sale.id).filter(Sale.hostId == host_id_filter)

    reservas_rango = reservas_query.filter(
        Reservation.createdAt >= datetime.combine(fechaInicio, datetime.min.time()),
        Reservation.createdAt <= datetime.combine(fechaFin, datetime.max.time())
    ).scalar() or 0

    total_reservaciones = db.query(func.count(Reservation.id)).scalar() or 0

    v_count, v_sum = ventas_query.filter(
        Sale.fechaVenta >= fechaInicio,
        Sale.fechaVenta <= fechaFin
    ).first() or (0, 0)

    total_ventas = db.query(func.count(Sale.id)).scalar() or 0
    total_facturacion = _safe_float(db.query(func.coalesce(func.sum(Invoice.total), 0)).scalar())

    pqr_base = db.query(PQR)
    total_pqr = pqr_base.count() or 0
    pqr_pendientes = pqr_base.filter(PQR.estado == PQRStatus.pendiente).count() or 0
    pqr_en_proceso = pqr_base.filter(PQR.estado == PQRStatus.en_proceso).count() or 0

    # Mes actual
    mes_inicio = month_start(today)
    mes_fin = today

    v_mes_query = db.query(func.coalesce(func.sum(Sale.total), 0))
    r_mes_query = db.query(func.count(Reservation.id))
    u_mes_query = db.query(func.count(User.id))

    if host_id_filter:
        v_mes_query = v_mes_query.filter(Sale.hostId == host_id_filter)
        r_mes_query = r_mes_query.join(Room, Reservation.habitacionId == Room.id).filter(Room.hostId == host_id_filter)

    ventas_mes = _safe_float(v_mes_query.filter(Sale.fechaVenta >= mes_inicio, Sale.fechaVenta <= mes_fin).scalar())
    reservas_mes = r_mes_query.filter(
        Reservation.createdAt >= datetime.combine(mes_inicio, datetime.min.time()),
        Reservation.createdAt <= datetime.combine(mes_fin, datetime.max.time())
    ).scalar() or 0
    usuarios_nuevos_mes = u_mes_query.filter(
        User.createdAt >= datetime.combine(mes_inicio, datetime.min.time()),
        User.createdAt <= datetime.combine(mes_fin, datetime.max.time())
    ).scalar() or 0

    kpis = KPIData(
        totalUsuarios=total_usuarios,
        totalHabitaciones=total_habitaciones,
        totalReservaciones=total_reservaciones,
        totalVentas=total_ventas,
        totalFacturacion=total_facturacion,
        totalPQR=total_pqr,
        pqrPendientes=pqr_pendientes,
        pqrEnProceso=pqr_en_proceso,
        ventasMes=ventas_mes,
        reservasMes=reservas_mes,
        usuariosNuevosMes=usuarios_nuevos_mes,
    )

    # Ventas por día
    diario = []
    ventas_diarias = db.query(
        Sale.fechaVenta, func.coalesce(func.sum(Sale.total), 0)
    ).filter(
        Sale.fechaVenta >= fechaInicio,
        Sale.fechaVenta <= fechaFin
    )
    if host_id_filter:
        ventas_diarias = ventas_diarias.filter(Sale.hostId == host_id_filter)
    ventas_diarias = ventas_diarias.group_by(Sale.fechaVenta).order_by(Sale.fechaVenta).all()

    sales_map = {str(d): _safe_float(v) for d, v in ventas_diarias}
    delta = (fechaFin - fechaInicio).days
    for i in range(min(delta + 1, 31)):
        d = fechaInicio + timedelta(days=i)
        diario.append({"label": d.strftime("%d/%m"), "value": sales_map.get(str(d), 0.0)})

    # Semanal (últimas 4 semanas)
    semanal = []
    for i in range(4):
        end = today - timedelta(days=i * 7)
        start = end - timedelta(days=6)
        q = db.query(func.coalesce(func.sum(Sale.total), 0)).filter(
            Sale.fechaVenta >= start, Sale.fechaVenta <= end
        )
        if host_id_filter:
            q = q.filter(Sale.hostId == host_id_filter)
        semanal.append({"label": f"S{4 - i}", "value": _safe_float(q.scalar())})
    semanal.reverse()

    # Mensual (últimos 6 meses)
    mensual = []
    for i in range(5, -1, -1):
        ref = today - timedelta(days=i * 30)
        m_start = month_start(ref)
        next_m = (m_start + timedelta(days=32)).replace(day=1)
        m_end = next_m - timedelta(days=1)
        q = db.query(func.coalesce(func.sum(Sale.total), 0)).filter(
            Sale.fechaVenta >= m_start, Sale.fechaVenta <= m_end
        )
        if host_id_filter:
            q = q.filter(Sale.hostId == host_id_filter)
        mensual.append({"label": m_start.strftime("%b"), "value": _safe_float(q.scalar())})

    ventas_periodo = {"diario": diario, "semanal": semanal, "mensual": mensual}

    # Reservas por estado
    estados_reserva = [e.value for e in ReservationStatus]
    reservas_estado_q = db.query(Reservation.estado, func.count(Reservation.id))
    if host_id_filter:
        reservas_estado_q = reservas_estado_q.join(Room, Reservation.habitacionId == Room.id).filter(Room.hostId == host_id_filter)
    reservas_estado_q = reservas_estado_q.group_by(Reservation.estado).all()
    re_map = {}
    for est, c in reservas_estado_q:
        key = est.value if hasattr(est, 'value') else est
        re_map[key] = c
    reservas_por_estado = [
        {"label": est, "value": re_map.get(est, 0)} for est in estados_reserva
    ]

    # PQR por tipo
    tipos_pqr = [t.value for t in PQRType]
    pqr_q = db.query(PQR.tipo, func.count(PQR.id)).group_by(PQR.tipo).all()
    pq_map = {}
    for t, c in pqr_q:
        key = t.value if hasattr(t, 'value') else t
        pq_map[key] = c
    pqr_por_tipo = [
        {"label": t, "value": pq_map.get(t, 0)} for t in tipos_pqr
    ]

    # Habitaciones top (más vendidas)
    top_q = db.query(
        Room.id, Room.titulo, func.coalesce(func.sum(SaleDetail.cantidad), 0).label("total")
    ).select_from(SaleDetail).join(Room, SaleDetail.habitacionId == Room.id, isouter=True)
    if host_id_filter:
        top_q = top_q.join(Sale, SaleDetail.saleId == Sale.id).filter(Sale.hostId == host_id_filter)
    habitaciones_top = [
        {"id": r_id, "label": titulo or f"#{r_id}", "value": int(total or 0)}
        for r_id, titulo, total in top_q.group_by(Room.id, Room.titulo).order_by(desc("total")).limit(5).all()
    ]

    # Métodos de pago
    metodos_q = db.query(Sale.metodoPago, func.coalesce(func.sum(Sale.total), 0))
    if host_id_filter:
        metodos_q = metodos_q.filter(Sale.hostId == host_id_filter)
    metodos_q = metodos_q.group_by(Sale.metodoPago).all()
    ventas_metodo_pago = [
        {"label": mp, "value": _safe_float(total)} for mp, total in metodos_q
    ]

    stats = StatsOut(
        kpis=kpis,
        ventasPorPeriodo=ventas_periodo,
        reservasPorEstado=reservas_por_estado,
        pqrPorTipo=pqr_por_tipo,
        habitacionesTop=habitaciones_top,
        ventasMetodoPago=ventas_metodo_pago,
    )

    return success_response(data=stats.model_dump(), message="Estadísticas obtenidas")


@router.get("/kpi-cards")
def kpi_cards(
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    host_id = current_user.id if current_user.role == "host" else None

    usuarios = db.query(func.count(User.id)).filter(User.estado == "activo").scalar() or 0
    habitaciones = db.query(func.count(Room.id)).scalar() or 0

    res_q = db.query(func.count(Reservation.id))
    if host_id:
        res_q = res_q.join(Room, Reservation.habitacionId == Room.id).filter(Room.hostId == host_id)
    reservaciones = res_q.scalar() or 0

    v_q = db.query(func.count(Sale.id), func.coalesce(func.sum(Sale.total), 0))
    if host_id:
        v_q = v_q.filter(Sale.hostId == host_id)
    total_ventas_count, total_facturacion = v_q.first() or (0, 0)
    total_ventas_count = total_ventas_count or 0
    total_facturacion = _safe_float(total_facturacion)

    total_pqr = db.query(func.count(PQR.id)).scalar() or 0
    pqr_pendientes = db.query(func.count(PQR.id)).filter(PQR.estado == PQRStatus.pendiente).scalar() or 0

    data = {
        "usuarios": usuarios,
        "habitaciones": habitaciones,
        "reservaciones": reservaciones,
        "ventas": total_ventas_count,
        "facturacion": total_facturacion,
        "pqrs": total_pqr,
        "pqrPendientes": pqr_pendientes,
    }

    return success_response(data=data, message="KPIs obtenidos")
