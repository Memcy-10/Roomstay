import re
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.db import engine, Base
from app.core.responses import error_response
from app.routers import health as health_router
from app.routers import auth as auth_router
from app.routers import users as users_router
from app.routers import rooms as rooms_router
from app.routers import reservations as reservations_router
from app.routers import admin as admin_router
from app.routers import contact as contact_router
from app.routers import upload as upload_router
from app.routers import sales as sales_router
from app.routers import invoices as invoices_router
from app.routers import pqr as pqr_router
from app.routers import stats as stats_router
from app.routers import reports as reports_router
from app.routers import chatbot as chatbot_router

app = FastAPI(title="RoomStay API", version="1.0.0")
app.mount("/uploads", StaticFiles(directory=Path(__file__).resolve().parent / "uploads", check_dir=False), name="uploads")
app.mount("/catalog-images", StaticFiles(directory=Path(__file__).resolve().parents[1] / "frontend" / "src" / "assets" / "images", check_dir=False), name="catalog-images")

cors_origins_list = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins_list,
    allow_origin_regex=r"^http://localhost(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    errors = {}
    for err in exc.errors():
        loc = " -> ".join(str(x) for x in err["loc"])
        errors[loc] = err["msg"]
    return error_response(
        message="Error de validación",
        status_code=400,
        errors=errors,
        code="VALIDATION_ERROR",
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return error_response(
        message=exc.detail if isinstance(exc.detail, str) else "Error HTTP",
        status_code=exc.status_code,
        code=str(exc.detail) if isinstance(exc.detail, str) else None,
    )


app.include_router(health_router.router, prefix="/api")
app.include_router(auth_router.router, prefix="/api")
app.include_router(users_router.router, prefix="/api")
app.include_router(rooms_router.router, prefix="/api")
app.include_router(reservations_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")
app.include_router(contact_router.router, prefix="/api")
app.include_router(upload_router.router, prefix="/api")
app.include_router(sales_router.router, prefix="/api")
app.include_router(invoices_router.router, prefix="/api")
app.include_router(pqr_router.router, prefix="/api")
app.include_router(stats_router.router, prefix="/api")
app.include_router(reports_router.router, prefix="/api")
app.include_router(chatbot_router.router, prefix="/api")


@app.on_event("startup")
async def on_startup():
    Base.metadata.create_all(bind=engine)
