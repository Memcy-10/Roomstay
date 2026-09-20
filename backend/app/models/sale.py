from sqlalchemy import Column, Integer, String, Date, DECIMAL, Enum, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.core.db import Base
import enum


class SaleStatus(str, enum.Enum):
    pendiente = "pendiente"
    completada = "completada"
    cancelada = "cancelada"
    reembolsada = "reembolsada"


class Sale(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numeroVenta = Column(String(30), unique=True, nullable=False, index=True)
    userId = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    reservationId = Column(Integer, ForeignKey("reservaciones.id", ondelete="SET NULL"), nullable=True, index=True)
    hostId = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True, index=True)
    fechaVenta = Column(Date, nullable=False, index=True)
    subTotal = Column(DECIMAL(12, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    impuestos = Column(DECIMAL(12, 2), nullable=False, default=0)
    total = Column(DECIMAL(12, 2), nullable=False)
    metodoPago = Column(String(30), nullable=False, default="transferencia")
    estado = Column(Enum(SaleStatus), nullable=False, default=SaleStatus.completada, index=True)
    observaciones = Column(String(500), nullable=True)
    createdBy = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[userId])
    host = relationship("User", foreign_keys=[hostId])
    reservation = relationship("Reservation", foreign_keys=[reservationId])
    details = relationship("SaleDetail", back_populates="sale", cascade="all, delete-orphan", foreign_keys="SaleDetail.saleId")
    invoices = relationship("Invoice", back_populates="sale", foreign_keys="Invoice.saleId")


class SaleDetail(Base):
    __tablename__ = "detalle_ventas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    saleId = Column(Integer, ForeignKey("ventas.id", ondelete="CASCADE"), nullable=False, index=True)
    habitacionId = Column(Integer, ForeignKey("habitaciones.id", ondelete="SET NULL"), nullable=True, index=True)
    descripcion = Column(String(250), nullable=False)
    tipo = Column(String(30), nullable=False, default="habitacion")
    cantidad = Column(Integer, nullable=False, default=1)
    precioUnitario = Column(DECIMAL(12, 2), nullable=False)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    impuesto = Column(DECIMAL(12, 2), nullable=False, default=0)
    subtotal = Column(DECIMAL(12, 2), nullable=False)
    total = Column(DECIMAL(12, 2), nullable=False)

    sale = relationship("Sale", back_populates="details", foreign_keys=[saleId])
    room = relationship("Room", foreign_keys=[habitacionId])
