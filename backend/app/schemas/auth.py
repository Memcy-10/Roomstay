import re
from datetime import datetime
from typing import Literal, Optional
from typing_extensions import Annotated
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    EmailStr,
    model_validator,
    field_validator,
)

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
DOCUMENT_REGEX = re.compile(r"^[a-zA-Z0-9]{6,20}$")
PHONE_REGEX = re.compile(r"^3[0-9]{9}$")
NAME_REGEX = re.compile(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s']{2,50}$")
ADDRESS_REGEX = re.compile(r"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#,\-.°]{5,100}$")
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$")
VALID_ROLES = ["user", "host", "admin"]


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None


class RegisterRequest(BaseModel):
    firstName: Annotated[str, Field(min_length=2, max_length=50)]
    lastName: Annotated[str, Field(min_length=2, max_length=50)]
    documentType: str
    documentNumber: str
    address: str
    phone: str
    email: EmailStr
    password: str
    confirmPassword: str
    role: Literal["user", "host"] = "user"

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
    def check_passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirmPassword:
            raise ValueError("Las contraseñas no coinciden")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RecoverPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str
    confirmPassword: str

    @field_validator("newPassword")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not PASSWORD_REGEX.match(v):
            raise ValueError("Contraseña inválida: mínimo 8 caracteres, mayúscula, minúscula, dígito y símbolo")
        return v

    @model_validator(mode="after")
    def check_passwords_match(self) -> "ResetPasswordRequest":
        if self.newPassword != self.confirmPassword:
            raise ValueError("Las contraseñas no coinciden")
        return self


class UserSafe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    documentType: Optional[str] = None
    documentNumber: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    estado: Optional[str] = None
    createdAt: Optional[datetime] = None


class AuthResponse(BaseModel):
    user: UserSafe
    token: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not PASSWORD_REGEX.match(v):
            raise ValueError("Contraseña inválida: mínimo 8 caracteres, mayúscula, minúscula, dígito y símbolo")
        return v

    @model_validator(mode="after")
    def check_passwords_match(self) -> "ChangePasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("Las contraseñas no coinciden")
        return self
