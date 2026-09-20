import uuid
import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.responses import success_response
from app.core.config import settings
from app.dependencies.auth import get_current_user, optional_user
from app.models.user import User
from app.models.chatbot import Conversation, Message, SenderType
from app.schemas.stats import ChatRequest, ChatResponse

router = APIRouter(prefix="/chatbot")


FAQ_BASE = [
    {"keywords": ["hola", "buenos días", "buenas", "saludos", "hey"],
     "answer": "¡Hola! Bienvenido a RoomStay 🏨. ¿En qué puedo ayudarte hoy? Puedo ayudarte con: información de habitaciones, reservas, pagos, PQR, entre otros."},
    {"keywords": ["habitacion", "habitaciones", "cuarto", "cuartos", "alojamiento", "hospedaje", "alquilar"],
     "answer": "En RoomStay tenemos una amplia variedad de habitaciones: individuales, familiares, suites, lofts, villas, apartamentos, cabañas y más. Puedes explorarlas en la sección 'Habitaciones' o ir directamente a /rooms. ¿Buscas algo en particular (ubicación, precio, capacidad)?"},
    {"keywords": ["reserva", "reservar", "reservacion", "reservaciones", "cómo reservar"],
     "answer": "Para reservar sigue estos pasos: 1) Explora nuestras habitaciones en /rooms, 2) Selecciona la que te guste, 3) Elige fechas de ingreso y salida, 4) Clic en 'Reservar'. Debes iniciar sesión. ¿Te ayudo a encontrar disponibilidad?"},
    {"keywords": ["precio", "valor", "costo", "cuánto cuesta", "tarifa"],
     "answer": "Los precios varían según tipo de habitación, ubicación y temporada. Van desde ~COP 55.000 (económicas) hasta ~COP 450.000+ (villas premium). Puedes ver precios actualizados en la página de cada habitación."},
    {"keywords": ["pago", "pagos", "método", "transferencia", "tarjeta"],
     "answer": "Aceptamos los siguientes métodos de pago: transferencia bancaria, tarjeta débito/crédito, Nequi y Daviplata. El pago se confirma al momento de la reserva."},
    {"keywords": ["cancelar", "cancelación", "reembolso", "devolver"],
     "answer": "Política de cancelación: puedes cancelar tu reserva hasta 48 horas antes de la fecha de ingreso. Para cancelar ve a 'Mis Reservaciones' en tu panel de usuario. Los reembolsos se procesan en 3-5 días hábiles."},
    {"keywords": ["pqr", "queja", "reclamo", "petición", "sugerencia", "problema"],
     "answer": "Puedes registrar una PQR (Petición, Queja, Reclamo o Sugerencia) desde tu panel de usuario en la sección 'Mi PQR'. El tiempo de respuesta máximo es 3 días hábiles. También puedes ir a /user/dashboard y seleccionar la opción PQR."},
    {"keywords": ["contacto", "contactar", "atención", "atención al cliente", "teléfono"],
     "answer": "Puedes contactarnos: 📞 Teléfono/WhatsApp: +57 300 123 4567, ✉ Email: contacto@roomstay.com, 📍 Dirección: Calle 123 #45-67, Bogotá. Horario de atención: Lunes a Domingo 24/7."},
    {"keywords": ["ubicación", "dirección", "dónde", "ciudad"],
     "answer": "RoomStay tiene habitaciones en toda Colombia: Bogotá, Medellín, Cali, Cartagena, Barranquilla, Bucaramanga, Santa Marta, Pereira, Manizales, Guatapé y más ciudades. ¡Explora destinos en /rooms!"},
    {"keywords": ["check-in", "checkin", "ingreso", "entrada", "llegada", "check-out", "checkout", "salida"],
     "answer": "Horarios estándar: 🟢 Check-in: 3:00 PM, 🔴 Check-out: 11:00 AM. ¿Necesitas check-in temprano o check-out tardío? Consulta disponibilidad con tu anfitrión."},
    {"keywords": ["servicio", "servicios", "amenidades", "wifi", "piscina", "parking", "cocina"],
     "answer": "Nuestras habitaciones incluyen servicios como: WiFi gratuito, aire acondicionado, baño privado, TV, ropa de cama. Habitaciones premium pueden incluir piscina, cocina equipada, gimnasio, desayuno, jacuzzi, parking, spa, entre otros."},
    {"keywords": ["mascota", "perro", "gato", "pet friendly"],
     "answer": "¡Sí! Algunas de nuestras habitaciones son Pet Friendly. Busca la opción 'Pet friendly' en los filtros de búsqueda (ej: Loft Estilo Industrial en Cali). Aplican términos y condiciones."},
    {"keywords": ["familia", "niños", "niño", "familiar"],
     "answer": "Tenemos opciones para familias: Habitación Familiar (4 personas), Apartamentos, Villas con piscina (6+ personas). Usa el filtro por capacidad para encontrar la ideal."},
    {"keywords": ["usuario", "perfil", "contraseña", "recuperar", "olvidé", "cuenta"],
     "answer": "Para gestionar tu cuenta: ✅ Editar perfil → Panel de usuario → 'Mi Información', ✅ Cambiar contraseña → 'Seguridad', ✅ Recuperar contraseña → 'Olvidé mi contraseña' en login. ¿Necesitas ayuda con algo específico?"},
    {"keywords": ["gracias", "muchas gracias", "thank", "ty"],
     "answer": "¡De nada! 😊 Ha sido un placer ayudarte. Si tienes más preguntas, aquí estaré. ¡Que tengas un excelente día y una estadía maravillosa con RoomStay! 🏨✨"},
]

