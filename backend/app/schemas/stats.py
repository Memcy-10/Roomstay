from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class KPIData(BaseModel):
    totalUsuarios: int = 0
    totalHabitaciones: int = 0
    totalReservaciones: int = 0
    totalVentas: int = 0
    totalFacturacion: float = 0
    totalPQR: int = 0
    pqrPendientes: int = 0
    pqrEnProceso: int = 0
    ventasMes: float = 0
    reservasMes: int = 0
    usuariosNuevosMes: int = 0


class ChartDataPoint(BaseModel):
    label: str
    value: float


class SalesChartData(BaseModel):
    diario: List[ChartDataPoint] = []
    semanal: List[ChartDataPoint] = []
    mensual: List[ChartDataPoint] = []


class StatsOut(BaseModel):
    kpis: KPIData
    ventasPorPeriodo: Dict[str, List[Dict[str, Any]]]
    reservasPorEstado: List[Dict[str, Any]]
    pqrPorTipo: List[Dict[str, Any]]
    habitacionesTop: List[Dict[str, Any]]
    ventasMetodoPago: List[Dict[str, Any]]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    reply: str
    sessionId: str
    tokens: Optional[int] = None
    model: Optional[str] = None
