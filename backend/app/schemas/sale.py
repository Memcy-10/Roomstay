from datetime import date, datetime
from typing import Optional, List
from typing_extensions import Annotated
from pydantic import BaseModel, Field

from app.schemas.common import BaseSchema


class SaleDetailCreate(BaseModel):
    habitacionId: Optional[int] = None
    descripcion: Annotated[str, Field(min_length=2, max_length=250)]
    tipo: str = "habitacion"
    cantidad: Annotated[int, Field(ge=1)] = 1
    precioUnitario: Annotated[float, Field(ge=0)]
    descuento: Annotated[float, Field(ge=0)] = 0
    impuesto: Annotated[float, Field(ge=0)] = 0


class SaleCreate(BaseModel):
    reservationId: Optional[int] = None
    hostId: Optional[int] = None
    fechaVenta: Optional[date] = None
    subTotal: Optional[Annotated[float, Field(ge=0)]] = None
    descuento: Annotated[float, Field(ge=0)] = 0
    impuestos: Annotated[float, Field(ge=0)] = 0
    total: Optional[Annotated[float, Field(ge=0)]] = None
    metodoPago: str = "transferencia"
    estado: str = "completada"
    observaciones: Optional[Annotated[str, Field(max_length=500)]] = None
    details: List[SaleDetailCreate]


class SaleStatusUpdate(BaseModel):
    estado: str


class SaleDetailOut(BaseSchema):
    id: Optional[int] = None
    saleId: Optional[int] = None
    habitacionId: Optional[int] = None
    descripcion: Optional[str] = None
    tipo: Optional[str] = None
    cantidad: Optional[int] = None
    precioUnitario: Optional[float] = None
    descuento: Optional[float] = None
    impuesto: Optional[float] = None
    subtotal: Optional[float] = None
    total: Optional[float] = None
    habitacionTitulo: Optional[str] = None


class SaleOut(BaseSchema):
    id: Optional[int] = None
    numeroVenta: Optional[str] = None
    userId: Optional[int] = None
    reservationId: Optional[int] = None
    hostId: Optional[int] = None
    fechaVenta: Optional[date] = None
    subTotal: Optional[float] = None
    descuento: Optional[float] = None
    impuestos: Optional[float] = None
    total: Optional[float] = None
    metodoPago: Optional[str] = None
    estado: Optional[str] = None
    observaciones: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    userFirstName: Optional[str] = None
    userLastName: Optional[str] = None
    userEmail: Optional[str] = None
    userDocument: Optional[str] = None
    userPhone: Optional[str] = None
    hostFirstName: Optional[str] = None
    hostLastName: Optional[str] = None
    reservationInfo: Optional[str] = None
    details: Optional[List[SaleDetailOut]] = None
