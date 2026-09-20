from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.core.db import Base


class PasswordRecovery(Base):
    __tablename__ = "recuperacion_contrasenas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(100), nullable=False, index=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    usado = Column(Boolean, default=False, nullable=True)
    expiresAt = Column(DateTime, nullable=False)
    createdAt = Column(DateTime, server_default=func.now())
