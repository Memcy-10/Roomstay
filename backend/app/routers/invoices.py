from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.core.db import get_db
from app.core.responses import success_response
from app.dependencies.auth import get_current_user, require_host_or_admin
from app.models.user import User
from app.models.sale import Sale, SaleDetail, SaleStatus
from app.models.invoice import Invoice, InvoiceDetail, InvoiceStatus
from app.schemas.invoice import InvoiceCreate, InvoiceStatusUpdate, InvoiceOut, InvoiceDetailOut

router = APIRouter(prefix="/invoices")


def generate_invoice_number(db: Session) -> str:
    today = date.today()
    prefix = f"FSE{today.strftime('%Y%m')}"
    last = db.query(Invoice).filter(Invoice.numeroFactura.like(f"{prefix}%")).order_by(desc(Invoice.id)).first()
    seq = 1
    if last and last.numeroFactura:
        try:
            seq = int(last.numeroFactura[-6:]) + 1
        except (ValueError, TypeError):
            seq = 1
    return f"{prefix}{seq:06d}"


def invoice_to_out(invoice: Invoice, user: Optional[User] = None, sale: Optional[Sale] = None) -> InvoiceOut:
    if user is None:
        user = db.query(User).filter(User.id == invoice.userId).first() if 'db' in globals() else None
    if sale is None:
        sale = db.query(Sale).filter(Sale.id == invoice.saleId).first() if 'db' in globals() else None

    details_out = None
    if invoice.details:
        details_out = [
            InvoiceDetailOut(
                id=d.id, invoiceId=d.invoiceId, descripcion=d.descripcion,
                cantidad=d.cantidad, precioUnitario=float(d.precioUnitario),
                descuento=float(d.descuento), impuesto=float(d.impuesto),
                subtotal=float(d.subtotal), total=float(d.total)
            )
            for d in invoice.details
        ]

    return InvoiceOut(
        id=invoice.id, numeroFactura=invoice.numeroFactura, saleId=invoice.saleId,
        userId=invoice.userId, fechaEmision=invoice.fechaEmision,
        fechaVencimiento=invoice.fechaVencimiento, subTotal=float(invoice.subTotal),
        descuento=float(invoice.descuento), impuestos=float(invoice.impuestos),
        total=float(invoice.total),
        estado=invoice.estado.value if isinstance(invoice.estado, InvoiceStatus) else invoice.estado,
        notas=invoice.notas, createdAt=invoice.createdAt, updatedAt=invoice.updatedAt,
        numeroVenta=sale.numeroVenta if sale else None,
        userFirstName=user.firstName if user else None,
        userLastName=user.lastName if user else None,
        userEmail=user.email if user else None,
        userDocument=getattr(user, 'documentNumber', None),
        userDocumentType=getattr(user, 'documentType', None),
        userAddress=getattr(user, 'address', None),
        userPhone=user.phone if user else None,
        details=details_out
    )


@router.get("")
def list_invoices(
    fechaInicio: Optional[date] = Query(None),
    fechaFin: Optional[date] = Query(None),
    clienteId: Optional[int] = Query(None),
    numero: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Invoice)

    if current_user.role == "host":
        query = query.join(Sale, Invoice.saleId == Sale.id).filter(Sale.hostId == current_user.id)

    if fechaInicio:
        query = query.filter(Invoice.fechaEmision >= fechaInicio)
    if fechaFin:
        query = query.filter(Invoice.fechaEmision <= fechaFin)
    if clienteId:
        query = query.filter(Invoice.userId == clienteId)
    if numero:
        query = query.filter(Invoice.numeroFactura.like(f"%{numero}%"))
    if estado:
        query = query.filter(Invoice.estado == estado)

    invoices = query.order_by(desc(Invoice.createdAt)).all()

    user_ids = {i.userId for i in invoices if i.userId}
    sale_ids = {i.saleId for i in invoices if i.saleId}

    users_map = {u.id: u for u in db.query(User).filter(User.id.in_(list(user_ids))).all()}
    sales_map = {s.id: s for s in db.query(Sale).filter(Sale.id.in_(list(sale_ids))).all()}

    result = [
        invoice_to_out(i, user=users_map.get(i.userId), sale=sales_map.get(i.saleId)).model_dump()
        for i in invoices
    ]

    return success_response(
        data={"facturas": result, "total": len(result)},
        message="Listado de facturas"
    )


@router.get("/me")
def my_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invoices = db.query(Invoice).filter(Invoice.userId == current_user.id).order_by(desc(Invoice.createdAt)).all()

    sale_ids = {i.saleId for i in invoices if i.saleId}
    sales_map = {s.id: s for s in db.query(Sale).filter(Sale.id.in_(list(sale_ids))).all()} if sale_ids else {}

    result = [
        invoice_to_out(i, user=current_user, sale=sales_map.get(i.saleId)).model_dump()
        for i in invoices
    ]
    return success_response(data={"facturas": result, "total": len(result)}, message="Mis facturas")


@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    is_admin = current_user.role == "admin"
    is_owner = invoice.userId == current_user.id
    sale = db.query(Sale).filter(Sale.id == invoice.saleId).first()
    is_host = sale is not None and sale.hostId == current_user.id

    if not (is_admin or is_owner or is_host):
        raise HTTPException(status_code=403, detail="No autorizado")

    user = db.query(User).filter(User.id == invoice.userId).first()

    return success_response(
        data=invoice_to_out(invoice, user=user, sale=sale).model_dump(),
        message="Factura obtenida"
    )


@router.post("")
def create_invoice(
    payload: InvoiceCreate,
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    sale = db.query(Sale).filter(Sale.id == payload.saleId).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    if current_user.role == "host" and sale.hostId != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    existing = db.query(Invoice).filter(Invoice.saleId == payload.saleId, Invoice.estado != InvoiceStatus.anulada).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe una factura para esta venta")

    num_factura = generate_invoice_number(db)

    invoice = Invoice(
        numeroFactura=num_factura, saleId=sale.id, userId=sale.userId,
        fechaEmision=date.today(),
        fechaVencimiento=payload.fechaVencimiento or (date.today() + timedelta(days=30)),
        subTotal=sale.subTotal, descuento=sale.descuento, impuestos=sale.impuestos,
        total=sale.total, estado=InvoiceStatus.pagada, notas=payload.notas
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

    db.commit()
    db.refresh(invoice)

    user = db.query(User).filter(User.id == invoice.userId).first()
    return success_response(
        data=invoice_to_out(invoice, user=user, sale=sale).model_dump(),
        message="Factura creada", status_code=201
    )


@router.patch("/{invoice_id}/status")
def update_invoice_status(
    invoice_id: int,
    payload: InvoiceStatusUpdate,
    current_user: User = Depends(require_host_or_admin),
    db: Session = Depends(get_db),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    estados_validos = [e.value for e in InvoiceStatus]
    if payload.estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Opciones: {estados_validos}")

    invoice.estado = InvoiceStatus(payload.estado)
    db.commit()
    db.refresh(invoice)

    user = db.query(User).filter(User.id == invoice.userId).first()
    sale = db.query(Sale).filter(Sale.id == invoice.saleId).first()

    return success_response(
        data=invoice_to_out(invoice, user=user, sale=sale).model_dump(),
        message="Estado de factura actualizado"
    )
