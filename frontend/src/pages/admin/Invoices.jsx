import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal.jsx';
import { invoicesService } from '../../services/invoices.service.js';
import { salesService } from '../../services/sales.service.js';

const formatCOP = (v) => {
  if (v === null || v === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
};

const ESTADO_BADGE_FACTURA = {
  pendiente: 'bg-yellow-50 text-yellow-700',
  pagada: 'bg-green-50 text-green-700',
  vencida: 'bg-red-50 text-red-700',
  anulada: 'bg-gray-100 text-gray-700',
};

const ESTADOS_FACTURA = ['pendiente', 'pagada', 'vencida', 'anulada'];

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    numero: '',
    buscar: '',
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusInvoice, setStatusInvoice] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    ventaId: '',
    notas: '',
  });

  const loadInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.fechaInicio) params.fechaInicio = filters.fechaInicio;
      if (filters.fechaFin) params.fechaFin = filters.fechaFin;
      if (filters.estado) params.estado = filters.estado;
      const result = await invoicesService.getInvoices(params);
      const list = result.data?.facturas || result.data || [];
      const term = filters.buscar.toLowerCase().trim();
      setInvoices(term
        ? list.filter((inv) => `${inv.numeroFactura || ''} ${inv.numeroVenta || ''} ${inv.userFirstName || ''} ${inv.userLastName || ''} ${inv.userEmail || ''} ${inv.estado || ''}`.toLowerCase().includes(term))
        : list);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudieron cargar las facturas.');
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    try {
      const result = await salesService.getSales({});
      setSales(result.data?.ventas || result.data || []);
    } catch (_) {}
  };

  useEffect(() => {
    loadInvoices();
    loadSales();
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [filters.fechaInicio, filters.fechaFin, filters.estado, filters.buscar]);

  const handleViewDetail = async (invoice) => {
    try {
      const result = await invoicesService.getInvoiceById(invoice.id);
      setInvoiceDetail(result.data || result);
      setDetailOpen(true);
    } catch (requestError) {
      alert('Error al cargar detalle: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  const handleChangeStatus = (invoice) => {
    setStatusInvoice(invoice);
    setNewStatus(invoice.estado || '');
    setStatusOpen(true);
  };

  const submitStatusChange = async () => {
    if (!statusInvoice || !newStatus) return;
    try {
      await invoicesService.updateStatus(statusInvoice.id, newStatus);
      setInvoices((current) => current.map((i) => i.id === statusInvoice.id ? { ...i, estado: newStatus } : i));
      alert('Estado actualizado correctamente.');
      setStatusOpen(false);
      setStatusInvoice(null);
    } catch (requestError) {
      alert('Error: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      await invoicesService.downloadInvoicePdf(id);
      alert('Factura descargada.');
    } catch (requestError) {
      alert('Error al descargar: ' + requestError.message);
    }
  };

  const submitCreateInvoice = async () => {
    if (!createForm.ventaId) {
      alert('Selecciona o ingresa una venta.');
      return;
    }
    try {
      await invoicesService.createInvoice({
        ventaId: createForm.ventaId,
        notas: createForm.notas,
      });
      alert('Factura generada correctamente.');
      setCreateOpen(false);
      setCreateForm({ ventaId: '', notas: '' });
      loadInvoices();
    } catch (requestError) {
      alert('Error: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  return (
    <div className="container-app space-y-6 py-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Administración</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">Facturas</h1>
          <p className="mt-2 text-neutral-600">Gestión de facturas, filtros, descargas y generación manual.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setCreateOpen(true)}>
          📄 Nueva Factura
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
              {ESTADOS_FACTURA.map((e) => <option key={e} value={e} className="capitalize">{e}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Número de factura</label>
            <input
              type="text"
              className="input-field"
              placeholder="Factura, venta, cliente o correo..."
              value={filters.buscar}
              onChange={(e) => setFilters((f) => ({ ...f, buscar: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className="card overflow-x-auto">
        {loading ? (
          <div className="p-6 text-neutral-500">Cargando facturas...</div>
        ) : (
          <>
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="p-4">Número Factura</th>
                  <th className="p-4">Fecha Emisión</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Número Venta</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-4 font-semibold">#{inv.numeroFactura || inv.id}</td>
                    <td className="p-4">{inv.fechaEmision || inv.createdAt?.split('T')[0] || '-'}</td>
                    <td className="p-4">
                      <div className="font-medium">{inv.clienteNombre || `${inv.userFirstName || ''} ${inv.userLastName || ''}`.trim() || '-'}</div>
                      <div className="text-xs text-neutral-500">{inv.clienteEmail || inv.email || '-'}</div>
                    </td>
                    <td className="p-4">#{inv.numeroVenta || inv.ventaId || '-'}</td>
                    <td className="p-4">
                      <span className={`badge capitalize ${ESTADO_BADGE_FACTURA[inv.estado] || 'bg-neutral-100 text-neutral-600'}`}>
                        {inv.estado || 'pendiente'}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-neutral-900">{formatCOP(inv.total)}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => handleViewDetail(inv)}>
                          Ver detalle
                        </button>
                        <button type="button" className="btn-secondary !py-1.5 !px-3 text-xs" onClick={() => handleChangeStatus(inv)}>
                          Cambiar estado
                        </button>
                        <button type="button" className="btn-primary !py-1.5 !px-3 text-xs" onClick={() => handleDownloadPdf(inv.id)}>
                          Descargar PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && <p className="p-6 text-neutral-600">No hay facturas registradas.</p>}
          </>
        )}
      </section>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle de Factura" size="lg">
        {invoiceDetail ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div><span className="text-sm text-neutral-500">Número Factura:</span> <p className="font-semibold">#{invoiceDetail.numeroFactura || invoiceDetail.id}</p></div>
              <div><span className="text-sm text-neutral-500">Fecha Emisión:</span> <p className="font-semibold">{invoiceDetail.fechaEmision || invoiceDetail.createdAt?.split('T')[0]}</p></div>
              <div><span className="text-sm text-neutral-500">Cliente:</span> <p className="font-semibold">{invoiceDetail.clienteNombre || `${invoiceDetail.userFirstName || ''} ${invoiceDetail.userLastName || ''}`.trim()}</p></div>
              <div><span className="text-sm text-neutral-500">Venta asociada:</span> <p className="font-semibold">#{invoiceDetail.numeroVenta || invoiceDetail.ventaId || '-'}</p></div>
              <div><span className="text-sm text-neutral-500">Estado:</span> <p><span className={`badge capitalize ${ESTADO_BADGE_FACTURA[invoiceDetail.estado] || ''}`}>{invoiceDetail.estado || 'pendiente'}</span></p></div>
              {invoiceDetail.notas && (
                <div className="md:col-span-2"><span className="text-sm text-neutral-500">Notas:</span> <p className="font-medium">{invoiceDetail.notas}</p></div>
              )}
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
                  {(invoiceDetail.items || invoiceDetail.detalles || []).map((it, idx) => (
                    <tr key={it.id || idx}>
                      <td className="p-2">{it.descripcion || it.producto || `Ítem ${idx + 1}`}</td>
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
                <p className="text-sm text-neutral-500">Total Factura</p>
                <p className="text-2xl font-bold text-neutral-900">{formatCOP(invoiceDetail.total)}</p>
              </div>
            </div>
          </div>
        ) : <p className="text-neutral-500">Cargando...</p>}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <button type="button" className="btn-secondary" onClick={() => setDetailOpen(false)}>Cerrar</button>
          {invoiceDetail && (
            <button type="button" className="btn-primary" onClick={() => handleDownloadPdf(invoiceDetail.id)}>Descargar PDF</button>
          )}
        </div>
      </Modal>

      <Modal isOpen={statusOpen} onClose={() => { setStatusOpen(false); setStatusInvoice(null); }} title="Cambiar Estado de Factura">
        <div className="space-y-4">
          {statusInvoice && (
            <div>
              <p className="text-sm text-neutral-500">Factura seleccionada</p>
              <p className="font-semibold">#{statusInvoice.numeroFactura || statusInvoice.id} - {formatCOP(statusInvoice.total)}</p>
            </div>
          )}
          <div>
            <label className="label-field">Nuevo estado</label>
            <select className="select-field" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {ESTADOS_FACTURA.map((e) => <option key={e} value={e} className="capitalize">{e}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <button type="button" className="btn-secondary" onClick={() => { setStatusOpen(false); setStatusInvoice(null); }}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={submitStatusChange}>Guardar</button>
        </div>
      </Modal>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Generar Nueva Factura">
        <div className="space-y-4">
          <div>
            <label className="label-field">Seleccionar venta</label>
            <select
              className="select-field"
              value={createForm.ventaId}
              onChange={(e) => setCreateForm((f) => ({ ...f, ventaId: e.target.value }))}
            >
              <option value="">-- Selecciona una venta --</option>
              {sales.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.numeroVenta || s.id} - {s.clienteNombre || `${s.userFirstName || ''} ${s.userLastName || ''}`.trim()} - {formatCOP(s.total)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">O ingresa ID de venta manualmente</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: 5"
              value={createForm.ventaId}
              onChange={(e) => setCreateForm((f) => ({ ...f, ventaId: e.target.value }))}
            />
          </div>
          <div>
            <label className="label-field">Notas</label>
            <textarea
              className="input-field min-h-[100px]"
              placeholder="Observaciones, condiciones, etc."
              value={createForm.notas}
              onChange={(e) => setCreateForm((f) => ({ ...f, notas: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={submitCreateInvoice}>Generar Factura</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminInvoices;
