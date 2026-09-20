import re
from typing import Literal, Optional
from typing_extensions import Annotated
from pydantic import BaseModel, Field, EmailStr, model_validator, field_validator

NAME_REGEX = re.compile(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']{2,50}$")
DOCUMENT_REGEX = re.compile(r"^[a-zA-Z0-9]{6,20}$")
PHONE_REGEX = re.compile(r"^3[0-9]{9}$")
ADDRESS_REGEX = re.compile(r"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#,\-.°]{5,100}$")
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$")


class AdminUserCreate(BaseModel):
    firstName: Annotated[str, Field(min_length=2, max_length=50)]
    lastName: Annotated[str, Field(min_length=2, max_length=50)]
    documentType: str
    documentNumber: str
    address: str
    phone: str
    email: EmailStr
    password: str
    confirmPassword: str
    role: Literal["user", "host", "admin"] = "user"

    @field_validator("firstName", "lastName")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not NAME_REGEX.match(v):
            raise ValueError("Formato de nombre inválido")
        return v

    @field_validator("documentNumber")
    @classmethod
    def validate_document(cls, v: str) -> str:
        if not DOCUMENT_REGEX.match(v):
            raise ValueError("Número de documento inválido (6-20 alfanuméricos)")
        return v

    @field_validator("address")
    @classmethod
    def validate_address(cls, v: str) -> str:
        if not ADDRESS_REGEX.match(v):
            raise ValueError("Dirección inválida (5-100 caracteres)")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not PHONE_REGEX.match(v):
            raise ValueError("Teléfono inválido (debe comenzar por 3 y tener 10 dígitos)")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not PASSWORD_REGEX.match(v):
            raise ValueError("Contraseña inválida: mínimo 8 caracteres, mayúscula, minúscula, dígito y símbolo")
        return v

    @model_validator(mode="after")
    def check_passwords_match(self) -> "AdminUserCreate":
        if self.password != self.confirmPassword:
            raise ValueError("Las contraseñas no coinciden")
        return self


class AdminUserUpdate(BaseModel):
    firstName: Optional[Annotated[str, Field(min_length=2, max_length=50)]] = None
    lastName: Optional[Annotated[str, Field(min_length=2, max_length=50)]] = None
    documentType: Optional[str] = None
    documentNumber: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[Literal["user", "host", "admin"]] = None
    estado: Optional[Literal["activo", "inactivo"]] = None

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

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not PASSWORD_REGEX.match(v):
            raise ValueError("Contraseña inválida: mínimo 8 caracteres, mayúscula, minúscula, dígito y símbolo")
        return v
