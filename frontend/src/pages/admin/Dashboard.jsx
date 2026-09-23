import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { statsService, reportsService } from '../../services/stats.service.js';

const COLORS = ['#0F766E', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'];

const formatCOP = (v) => {
  if (v === null || v === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
};

const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({ fechaInicio: '', fechaFin: '', servicio: '', estado: '', cliente: '' });

  useEffect(() => {
    Promise.allSettled([statsService.getKpiCards(filters), statsService.getOverview(filters)])
      .then(([kpiRes, ovRes]) => {
        if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value?.data || {});
        if (ovRes.status === 'fulfilled') setOverview(ovRes.value?.data || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const cards = [
    ['Usuarios', kpis?.usuarios ?? 0, '/admin/users', 'text-primary-600', 'bg-primary-50'],
    ['Habitaciones', kpis?.habitaciones ?? 0, '/admin/rooms', 'text-secondary-600', 'bg-secondary-50'],
    ['Reservaciones', kpis?.reservaciones ?? 0, '/admin/reservations', 'text-blue-600', 'bg-blue-50'],
    ['Ventas', kpis?.ventas ?? 0, '/admin/sales', 'text-green-600', 'bg-green-50'],
    ['Facturación', formatCOP(kpis?.facturacion ?? 0), '/admin/invoices', 'text-amber-600', 'bg-amber-50'],
    ['PQR Pendientes', kpis?.pqrPendientes ?? 0, '/admin/pqr', 'text-red-600', 'bg-red-50'],
  ];

  const ventasDiario = overview?.ventasPorPeriodo?.diario || [];
  const ventasMensual = overview?.ventasPorPeriodo?.mensual || [];
  const reservasEstado = overview?.reservasPorEstado || [];
  const pqrTipo = overview?.pqrPorTipo || [];
  const habitacionesTop = overview?.habitacionesTop || [];

  return (
    <div className="container-app space-y-8 py-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Administración</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Panel de control</h1>
        <p className="mt-2 text-neutral-600">Visualiza KPIs, analiza ventas y supervisa la operación general de RoomStay.</p>
      </header>

      <section>
        <div className="card p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros del dashboard</h2>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {[
              ['fechaInicio', 'Fecha inicial', 'date'],
              ['fechaFin', 'Fecha final', 'date'],
              ['servicio', 'Servicio', 'text'],
              ['estado', 'Estado', 'text'],
              ['cliente', 'Cliente', 'text'],
            ].map(([key, label, type]) => (
              <label key={key} className="text-sm font-medium">
                {label}
                <input type={type} className="input-field mt-1" value={filters[key]} onChange={(e) => setFilters((current) => ({ ...current, [key]: e.target.value }))} />
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Indicadores clave</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {cards.map(([label, value, to, color, bg]) => (
            <Link key={label} to={to} className={`card p-5 transition-shadow hover:shadow-card-hover ${bg}`}>
              <p className="text-sm text-neutral-500">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>{loading ? '...' : value}</p>
              <p className="mt-3 text-sm font-semibold text-neutral-700">Ver detalle →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Ventas diarias (último periodo)</h3>
            <span className="badge bg-teal-50 text-teal-700">Gráfico de Barras</span>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-neutral-500">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ventasDiario}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(value) => formatCOP(value)}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="value" name="Ventas COP" fill="#0F766E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Tendencia mensual de ventas</h3>
            <span className="badge bg-sky-50 text-sky-700">Gráfico Lineal</span>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-neutral-500">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={ventasMensual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(value) => formatCOP(value)}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line type="monotone" dataKey="value" name="Ventas COP" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 5, fill: '#0EA5E9' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Reservas por estado</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-neutral-500">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={reservasEstado} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}>
                  {reservasEstado.map((_, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">PQR por tipo</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-neutral-500">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pqrTipo} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="label" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Cantidad" fill="#F59E0B" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900">Top habitaciones</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-neutral-500">Cargando...</div>
          ) : habitacionesTop.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-neutral-500">Sin datos aún. Registra ventas para ver el ranking.</div>
          ) : (
            <div className="space-y-3">
              {habitacionesTop.map((h, idx) => (
                <div key={h.id || idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold text-white ${['bg-teal-600','bg-sky-600','bg-amber-600','bg-violet-600','bg-red-600'][idx] || 'bg-neutral-500'}`}>{idx + 1}</span>
                    <span className="text-sm font-medium text-neutral-800 truncate">{h.label}</span>
                  </div>
                  <span className="badge bg-primary-50 text-primary-700 font-semibold shrink-0">{h.value} reservas</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Reporte diario de ventas</h3>
            <p className="text-sm text-neutral-500 mt-1">Genera y descarga el reporte de ventas en PDF y Excel.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input type="date" className="input-field w-auto" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            <button type="button" className="btn-secondary" onClick={() => reportsService.downloadDailyPdf(fecha)}>
              📄 Descargar PDF
            </button>
            <button type="button" className="btn-primary" onClick={() => reportsService.downloadDailyExcel(fecha)}>
              📊 Descargar Excel
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/admin/reports" className="btn-outline">Ir a Reportes</Link>
          <Link to="/admin/sales" className="btn-outline">Ver Historial de Ventas</Link>
          <Link to="/admin/pqr" className="btn-outline">Gestionar PQR</Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
