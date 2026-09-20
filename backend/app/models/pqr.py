from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.core.db import Base
import enum


class PQRType(str, enum.Enum):
    peticion = "peticion"
    queja = "queja"
    reclamo = "reclamo"
    sugerencia = "sugerencia"


class PQRStatus(str, enum.Enum):
    pendiente = "pendiente"
    en_proceso = "en_proceso"
    respondida = "respondida"
    cerrada = "cerrada"


class PQR(Base):
    __tablename__ = "pqr"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numeroRadicado = Column(String(30), unique=True, nullable=False, index=True)
    userId = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    tipo = Column(Enum(PQRType), nullable=False, index=True)
    titulo = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=False)
    estado = Column(Enum(PQRStatus), nullable=False, default=PQRStatus.pendiente, index=True)
    prioridad = Column(String(20), nullable=False, default="media")
    reservationId = Column(Integer, ForeignKey("reservaciones.id", ondelete="SET NULL"), nullable=True, index=True)
    respuesta = Column(Text, nullable=True)
    answeredBy = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    fechaRespuesta = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[userId])
    reservation = relationship("Reservation", foreign_keys=[reservationId])
    admin = relationship("User", foreign_keys=[answeredBy])
