from typing import Any, Optional
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


def success_response(
    data: Any = None,
    message: str = "Operación exitosa",
    status_code: int = 200,
) -> JSONResponse:
    content = {
        "success": True,
        "message": message,
    }
    if data is not None:
        content["data"] = data
    return JSONResponse(status_code=status_code, content=jsonable_encoder(content))


def error_response(
    message: str = "Error en la operación",
    status_code: int = 400,
    errors: Any = None,
    code: Optional[str] = None,
) -> JSONResponse:
    content = {
        "success": False,
        "message": message,
    }
    if errors is not None:
        content["errors"] = errors
    if code is not None:
        content["code"] = code
    return JSONResponse(status_code=status_code, content=content)
