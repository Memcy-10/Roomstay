import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal.jsx';
import { salesService } from '../../services/sales.service.js';

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

const ESTADOS_VENTA = ['pendiente', 'completada', 'cancelada', 'reembolsada'];

const HostSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    numeroVenta: '',
    cliente: '',
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [saleDetail, setSaleDetail] = useState(null);

  const loadSales = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { hostOnly: true };
      if (filters.fechaInicio) params.fechaInicio = filters.fechaInicio;
      if (filters.fechaFin) params.fechaFin = filters.fechaFin;
      if (filters.estado) params.estado = filters.estado;
      if (filters.numeroVenta) params.numeroVenta = filters.numeroVenta;
      const result = await salesService.getSales(params);
      const list = result.data?.ventas || result.data || [];
      const numberTerm = filters.numeroVenta.toLowerCase();
      const clientTerm = filters.cliente.toLowerCase();
      setSales(numberTerm || clientTerm
        ? list.filter((s) => {
          const value = `${s.numeroVenta || s.id} ${s.userFirstName || ''} ${s.userLastName || ''} ${s.userEmail || ''}`.toLowerCase();
          return (!numberTerm || value.includes(numberTerm)) && (!clientTerm || value.includes(clientTerm));
        })
        : list
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudieron cargar las ventas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [filters.fechaInicio, filters.fechaFin, filters.estado, filters.numeroVenta, filters.cliente]);

  const handleViewDetail = async (sale) => {
    try {
      const result = await salesService.getSaleById(sale.id);
      setSaleDetail(result.data || result);
      setDetailOpen(true);
    } catch (requestError) {
      alert('Error al cargar el detalle: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  return (
    <div className="container-app space-y-6 py-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Hospedador</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Mis Ventas</h1>
        <p className="mt-2 text-neutral-600">Historial de ventas de tus alojamientos.</p>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <section className="card p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Filtros</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label-field">Fecha inicio</label>
            <input
              type="date"
              className="input-field"
              value={filters.fechaInicio}
              onChange={(e) => setFilters((f) => ({ ...f, fechaInicio: e.target.value }))}
            />
          </div>
          <div>
            <label className="label-field">Buscar cliente</label>
            <input type="text" className="input-field" placeholder="Nombre o correo..." value={filters.cliente} onChange={(e) => setFilters((f) => ({ ...f, cliente: e.target.value }))} />
          </div>
          <div>
            <label className="label-field">Fecha fin</label>
            <input
              type="date"
              className="input-field"
              value={filters.fechaFin}
              onChange={(e) => setFilters((f) => ({ ...f, fechaFin: e.target.value }))}
            />
          </div>
          <div>
            <label className="label-field">Estado</label>
            <select
              className="select-field"
              value={filters.estado}
              onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value }))}
            >
              <option value="">Todos</option>
              {ESTADOS_VENTA.map((e) => <option key={e} value={e} className="capitalize">{e}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Buscar número de venta</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: 123"
              value={filters.numeroVenta}
              onChange={(e) => setFilters((f) => ({ ...f, numeroVenta: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className="card overflow-x-auto">
        {loading ? (
          <div className="p-6 text-neutral-500">Cargando ventas...</div>
        ) : sales.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-neutral-700 font-medium">No hay ventas registradas.</p>
            <p className="mt-1 text-sm text-neutral-500">Ajusta los filtros o espera nuevas transacciones.</p>
          </div>
        ) : (
          <>
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="p-4">Número Venta</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Método Pago</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="p-4 font-semibold">#{s.numeroVenta || s.id}</td>
                    <td className="p-4">{s.fechaVenta || s.createdAt?.split('T')[0] || '-'}</td>
                    <td className="p-4">
                      <div className="font-medium">{s.clienteNombre || `${s.userFirstName || ''} ${s.userLastName || ''}`.trim() || '-'}</div>
                      <div className="text-xs text-neutral-500">{s.clienteEmail || s.email || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`badge capitalize ${ESTADO_BADGE[s.estado] || 'bg-neutral-100 text-neutral-600'}`}>
                        {s.estado || 'pendiente'}
                      </span>
                    </td>
                    <td className="p-4 capitalize">{s.metodoPago || '-'}</td>
                    <td className="p-4 font-semibold text-neutral-900">{formatCOP(s.total)}</td>
                    <td className="p-4">
                      <button type="button" className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => handleViewDetail(s)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle de Venta" size="lg">
        {saleDetail ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div><span className="text-sm text-neutral-500">Número:</span> <p className="font-semibold">#{saleDetail.numeroVenta || saleDetail.id}</p></div>
              <div><span className="text-sm text-neutral-500">Fecha:</span> <p className="font-semibold">{saleDetail.fechaVenta || saleDetail.createdAt?.split('T')[0]}</p></div>
              <div><span className="text-sm text-neutral-500">Cliente:</span> <p className="font-semibold">{saleDetail.clienteNombre || `${saleDetail.userFirstName || ''} ${saleDetail.userLastName || ''}`.trim()}</p></div>
              <div><span className="text-sm text-neutral-500">Método Pago:</span> <p className="font-semibold capitalize">{saleDetail.metodoPago}</p></div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-neutral-900">Ítems</h4>
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    <th className="p-2">Descripción</th>
                    <th className="p-2 text-right">Cantidad</th>
                    <th className="p-2 text-right">Precio Unitario</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(saleDetail.details || saleDetail.items || saleDetail.detalles || []).map((it, idx) => {
                    const cantidad = it.cantidad || 1;
                    const precio = it.precio || it.precioUnitario || 0;
                    const subtotal = it.subtotal || (cantidad * precio);
                    return (
                      <tr key={it.id || idx}>
                        <td className="p-2">{it.descripcion || it.producto || it.habitacionTitulo || `Ítem ${idx + 1}`}</td>
                        <td className="p-2 text-right">{cantidad}</td>
                        <td className="p-2 text-right">{formatCOP(precio)}</td>
                        <td className="p-2 text-right font-medium">{formatCOP(subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end border-t pt-3">
              <div className="text-right">
                <p className="text-sm text-neutral-500">Total Venta</p>
                <p className="text-2xl font-bold text-neutral-900">{formatCOP(saleDetail.total)}</p>
              </div>
            </div>
          </div>
        ) : <p className="text-neutral-500">Cargando...</p>}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <button type="button" className="btn-secondary" onClick={() => setDetailOpen(false)}>Cerrar</button>
        </div>
      </Modal>
    </div>
  );
};

export default HostSales;
