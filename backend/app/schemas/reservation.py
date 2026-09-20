from datetime import date, datetime
from typing import Optional, Literal
from typing_extensions import Annotated
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import BaseSchema


class ReservationCreate(BaseModel):
    habitacionId: Annotated[int, Field(ge=1)]
    fechaIngreso: date
    fechaSalida: date
    huespedes: Annotated[int, Field(ge=1)] = 1
    notas: Optional[Annotated[str, Field(max_length=500)]] = None


class ReservationStatusUpdate(BaseModel):
    estado: Literal["pendiente", "confirmada", "cancelada", "completada"]


class ReservationOut(BaseSchema):
    id: Optional[int] = None
    userId: Optional[int] = None
    habitacionId: Optional[int] = None
    fechaIngreso: Optional[date] = None
    fechaSalida: Optional[date] = None
    huespedes: Optional[int] = None
    precioNoche: Optional[float] = None
    totalNoches: Optional[int] = None
    total: Optional[float] = None
    estado: Optional[str] = None
    notas: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    habitacionTitulo: Optional[str] = None
    habitacionImage: Optional[str] = None
    habitacionPrecio: Optional[float] = None
    habitacionCapacidad: Optional[int] = None
    habitacionUbicacion: Optional[str] = None
    hostId: Optional[int] = None
    userFirstName: Optional[str] = None
    userLastName: Optional[str] = None
    userEmail: Optional[str] = None
    userPhone: Optional[str] = None


class AvailabilityResponse(BaseModel):
    disponible: bool
    motivo: Optional[str] = None
    noches: Optional[int] = None
