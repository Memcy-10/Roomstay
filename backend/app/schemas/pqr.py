from datetime import datetime
from typing import Optional
from typing_extensions import Annotated
from pydantic import BaseModel, Field
from enum import Enum

from app.schemas.common import BaseSchema


class PQRTypeEnum(str, Enum):
    peticion = "peticion"
    queja = "queja"
    reclamo = "reclamo"
    sugerencia = "sugerencia"

class PQRPriorityEnum(str, Enum):
    alta = "alta"
    media = "media"
    baja = "baja"


class PQRCreate(BaseModel):
    tipo: PQRTypeEnum
    titulo: Annotated[str, Field(min_length=3, max_length=150)]
    descripcion: Annotated[str, Field(min_length=10)]
    prioridad: PQRPriorityEnum = PQRPriorityEnum.media
    reservationId: Optional[int] = None


class PQRStatusUpdate(BaseModel):
    estado: str


class PQRAnswer(BaseModel):
    respuesta: Annotated[str, Field(min_length=5)]


class PQROut(BaseSchema):
    id: Optional[int] = None
    numeroRadicado: Optional[str] = None
    userId: Optional[int] = None
    tipo: Optional[str] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    prioridad: Optional[str] = None
    reservationId: Optional[int] = None
    respuesta: Optional[str] = None
    answeredBy: Optional[int] = None
    fechaRespuesta: Optional[datetime] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    userFirstName: Optional[str] = None
    userLastName: Optional[str] = None
    userEmail: Optional[str] = None
    answeredByName: Optional[str] = None
    reservationInfo: Optional[str] = None
