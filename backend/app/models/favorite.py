from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.core.db import Base


class Favorite(Base):
    __tablename__ = "favoritos"
    __table_args__ = (
        UniqueConstraint("userId", "habitacionId", name="uk_user_habitacion"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    userId = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    habitacionId = Column(Integer, ForeignKey("habitaciones.id", ondelete="CASCADE"), nullable=False, index=True)
    createdAt = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="favorites", foreign_keys=[userId])
    room = relationship("Room", back_populates="favorites", foreign_keys=[habitacionId])
