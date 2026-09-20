from sqlalchemy import Column, Integer, String, Text, DECIMAL, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.db import Base


class Room(Base):
    __tablename__ = "habitaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hostId = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True)
    titulo = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=False)
    precio = Column(DECIMAL(12, 2), nullable=False)
    ubicacion = Column(String(100), nullable=False)
    capacidad = Column(Integer, nullable=False, default=1)
    tipo = Column(String(50), nullable=False, index=True)
    servicios = Column(Text, nullable=True)
    imageUrl = Column(String(500), nullable=False)
    disponible = Column(Boolean, default=True, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

    host = relationship("User", back_populates="rooms", foreign_keys=[hostId])
    reservations = relationship("Reservation", back_populates="room", foreign_keys="Reservation.habitacionId")
    favorites = relationship("Favorite", back_populates="room", foreign_keys="Favorite.habitacionId")
    sale_details = relationship("SaleDetail", back_populates="room", foreign_keys="SaleDetail.habitacionId")
