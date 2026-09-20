import time
from datetime import datetime
from fastapi import APIRouter

from app.core.responses import success_response

router = APIRouter()

_START_TIME = time.time()


@router.get("/health")
def health_check():
    uptime_seconds = time.time() - _START_TIME
    return success_response(
        data={
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime": round(uptime_seconds, 2),
        },
        message="Servicio activo",
    )


@router.get("/")
def root_info():
    return success_response(
        data={
            "name": "RoomStay API",
            "version": "1.0.0",
            "endpoints": [
                "auth",
                "rooms",
                "user",
                "reservations",
                "admin",
                "contact",
            ],
        },
        message="Bienvenido a RoomStay API",
    )
