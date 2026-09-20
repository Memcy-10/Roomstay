import re
from datetime import datetime
from typing import Optional, Dict, Any
from typing_extensions import Annotated
from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator

NAME_REGEX = re.compile(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']{2,50}$")
DOCUMENT_REGEX = re.compile(r"^[a-zA-Z0-9]{6,20}$")
PHONE_REGEX = re.compile(r"^3[0-9]{9}$")
ADDRESS_REGEX = re.compile(r"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#,\-.°]{5,100}$")


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    documentType: Optional[str] = None
    documentNumber: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    estado: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class ProfileStatsResponse(BaseModel):
    user: UserProfile
    stats: Dict[str, Any]


class UpdateProfileRequest(BaseModel):
    firstName: Optional[Annotated[str, Field(min_length=2, max_length=50)]] = None
    lastName: Optional[Annotated[str, Field(min_length=2, max_length=50)]] = None
    documentType: Optional[str] = None
    documentNumber: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

    @field_validator("firstName", "lastName")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not NAME_REGEX.match(v):
            raise ValueError("Formato de nombre inválido")
        return v

    @field_validator("documentNumber")
    @classmethod
    def validate_document(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not DOCUMENT_REGEX.match(v):
            raise ValueError("Número de documento inválido (6-20 alfanuméricos)")
        return v

    @field_validator("address")
    @classmethod
    def validate_address(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not ADDRESS_REGEX.match(v):
            raise ValueError("Dirección inválida (5-100 caracteres)")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not PHONE_REGEX.match(v):
            raise ValueError("Teléfono inválido (debe comenzar por 3 y tener 10 dígitos)")
        return v
