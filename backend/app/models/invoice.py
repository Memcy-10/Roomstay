from sqlalchemy import Column, Integer, String, Date, DECIMAL, Enum, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.core.db import Base
import enum


class InvoiceStatus(str, enum.Enum):
    pendiente = "pendiente"
    pagada = "pagada"
    vencida = "vencida"
    anulada = "anulada"


class Invoice(Base):
    __tablename__ = "facturas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numeroFactura = Column(String(30), unique=True, nullable=False, index=True)
    saleId = Column(Integer, ForeignKey("ventas.id", ondelete="CASCADE"), nullable=False, index=True)
    userId = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    fechaEmision = Column(Date, nullable=False, index=True)
    fechaVencimiento = Column(Date, nullable=True)
    subTotal = Column(DECIMAL(12, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    impuestos = Column(DECIMAL(12, 2), nullable=False, default=0)
    total = Column(DECIMAL(12, 2), nullable=False)
    estado = Column(Enum(InvoiceStatus), nullable=False, default=InvoiceStatus.pagada, index=True)
    notas = Column(String(500), nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

    sale = relationship("Sale", back_populates="invoices", foreign_keys=[saleId])
    user = relationship("User", foreign_keys=[userId])
    details = relationship("InvoiceDetail", back_populates="invoice", cascade="all, delete-orphan", foreign_keys="InvoiceDetail.invoiceId")


class InvoiceDetail(Base):
    __tablename__ = "detalle_facturas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoiceId = Column(Integer, ForeignKey("facturas.id", ondelete="CASCADE"), nullable=False, index=True)
    descripcion = Column(String(250), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precioUnitario = Column(DECIMAL(12, 2), nullable=False)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    impuesto = Column(DECIMAL(12, 2), nullable=False, default=0)
    subtotal = Column(DECIMAL(12, 2), nullable=False)
    total = Column(DECIMAL(12, 2), nullable=False)

    invoice = relationship("Invoice", back_populates="details", foreign_keys=[invoiceId])