SYSTEM_PROMPT = """
Eres un asistente virtual amable, profesional y útil de RoomStay, una plataforma de reservas de habitaciones en Colombia.
Tu objetivo es ayudar a los usuarios con información sobre habitaciones, reservas, pagos, cancelaciones, PQR, ubicaciones, políticas, servicios y cualquier duda relacionada.
- Sé conciso pero claro.
- Si no sabes la respuesta, sugiere contactar atención al cliente.
- Usa emojis ocasionalmente pero con moderación.
- El tono debe ser cordial, como un agente de atención al cliente.
- Habla en español.
"""


def buscar_respuesta_reglas(mensaje: str) -> Optional[str]:
    msg = mensaje.lower().strip()
    for item in FAQ_BASE:
        for kw in item["keywords"]:
            if kw in msg:
                return item["answer"]
    return None


def generar_respuesta_fallback(mensaje: str) -> str:
    regla = buscar_respuesta_reglas(mensaje)
    if regla:
        return regla
    return (
        "Gracias por tu mensaje. Entiendo tu consulta sobre: \"" + mensaje[:80] +
        "\". Puedo ayudarte con: 🏨 Habitaciones y disponibilidad, 📅 Reservas y cancelaciones, "
        "💳 Pagos y facturación, 📋 PQR (Peticiones, Quejas, Reclamos), "
        "📍 Información de contacto y ubicaciones.\n\n"
        "Si necesitas atención personalizada, por favor contacta a nuestro equipo al 📞 +57 300 123 4567 "
        "o al ✉ email contacto@roomstay.com. ¡Estaremos felices de ayudarte! 😊"
    )


def obtener_respuesta_ia(user_message: str, history: Optional[list] = None) -> tuple[str, int, str]:
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        return generar_respuesta_fallback(user_message), 0, "rules-engine"

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if history:
            for m in history[-6:]:
                if isinstance(m, dict) and "role" in m:
                    messages.append({"role": m["role"], "content": str(m.get("content", ""))[:500]})
        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL or "gpt-4o-mini",
            messages=messages,
            temperature=0.4,
            max_tokens=500,
        )
        reply = response.choices[0].message.content.strip()
        tokens = getattr(response, 'usage', None)
        tokens_total = getattr(tokens, 'total_tokens', 0) if tokens else 0
        return reply, tokens_total, settings.OPENAI_MODEL or "gpt-4o-mini"
    except ImportError:
        return generar_respuesta_fallback(user_message), 0, "rules-engine"
    except Exception as exc:
        fallback = generar_respuesta_fallback(user_message)
        return f"{fallback}\n\n_(Nota: Servicio IA temporalmente no disponible. Usando respuestas predefinidas.)_", 0, "rules-engine-error"


