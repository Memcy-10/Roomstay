from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi import Request

from app.dependencies.auth import require_host_or_admin
from app.models.user import User

router = APIRouter(prefix="/upload")
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("")
async def upload_image(
    request: Request,
    image: UploadFile = File(...),
    current_user: User = Depends(require_host_or_admin),
):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de imagen no permitido")

    extension = Path(image.filename or "imagen").suffix.lower() or ".jpg"
    filename = f"{uuid4().hex}{extension}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    destination = UPLOAD_DIR / filename
    destination.write_bytes(await image.read())

    return {"url": f"{str(request.base_url).rstrip('/')}/uploads/{filename}"}
