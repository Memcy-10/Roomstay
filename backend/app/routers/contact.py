from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.db import get_db
from app.core.responses import success_response
from app.dependencies.auth import require_admin, optional_user
from app.models.user import User
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactOut

router = APIRouter(prefix="/contact")


@router.post("/")
def create_contact(
    payload: ContactCreate,
    current_user: Optional[User] = Depends(optional_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.id if current_user else None
    contact = Contact(
        nombre=payload.nombre,
        email=payload.email,
        telefono=payload.telefono,
        asunto=payload.asunto,
        mensaje=payload.mensaje,
        userId=user_id,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    out = ContactOut.model_validate(contact).model_dump()
    return success_response(data=out, message="Mensaje enviado", status_code=201)


@router.get("/", dependencies=[Depends(require_admin)])
def get_all_contacts(db: Session = Depends(get_db)):
    contacts = db.query(Contact).order_by(desc(Contact.createdAt)).all()
    out_list = [ContactOut.model_validate(c).model_dump() for c in contacts]
    return success_response(
        data={"contactos": out_list, "total": len(out_list)},
        message="Contactos obtenidos",
    )


@router.get("/{contact_id}", dependencies=[Depends(require_admin)])
def get_contact_detail(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    out = ContactOut.model_validate(contact).model_dump()
    return success_response(data=out, message="Contacto obtenido")


@router.delete("/{contact_id}", dependencies=[Depends(require_admin)])
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    db.delete(contact)
    db.commit()
    return success_response(message="Contacto eliminado")
