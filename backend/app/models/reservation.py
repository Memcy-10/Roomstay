from sqlalchemy import Column, Integer, String, Date, DECIMAL, Enum, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.core.db import Base
import enum


class ReservationStatus(str, enum.Enum):
    pendiente = "pendiente"
    confirmada = "confirmada"
    pagada = "pagada"
    cancelada = "cancelada"
    completada = "completada"


class Reservation(Base):
    __tablename__ = "reservaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    habitacionId = Column(Integer, ForeignKey("habitaciones.id", ondelete="CASCADE"), nullable=False, index=True)
    fechaIngreso = Column(Date, nullable=False)
    fechaSalida = Column(Date, nullable=False)
    huespedes = Column(Integer, nullable=False, default=1)
    precioNoche = Column(DECIMAL(12, 2), nullable=False)
    totalNoches = Column(Integer, nullable=False)
    total = Column(DECIMAL(12, 2), nullable=False)
    estado = Column(Enum(ReservationStatus), nullable=False, default=ReservationStatus.confirmada, index=True)
    notas = Column(String(500), nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

    room = relationship("Room", back_populates="reservations", foreign_keys=[habitacionId])
    user = relationship("User", back_populates="reservations_as_user", foreign_keys=[userId])
    sales = relationship("Sale", back_populates="reservation", foreign_keys="Sale.reservationId")
    pqrs = relationship("PQR", back_populates="reservation", foreign_keys="PQR.reservationId")
