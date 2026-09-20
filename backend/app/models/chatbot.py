from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Text, func, Boolean
from sqlalchemy.orm import relationship
from app.core.db import Base
import enum


class SenderType(str, enum.Enum):
    usuario = "usuario"
    bot = "bot"
    sistema = "sistema"


class Conversation(Base):
    __tablename__ = "conversaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True, index=True)
    sessionId = Column(String(100), unique=True, nullable=False, index=True)
    titulo = Column(String(150), nullable=True)
    estado = Column(String(20), nullable=False, default="activa", index=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[userId])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", foreign_keys="Message.conversationId")


class Message(Base):
    __tablename__ = "mensajes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversationId = Column(Integer, ForeignKey("conversaciones.id", ondelete="CASCADE"), nullable=False, index=True)
    remitente = Column(Enum(SenderType), nullable=False)
    contenido = Column(Text, nullable=False)
    tokensUsados = Column(Integer, nullable=True)
    modelo = Column(String(50), nullable=True)
    esError = Column(Boolean, default=False, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages", foreign_keys=[conversationId])
