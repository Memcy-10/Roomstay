import { useState } from 'react';
import { reportsService } from '../../services/stats.service.js';

const formatCOP = (v) => {
  if (v === null || v === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
};

const ESTADO_BADGE = {
  pendiente: 'bg-yellow-50 text-yellow-700',
  completada: 'bg-green-50 text-green-700',
  cancelada: 'bg-red-50 text-red-700',
  reembolsada: 'bg-purple-50 text-purple-700',
};

const EMPRESA_INFO = {
  nombre: 'RoomStay S.A.S.',
  nit: '901.234.567-8',
  direccion: 'Calle 123 #45-67, Bogotá, Colombia',
  telefono: '+57 601 123 4567',
  email: 'info@roomstay.com',
};

const AdminReports = () => {
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (id) => {
    setExpandedIds((cur) => ({ ...cur, [id]: !cur[id] }));
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const result = await reportsService.getDailySales(fecha);
      setReport(result.data || result);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await reportsService.downloadDailyPdf(fecha);
      alert('PDF descargado.');
    } catch (requestError) {
      alert('Error: ' + requestError.message);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await reportsService.downloadDailyExcel(fecha);
      alert('Excel descargado.');
    } catch (requestError) {
      alert('Error: ' + requestError.message);
    }
  };

  const ventas = report?.ventas || report?.data?.ventas || [];
  const totalVentas = report?.totalVentas ?? ventas.length ?? 0;
  const totalGeneral = report?.totalGeneral ?? ventas.reduce((sum, v) => sum + (Number(v.total) || 0), 0);

  return (
    <div className="container-app space-y-6 py-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Administración</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Reportes</h1>
        <p className="mt-2 text-neutral-600">Genera reportes diarios de ventas en PDF o Excel.</p>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <section className="card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 max-w-xs">
            <label className="label-field">Fecha del reporte</label>
            <input
              type="date"
              className="input-field"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={handleDownloadPdf} disabled={!report}>
              📄 Descargar PDF
            </button>
            <button type="button" className="btn-secondary" onClick={handleDownloadExcel} disabled={!report}>
              📊 Descargar Excel
            </button>
            <button type="button" className="btn-primary" onClick={generateReport} disabled={loading}>
              {loading ? 'Generando...' : '⚙️ Generar'}
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <div className="card p-8 text-center text-neutral-500">Generando reporte...</div>
      )}

      {!loading && report && (
        <>
          <section className="card p-6">
            <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">{EMPRESA_INFO.nombre}</h2>
                <p className="text-sm text-neutral-500">NIT: {EMPRESA_INFO.nit}</p>
                <p className="text-sm text-neutral-500">{EMPRESA_INFO.direccion}</p>
                <p className="text-sm text-neutral-500">{EMPRESA_INFO.telefono} · {EMPRESA_INFO.email}</p>
              </div>
              <div className="text-left md:text-right">
                <span className="badge bg-primary-50 text-primary-700 text-sm px-3 py-1">
                  Reporte Diario de Ventas
                </span>
                <p className="mt-2 font-semibold text-neutral-800">
                  Fecha: {fecha ? new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                </p>
                <p className="text-xs text-neutral-500">Generado: {new Date().toLocaleString('es-CO')}</p>
              </div>
            </div>

            <div className="grid gap-4 mt-5 md:grid-cols-2">
              <div className="card p-5 bg-primary-50/50 border-primary-100">
                <p className="text-sm text-neutral-500">Total Ventas</p>
                <p className="mt-1 text-3xl font-bold text-primary-700">{totalVentas}</p>
                <p className="text-xs mt-1 text-neutral-500">Transacciones en el día</p>
              </div>
              <div className="card p-5 bg-green-50/50 border-green-100">
                <p className="text-sm text-neutral-500">Total General</p>
                <p className="mt-1 text-3xl font-bold text-green-700">{formatCOP(totalGeneral)}</p>
                <p className="text-xs mt-1 text-neutral-500">Ingresos brutos del día</p>
              </div>
            </div>
          </section>

          <section className="card overflow-x-auto">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <h3 className="text-lg font-semibold text-neutral-900">Detalle de Ventas</h3>
            </div>
            {ventas.length === 0 ? (
              <p className="p-6 text-neutral-600">No hay ventas registradas en esta fecha.</p>
            ) : (
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    <th className="p-3 w-10"></th>
                    <th className="p-3">Número Venta</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Documento</th>
                    <th className="p-3">Método Pago</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-right">Descuento</th>
                    <th className="p-3 text-right">Impuestos</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {ventas.map((v) => (
                    <>
                      <tr key={v.id} className="hover:bg-neutral-50">
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => toggleExpand(v.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
                            aria-expanded={!!expandedIds[v.id]}
                          >
                            {expandedIds[v.id] ? '−' : '+'}
                          </button>
                        </td>
                        <td className="p-3 font-semibold">#{v.numeroVenta || v.id}</td>
                        <td className="p-3">
                          <div className="font-medium">{v.clienteNombre || `${v.userFirstName || ''} ${v.userLastName || ''}`.trim() || '-'}</div>
                          <div className="text-xs text-neutral-500">{v.clienteEmail || v.email || ''}</div>
                        </td>
                        <td className="p-3">{v.documento || v.documentNumber || v.clienteDocumento || '-'}</td>
                        <td className="p-3 capitalize">{v.metodoPago || '-'}</td>
                        <td className="p-3">
                          <span className={`badge capitalize ${ESTADO_BADGE[v.estado] || 'bg-neutral-100 text-neutral-600'}`}>
                            {v.estado || 'pendiente'}
                          </span>
                        </td>
                        <td className="p-3 text-right">{formatCOP(v.subtotal ?? v.total ?? 0)}</td>
                        <td className="p-3 text-right text-red-600">{formatCOP(v.descuento ?? 0)}</td>
                        <td className="p-3 text-right">{formatCOP(v.impuestos ?? 0)}</td>
                        <td className="p-3 text-right font-bold text-neutral-900">{formatCOP(v.total)}</td>
                      </tr>
                      {expandedIds[v.id] && (
                        <tr key={`detail-${v.id}`} className="bg-neutral-50/60">
                          <td colSpan={10} className="p-0">
                            <div className="p-4 pl-14 border-l-4 border-primary-200">
                              <h5 className="font-semibold text-sm mb-2 text-neutral-800">Ítems de la venta</h5>
                              <table className="w-full text-xs border border-neutral-200 rounded-lg overflow-hidden">
                                <thead className="bg-neutral-100 text-neutral-600">
                                  <tr>
                                    <th className="p-2 text-left">Descripción</th>
                                    <th className="p-2 text-right">Cantidad</th>
                                    <th className="p-2 text-right">Precio Unitario</th>
                                    <th className="p-2 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 bg-white">
                                  {(v.items || v.detalles || []).map((it, idx) => (
                                    <tr key={it.id || idx}>
                                      <td className="p-2">{it.descripcion || it.producto || it.habitacionTitulo || `Ítem ${idx + 1}`}</td>
                                      <td className="p-2 text-right">{it.cantidad || 1}</td>
                                      <td className="p-2 text-right">{formatCOP(it.precio || it.precioUnitario || 0)}</td>
                                      <td className="p-2 text-right font-medium">{formatCOP(it.subtotal || ((it.cantidad || 1) * (it.precio || it.precioUnitario || 0)))}</td>
                                    </tr>
                                  ))}
                                  {(v.items || v.detalles || []).length === 0 && (
                                    <tr><td colSpan={4} className="p-3 text-center text-neutral-500">Sin ítems registrados</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
                <tfoot className="bg-neutral-50 font-semibold">
                  <tr>
                    <td colSpan={6} className="p-3 text-right">Totales:</td>
                    <td className="p-3 text-right">{formatCOP(ventas.reduce((s, v) => s + (Number(v.subtotal ?? v.total ?? 0)), 0))}</td>
                    <td className="p-3 text-right text-red-600">{formatCOP(ventas.reduce((s, v) => s + (Number(v.descuento ?? 0)), 0))}</td>
                    <td className="p-3 text-right">{formatCOP(ventas.reduce((s, v) => s + (Number(v.impuestos ?? 0)), 0))}</td>
                    <td className="p-3 text-right text-lg text-green-700">{formatCOP(totalGeneral)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminReports;
