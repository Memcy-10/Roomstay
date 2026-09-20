import re
from datetime import datetime
from typing import Optional
from typing_extensions import Annotated
from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator

NAME_REGEX = re.compile(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']{2,100}$")
PHONE_REGEX = re.compile(r"^3[0-9]{9}$")


class ContactCreate(BaseModel):
    nombre: Annotated[str, Field(min_length=2, max_length=100)]
    email: EmailStr
    telefono: Optional[str] = None
    asunto: Annotated[str, Field(min_length=5, max_length=100)]
    mensaje: Annotated[str, Field(min_length=10, max_length=500)]

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, v: str) -> str:
        if not NAME_REGEX.match(v):
            raise ValueError("Formato de nombre inválido")
        return v

    @field_validator("telefono")
    @classmethod
    def validate_telefono(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not PHONE_REGEX.match(v):
            raise ValueError("Teléfono inválido (debe comenzar por 3 y tener 10 dígitos)")
        return v


class ContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    nombre: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    asunto: Optional[str] = None
    mensaje: Optional[str] = None
    userId: Optional[int] = None
    createdAt: Optional[datetime] = None
