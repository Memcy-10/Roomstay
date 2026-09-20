from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel

from app.schemas.common import BaseSchema


class InvoiceCreate(BaseModel):
    saleId: int
    fechaVencimiento: Optional[date] = None
    notas: Optional[str] = None


class InvoiceStatusUpdate(BaseModel):
    estado: str


class InvoiceDetailOut(BaseSchema):
    id: Optional[int] = None
    invoiceId: Optional[int] = None
    descripcion: Optional[str] = None
    cantidad: Optional[int] = None
    precioUnitario: Optional[float] = None
    descuento: Optional[float] = None
    impuesto: Optional[float] = None
    subtotal: Optional[float] = None
    total: Optional[float] = None


class InvoiceOut(BaseSchema):
    id: Optional[int] = None
    numeroFactura: Optional[str] = None
    saleId: Optional[int] = None
    userId: Optional[int] = None
    fechaEmision: Optional[date] = None
    fechaVencimiento: Optional[date] = None
    subTotal: Optional[float] = None
    descuento: Optional[float] = None
    impuestos: Optional[float] = None
    total: Optional[float] = None
    estado: Optional[str] = None
    notas: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    numeroVenta: Optional[str] = None
    userFirstName: Optional[str] = None
    userLastName: Optional[str] = None
    userEmail: Optional[str] = None
    userDocument: Optional[str] = None
    userDocumentType: Optional[str] = None
    userAddress: Optional[str] = None
    userPhone: Optional[str] = None
    details: Optional[List[InvoiceDetailOut]] = None
