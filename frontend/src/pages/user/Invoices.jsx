import { useEffect, useState } from 'react';
import { invoicesService } from '../../services/invoices.service.js';
import Modal from '../../components/common/Modal.jsx';

const formatCOP = (v) => {
  if (v === null || v === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getEstadoBadgeClass = (estado) => {
  const map = {
    pagada: 'bg-green-50 text-green-700',
    pagado: 'bg-green-50 text-green-700',
    confirmada: 'bg-green-50 text-green-700',
    confirmado: 'bg-green-50 text-green-700',
    completada: 'bg-green-50 text-green-700',
    completado: 'bg-green-50 text-green-700',
    pendiente: 'bg-yellow-50 text-yellow-700',
    pendiente_pago: 'bg-yellow-50 text-yellow-700',
    en_proceso: 'bg-blue-50 text-blue-700',
    anulada: 'bg-red-50 text-red-700',
    cancelada: 'bg-red-50 text-red-700',
    vencida: 'bg-red-50 text-red-700',
  };
  return map[estado?.toLowerCase()] || 'bg-neutral-50 text-neutral-700';
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await invoicesService.getMyInvoices();
      setInvoices(result.data?.facturas || result.data?.invoices || result.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar tus facturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  const handleViewDetail = async (invoice) => {
    try {
      setDetailLoading(true);
      const detail = await invoicesService.getInvoiceById(invoice.id);
      setSelectedInvoice(detail.data || detail);
      setModalOpen(true);
    } catch {
      setSelectedInvoice(invoice);
      setModalOpen(true);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadPdf = async (id, e) => {
    e.stopPropagation();
    try {
      setDownloadingId(id);
      await invoicesService.downloadInvoicePdf(id);
    } catch (err) {
      setError(err.message || 'No se pudo descargar la factura.');
    } finally {
      setDownloadingId(null);
    }
  };

  const toNum = (v) => Number(v) || 0;

  return (
    <div className="container-app space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Mi cuenta</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Mis facturas</h1>
        <p className="mt-2 text-neutral-600">Consulta y descarga las facturas de tus compras confirmadas.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error}
          <button type="button" className="ml-3 underline" onClick={() => setError('')}>Cerrar</button>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-neutral-500">Cargando facturas...</div>
      ) : invoices.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900">Aún no tienes facturas</h2>
          <p className="mt-2 text-neutral-600 max-w-md mx-auto">
            Las facturas se generan automáticamente cuando tus reservas son confirmadas y pagadas.
            Espera a que tus compras se completen para verlas aquí.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-neutral-500 bg-neutral-50 rounded-lg px-4 py-3">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Revisa la sección de mis reservas para ver el estado de tus solicitudes.
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr className="text-xs font-semibold uppercase text-neutral-500">
                  <th className="px-6 py-3">N° Factura</th>
                  <th className="px-6 py-3">Fecha emisión</th>
                  <th className="px-6 py-3">N° Venta</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Subtotal</th>
                  <th className="px-6 py-3 text-right">Descuento</th>
                  <th className="px-6 py-3 text-right">Impuestos</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-neutral-900">
                      {inv.numeroFactura || `FAC-${inv.id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {formatDate(inv.fechaEmision || inv.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-neutral-700">
                      {inv.numeroVenta || inv.saleId || (inv.ventaId ? `#${inv.ventaId}` : '—')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge capitalize ${getEstadoBadgeClass(inv.estado)}`}>
                        {inv.estado || 'pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 text-right font-mono">
                      {formatCOP(toNum(inv.subtotal))}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right font-mono">
                      -{formatCOP(toNum(inv.descuento))}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 text-right font-mono">
                      {formatCOP(toNum(inv.impuestos))}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-neutral-900 text-right font-mono">
                      {formatCOP(toNum(inv.total))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn-ghost text-xs"
                          onClick={() => handleViewDetail(inv)}
                          disabled={detailLoading}
                        >
                          Ver detalle
                        </button>
                        <button
                          type="button"
                          className="btn-outline text-xs"
                          onClick={(e) => handleDownloadPdf(inv.id, e)}
                          disabled={downloadingId === inv.id}
                        >
                          {downloadingId === inv.id ? (
                            <>Descargando...</>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              PDF
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-neutral-50 border-t-2 border-neutral-200">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-semibold text-neutral-700">Totales:</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-neutral-700">
                    {formatCOP(invoices.reduce((s, i) => s + toNum(i.subtotal), 0))}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-red-600">
                    -{formatCOP(invoices.reduce((s, i) => s + toNum(i.descuento), 0))}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-neutral-700">
                    {formatCOP(invoices.reduce((s, i) => s + toNum(i.impuestos), 0))}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-lg text-primary-600">
                    {formatCOP(invoices.reduce((s, i) => s + toNum(i.total), 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Factura ${selectedInvoice?.numeroFactura ? `#${selectedInvoice.numeroFactura}` : selectedInvoice?.id ? `#${selectedInvoice.id}` : ''}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-neutral-500">Fecha de emisión</p>
                <p className="text-neutral-900">{formatDate(selectedInvoice.fechaEmision || selectedInvoice.createdAt)}</p>
              </div>
              <span className={`badge capitalize ${getEstadoBadgeClass(selectedInvoice.estado)}`}>
                {selectedInvoice.estado || 'pendiente'}
              </span>
            </div>

            {selectedInvoice.numeroVenta && (
              <div className="card p-4 bg-neutral-50">
                <p className="text-xs font-semibold uppercase text-neutral-500 mb-1">Venta asociada</p>
                <p className="font-mono text-neutral-900">#{selectedInvoice.numeroVenta}</p>
              </div>
            )}

            {(selectedInvoice.items || selectedInvoice.detalles || selectedInvoice.lineItems) && (
              <div>
                <p className="text-xs font-semibold uppercase text-neutral-500 mb-2">Detalle de items</p>
                <div className="card divide-y divide-neutral-100 overflow-hidden">
                  {(selectedInvoice.items || selectedInvoice.detalles || selectedInvoice.lineItems || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4">
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="font-medium text-neutral-900 truncate">{item.descripcion || item.nombre || item.titulo || `Item ${idx + 1}`}</p>
                        {item.cantidad && (
                          <p className="text-xs text-neutral-500 mt-0.5">Cantidad: {item.cantidad}</p>
                        )}
                      </div>
                      <p className="font-mono text-neutral-900 font-semibold shrink-0">
                        {formatCOP(toNum(item.subtotal || item.total || item.valor || (toNum(item.precioUnitario) * toNum(item.cantidad))))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 border-t border-neutral-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-mono text-neutral-800">{formatCOP(toNum(selectedInvoice.subtotal))}</span>
              </div>
              {toNum(selectedInvoice.descuento) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Descuento</span>
                  <span className="font-mono text-red-600">-{formatCOP(toNum(selectedInvoice.descuento))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Impuestos</span>
                <span className="font-mono text-neutral-800">{formatCOP(toNum(selectedInvoice.impuestos))}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-neutral-200">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-mono text-xl font-bold text-primary-600">{formatCOP(toNum(selectedInvoice.total))}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cerrar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={(e) => {
                  setModalOpen(false);
                  handleDownloadPdf(selectedInvoice.id, e);
                }}
                disabled={downloadingId === selectedInvoice.id}
              >
                {downloadingId === selectedInvoice.id ? 'Descargando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;
