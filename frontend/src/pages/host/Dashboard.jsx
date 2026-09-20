import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { roomsService } from '../../services/rooms.service.js';
import { reservationsService } from '../../services/reservations.service.js';
import { salesService } from '../../services/sales.service.js';
import { statsService } from '../../services/stats.service.js';
import { useAuth } from '../../hooks/useAuth.js';

const formatCOP = (v) => {
  if (v === null || v === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getEstadoBadgeClass = (estado) => {
  const map = {
    confirmada: 'bg-green-50 text-green-700',
    confirmado: 'bg-green-50 text-green-700',
    completada: 'bg-green-50 text-green-700',
    pagada: 'bg-green-50 text-green-700',
    pendiente: 'bg-yellow-50 text-yellow-700',
    en_proceso: 'bg-blue-50 text-blue-700',
    aprobada: 'bg-blue-50 text-blue-700',
    cancelada: 'bg-red-50 text-red-700',
    rechazada: 'bg-red-50 text-red-700',
  };
  return map[estado?.toLowerCase()] || 'bg-neutral-50 text-neutral-700';
};

const HostDashboard = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [sales, setSales] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.allSettled([
      roomsService.getMyRooms(),
      reservationsService.getHostReservations(),
      salesService.getSales(),
      statsService.getKpiCards(),
    ])
      .then(([roomsResult, reservationsResult, salesResult, kpisResult]) => {
        setRooms(roomsResult.status === 'fulfilled' ? roomsResult.value.data?.habitaciones || roomsResult.value.data || [] : []);
        setReservations(reservationsResult.status === 'fulfilled' ? reservationsResult.value.data?.reservaciones || reservationsResult.value.data || [] : []);
        setSales(salesResult.status === 'fulfilled' ? salesResult.value.data?.ventas || salesResult.value.data || [] : []);
        setKpis(kpisResult.status === 'fulfilled' ? kpisResult.value.data || {} : null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRooms = kpis?.habitaciones ?? kpis?.totalHabitaciones ?? rooms.length;
  const totalReservations = kpis?.reservaciones ?? kpis?.totalReservaciones ?? reservations.length;
  const totalSales = kpis?.ventas ?? kpis?.totalVentas ?? sales.length;
  const totalIncome = kpis?.facturacion ?? kpis?.ingresosTotales ?? kpis?.totalIngresos ?? sales.reduce((s, sale) => s + (Number(sale.total) || 0), 0);
  const firstName = user?.firstName || user?.name || 'hospedador';
  const lastReservations = [...reservations].sort((a, b) => new Date(b.createdAt || b.fechaCreacion || 0) - new Date(a.createdAt || a.fechaCreacion || 0)).slice(0, 5);

  const kpiCards = [
    {
      label: 'Habitaciones',
      value: loading ? '...' : totalRooms,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      bg: 'bg-gradient-to-br from-primary-50 to-primary-100',
      text: 'text-primary-600',
      border: 'border-primary-200',
    },
    {
      label: 'Reservaciones',
      value: loading ? '...' : totalReservations,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    {
      label: 'Ventas completadas',
      value: loading ? '...' : totalSales,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
    },
    {
      label: 'Ingresos totales',
      value: loading ? '...' : formatCOP(totalIncome),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      text: 'text-amber-600',
      border: 'border-amber-200',
    },
  ];

  return (
    <div className="container-app space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Panel de hospedador</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Hola, {firstName}</h1>
        <p className="mt-2 text-neutral-600">Administra tus publicaciones, supervisa las reservas y revisa tus ingresos.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
      )}

      <section>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Indicadores clave</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className={`card p-5 border ${card.border} ${card.bg}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">{card.label}</p>
                  <p className={`mt-2 text-2xl md:text-3xl font-bold ${card.text} break-all`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-white/70 shadow-sm ${card.text}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Últimas reservas</h2>
              <p className="text-sm text-neutral-500 mt-1">Las reservaciones más recientes recibidas en tus alojamientos.</p>
            </div>
            <Link to="/host/reservations" className="btn-ghost text-sm">
              Ver todas →
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-neutral-500">Cargando reservas...</div>
          ) : lastReservations.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-neutral-700 font-medium">Aún no has recibido reservas.</p>
              <p className="mt-1 text-sm text-neutral-500">Publica tus alojamientos para empezar a recibir huéspedes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lastReservations.map((res) => (
                <div
                  key={res.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {res.habitacionTitulo || res.roomTitle || (res.habitacionId ? `Habitación #${res.habitacionId}` : `Reserva #${res.id}`)}
                      </h3>
                      <span className={`badge capitalize ${getEstadoBadgeClass(res.estado)}`}>
                        {res.estado || 'pendiente'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(res.fechaIngreso)} → {formatDate(res.fechaSalida)}
                      </span>
                      {res.huespedes && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {res.huespedes} huéspedes
                        </span>
                      )}
                      <span className="text-xs text-neutral-500">
                        Creada: {formatDate(res.createdAt || res.fechaCreacion)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-neutral-500">Valor reserva</p>
                    <p className="text-lg font-bold text-primary-600 font-mono">
                      {formatCOP(Number(res.total) || Number(res.valorTotal) || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">Acciones rápidas</h2>
          <p className="text-sm text-neutral-500 mb-5">Atajos para gestionar tu operación diaria.</p>
          <div className="space-y-3">
            <Link to="/host/rooms" className="w-full btn-primary justify-center">
              Mis hospedajes
            </Link>
            <Link to="/host/rooms/new" className="w-full btn-secondary justify-center">
              Publicar nuevo hospedaje
            </Link>
            <Link to="/host/reservations" className="w-full btn-outline justify-center">
              Ver reservas recibidas
            </Link>
          </div>

          {rooms.length > 0 && (
            <div className="mt-6 pt-5 border-t border-neutral-200">
              <p className="text-sm font-semibold text-neutral-700 mb-3">Resumen de habitaciones</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Total publicadas</span>
                  <span className="font-semibold text-neutral-900">{rooms.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Disponibles</span>
                  <span className="font-semibold text-green-600">
                    {rooms.filter((r) => r.disponible !== false).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">No disponibles</span>
                  <span className="font-semibold text-neutral-500">
                    {rooms.filter((r) => r.disponible === false).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HostDashboard;