def get_or_create_conversation(db: Session, session_id: Optional[str], user: Optional[User]) -> Conversation:
    if session_id:
        conv = db.query(Conversation).filter(Conversation.sessionId == session_id).first()
        if conv:
            conv.updatedAt = datetime.now()
            db.commit()
            return conv

    new_sid = session_id or f"chat-{uuid.uuid4().hex[:16]}"
    conv = Conversation(
        sessionId=new_sid,
        userId=user.id if user else None,
        titulo="Nueva conversación",
        estado="activa"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@router.post("/send")
def chatbot_send(
    payload: ChatRequest,
    current_user: Optional[User] = Depends(optional_user),
    db: Session = Depends(get_db),
):
    user_message = payload.message.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Mensaje vacío")

    conv = get_or_create_conversation(db, payload.sessionId, current_user)

    if not conv.titulo or conv.titulo == "Nueva conversación":
        conv.titulo = user_message[:50]
        db.commit()

    history = []
    if payload.history:
        for m in payload.history:
            history.append({"role": m.role, "content": m.content})
    else:
        msgs = db.query(Message).filter(Message.conversationId == conv.id).order_by(Message.createdAt.asc()).all()
        for m in msgs:
            role = "assistant" if m.remitente == SenderType.bot else "user"
            history.append({"role": role, "content": m.contenido})

    reply, tokens, modelo = obtener_respuesta_ia(user_message, history)

    msg_user = Message(
        conversationId=conv.id, remitente=SenderType.usuario,
        contenido=user_message, tokensUsados=None, modelo=None, esError=False
    )
    db.add(msg_user)

    msg_bot = Message(
        conversationId=conv.id, remitente=SenderType.bot,
        contenido=reply, tokensUsados=tokens or None, modelo=modelo,
        esError=("error" in modelo) if modelo else False
    )
    db.add(msg_bot)

    conv.updatedAt = datetime.now()
    db.commit()

    return success_response(
        data=ChatResponse(
            reply=reply, sessionId=conv.sessionId,
            tokens=tokens, model=modelo
        ).model_dump(),
        message="Respuesta generada"
    )


@router.get("/conversations")
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Conversation)
    if current_user.role != "admin":
        query = query.filter(Conversation.userId == current_user.id)
    convs = query.order_by(Conversation.updatedAt.desc()).all()

    result = []
    for c in convs:
        last_msg = db.query(Message).filter(Message.conversationId == c.id).order_by(Message.createdAt.desc()).first()
        result.append({
            "id": c.id,
            "sessionId": c.sessionId,
            "titulo": c.titulo,
            "estado": c.estado,
            "userId": c.userId,
            "updatedAt": c.updatedAt.isoformat() if c.updatedAt else None,
            "createdAt": c.createdAt.isoformat() if c.createdAt else None,
            "ultimoMensaje": last_msg.contenido[:80] if last_msg else "",
        })

    return success_response(data={"conversaciones": result, "total": len(result)}, message="Conversaciones")


@router.get("/conversations/{session_id}")
def get_conversation_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(Conversation.sessionId == session_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    if current_user.role != "admin" and conv.userId and conv.userId != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    msgs = db.query(Message).filter(Message.conversationId == conv.id).order_by(Message.createdAt.asc()).all()

    messages = [
        {
            "id": m.id,
            "role": "assistant" if m.remitente == SenderType.bot else "user",
            "content": m.contenido,
            "timestamp": m.createdAt.isoformat() if m.createdAt else None,
            "model": m.modelo,
        }
        for m in msgs
    ]

    return success_response(
        data={"sessionId": session_id, "messages": messages, "titulo": conv.titulo},
        message="Historial obtenido"
    )
