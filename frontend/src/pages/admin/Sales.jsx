import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal.jsx';
import { salesService } from '../../services/sales.service.js';
import { invoicesService } from '../../services/invoices.service.js';
import { adminService } from '../../services/admin.service.js';

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

const METODO_PAGO = ['transferencia', 'tarjeta', 'nequi', 'daviplata', 'efectivo'];
const ESTADOS_VENTA = ['pendiente', 'completada', 'cancelada', 'reembolsada'];

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservations, setReservations] = useState([]);

  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    clienteId: '',
  });

  const [searchCliente, setSearchCliente] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [saleDetail, setSaleDetail] = useState(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusSale, setStatusSale] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    reservationId: '',
    metodoPago: 'transferencia',
  });

  const loadSales = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.fechaInicio) params.fechaInicio = filters.fechaInicio;
      if (filters.fechaFin) params.fechaFin = filters.fechaFin;
      if (filters.estado) params.estado = filters.estado;
      if (filters.clienteId) params.clienteId = filters.clienteId;
      const result = await salesService.getSales(params);
      setSales(result.data?.ventas || result.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudieron cargar las ventas.');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const result = await adminService.getAllReservations();
      setReservations(result.data?.reservaciones || []);
    } catch (_) {}
  };

  useEffect(() => {
    loadSales();
    loadReservations();
    invoicesService.getInvoices().then((result) => setInvoices(result.data?.facturas || result.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchTimer) clearTimeout(searchTimer);
    if (searchCliente.length >= 3) {
      const t = setTimeout(() => {
        setFilters((f) => ({ ...f, clienteId: searchCliente }));
      }, 400);
      setSearchTimer(t);
    } else if (searchCliente.length === 0) {
      setFilters((f) => ({ ...f, clienteId: '' }));
    }
    return () => {
      if (searchTimer) clearTimeout(searchTimer);
    };
  }, [searchCliente]);

  useEffect(() => {
    loadSales();
  }, [filters.fechaInicio, filters.fechaFin, filters.estado, filters.clienteId]);

  const handleViewDetail = async (sale) => {
    try {
      const result = await salesService.getSaleById(sale.id);
      setSaleDetail(result.data || result);
      setDetailOpen(true);
    } catch (requestError) {
      alert('Error al cargar el detalle: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  const handleChangeStatus = (sale) => {
    setStatusSale(sale);
    setNewStatus(sale.estado || '');
    setStatusOpen(true);
  };

  const submitStatusChange = async () => {
    if (!statusSale || !newStatus) return;
    try {
      await salesService.updateStatus(statusSale.id, newStatus);
      setSales((current) => current.map((s) => s.id === statusSale.id ? { ...s, estado: newStatus } : s));
      alert('Estado actualizado correctamente.');
      setStatusOpen(false);
      setStatusSale(null);
    } catch (requestError) {
      alert('Error: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  const handleCreateInvoice = async (sale) => {
    try {
      const result = await invoicesService.createInvoice({ ventaId: sale.id, notas: 'Factura generada desde venta.' });
      setInvoices((current) => [...current, result.data || result]);
      alert('Factura creada correctamente.');
    } catch (requestError) {
      alert('Error al crear factura: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  const submitSaleFromReservation = async () => {
    if (!reservationForm.reservationId) {
      alert('Selecciona o ingresa una reservación.');
      return;
    }
    try {
      await salesService.createSaleFromReservation(reservationForm.reservationId, reservationForm.metodoPago);
      alert('Venta generada correctamente desde la reservación.');
      setReservationModalOpen(false);
      setReservationForm({ reservationId: '', metodoPago: 'transferencia' });
      loadSales();
    } catch (requestError) {
      alert('Error: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  return (
    <div className="container-app space-y-6 py-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Administración</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">Ventas</h1>
          <p className="mt-2 text-neutral-600">Historial de ventas, filtros, estados y generación desde reservaciones.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setReservationModalOpen(true)}>
          💰 Generar Venta desde Reserva
        </button>
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
            <label className="label-field">Buscar cliente (ID/Nombre)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Escribe al menos 3 caracteres..."
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card overflow-x-auto">
        {loading ? (
          <div className="p-6 text-neutral-500">Cargando ventas...</div>
        ) : (
          <>
            <table className="w-full min-w-[1000px] text-left text-sm">
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
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => handleViewDetail(s)}>
                          Ver detalle
                        </button>
                        <button type="button" className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => handleCreateInvoice(s)} disabled={invoices.some((invoice) => invoice.saleId === s.id)}>
                          {invoices.some((invoice) => invoice.saleId === s.id) ? 'Ya facturada' : 'Crear factura'}
                        </button>
                        <button type="button" className="btn-primary !py-1.5 !px-3 text-xs" onClick={() => handleChangeStatus(s)}>
                          Cambiar estado
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sales.length === 0 && <p className="p-6 text-neutral-600">No hay ventas registradas.</p>}
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
                    <th className="p-2 text-right">Precio</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(saleDetail.details || saleDetail.items || saleDetail.detalles || []).map((it, idx) => (
                    <tr key={it.id || idx}>
                      <td className="p-2">{it.descripcion || it.producto || it.habitacionTitulo || `Ítem ${idx + 1}`}</td>
                      <td className="p-2 text-right">{it.cantidad || 1}</td>
                      <td className="p-2 text-right">{formatCOP(it.precio || it.precioUnitario || 0)}</td>
                      <td className="p-2 text-right font-medium">{formatCOP(it.subtotal || ((it.cantidad || 1) * (it.precio || it.precioUnitario || 0)))}</td>
                    </tr>
                  ))}
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

      <Modal isOpen={statusOpen} onClose={() => { setStatusOpen(false); setStatusSale(null); }} title="Cambiar Estado de Venta">
        <div className="space-y-4">
          {statusSale && (
            <div>
              <p className="text-sm text-neutral-500">Venta seleccionada</p>
              <p className="font-semibold">#{statusSale.numeroVenta || statusSale.id} - {formatCOP(statusSale.total)}</p>
            </div>
          )}
          <div>
            <label className="label-field">Nuevo estado</label>
            <select className="select-field" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {ESTADOS_VENTA.map((e) => <option key={e} value={e} className="capitalize">{e}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <button type="button" className="btn-secondary" onClick={() => { setStatusOpen(false); setStatusSale(null); }}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={submitStatusChange}>Guardar</button>
        </div>
      </Modal>

      <Modal isOpen={reservationModalOpen} onClose={() => setReservationModalOpen(false)} title="Generar Venta desde Reserva">
        <div className="space-y-4">
          <div>
            <label className="label-field">Seleccionar reservación</label>
            <select
              className="select-field"
              value={reservationForm.reservationId}
              onChange={(e) => setReservationForm((f) => ({ ...f, reservationId: e.target.value }))}
            >
              <option value="">-- Selecciona una reservación --</option>
              {reservations.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} - {r.userFirstName || ''} {r.userLastName || ''} - {r.habitacionTitulo || `Hab. ${r.habitacionId || ''}`} ({r.fechaIngreso} a {r.fechaSalida})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">O ingresa ID de reservación manualmente</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: 12"
              value={reservationForm.reservationId}
              onChange={(e) => setReservationForm((f) => ({ ...f, reservationId: e.target.value }))}
            />
          </div>
          <div>
            <label className="label-field">Método de Pago</label>
            <select
              className="select-field"
              value={reservationForm.metodoPago}
              onChange={(e) => setReservationForm((f) => ({ ...f, metodoPago: e.target.value }))}
            >
              {METODO_PAGO.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <button type="button" className="btn-secondary" onClick={() => setReservationModalOpen(false)}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={submitSaleFromReservation}>Generar Venta</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSales;
