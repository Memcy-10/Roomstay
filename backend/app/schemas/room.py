from datetime import datetime
from typing import Optional, List, Union
from typing_extensions import Annotated
from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.schemas.common import BaseSchema


class RoomBase(BaseSchema):
    titulo: Annotated[str, Field(min_length=3)]
    descripcion: Annotated[str, Field(min_length=10)]
    precio: Annotated[float, Field(gt=0)]
    ubicacion: Annotated[str, Field(min_length=3)]
    capacidad: Annotated[int, Field(ge=1)]
    tipo: str
    servicios: List[str] = Field(default_factory=list)
    imageUrl: Union[HttpUrl, str]
    disponible: bool = True


class RoomCreate(RoomBase):
    hostId: Optional[int] = None


class RoomUpdate(BaseSchema):
    titulo: Optional[Annotated[str, Field(min_length=3)]] = None
    descripcion: Optional[Annotated[str, Field(min_length=10)]] = None
    precio: Optional[Annotated[float, Field(gt=0)]] = None
    ubicacion: Optional[Annotated[str, Field(min_length=3)]] = None
    capacidad: Optional[Annotated[int, Field(ge=1)]] = None
    tipo: Optional[str] = None
    servicios: Optional[List[str]] = None
    imageUrl: Optional[Union[HttpUrl, str]] = None
    disponible: Optional[bool] = None


class RoomOut(BaseSchema):
    id: Optional[int] = None
    hostId: Optional[int] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    ubicacion: Optional[str] = None
    capacidad: Optional[int] = None
    tipo: Optional[str] = None
    servicios: List[str] = Field(default_factory=list)
    imageUrl: Optional[str] = None
    disponible: Optional[bool] = None
    createdAt: Optional[datetime] = None
    hostFirstName: Optional[str] = None
    hostLastName: Optional[str] = None
    hostEmail: Optional[str] = None
    hostPhone: Optional[str] = None


class FavoriteOut(BaseSchema):
    favoritoId: Optional[int] = None
    favoritoAt: Optional[datetime] = None
    habitacion: RoomOut
