from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.db import Base


class Contact(Base):
    __tablename__ = "contactos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, index=True)
    telefono = Column(String(20), nullable=True)
    asunto = Column(String(100), nullable=False)
    mensaje = Column(Text, nullable=False)
    userId = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True, index=True)
    createdAt = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="contacts", foreign_keys=[userId])
