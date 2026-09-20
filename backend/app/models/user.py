from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.db import Base


class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    firstName = Column(String(50), nullable=False)
    lastName = Column(String(50), nullable=False)
    documentType = Column(String(20), nullable=False)
    documentNumber = Column(String(20), unique=True, nullable=False, index=True)
    address = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(20), ForeignKey("roles.name", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False, default="user", index=True)
    estado = Column(String(10), nullable=False, default="activo", index=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

    rooms = relationship("Room", back_populates="host", foreign_keys="Room.hostId")
    reservations_as_user = relationship("Reservation", back_populates="user", foreign_keys="Reservation.userId")
    favorites = relationship("Favorite", back_populates="user", foreign_keys="Favorite.userId")
    contacts = relationship("Contact", back_populates="user", foreign_keys="Contact.userId")
    sales_as_user = relationship("Sale", foreign_keys="Sale.userId")
    sales_as_host = relationship("Sale", foreign_keys="Sale.hostId")
    invoices = relationship("Invoice", foreign_keys="Invoice.userId")
    pqrs_as_user = relationship("PQR", foreign_keys="PQR.userId")
    pqrs_answered = relationship("PQR", foreign_keys="PQR.answeredBy")
    conversations = relationship("Conversation", back_populates="user", foreign_keys="Conversation.userId")
