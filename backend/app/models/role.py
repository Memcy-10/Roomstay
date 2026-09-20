from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.db import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(20), unique=True, nullable=False, index=True)
    description = Column(String(100), nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
