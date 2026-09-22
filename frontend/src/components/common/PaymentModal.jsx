import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { salesService } from '../../services/sales.service.js';
import { invoicesService } from '../../services/invoices.service.js';

const formatCOP = (val) => {
  if (!val) return '$0';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
};

const PAYMENT_METHODS = [
  { id: 'tarjeta', label: 'Tarjeta de Crédito / Débito', icon: '💳' },
  { id: 'nequi', label: 'Nequi / PSE', icon: '📱' },
  { id: 'daviplata', label: 'Daviplata', icon: '📲' },
  { id: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
  { id: 'efectivo', label: 'Efectivo / Punto de pago', icon: '💵' },
];

const PaymentModal = ({ isOpen, onClose, reservation, onPaymentSuccess }) => {
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentDone, setPaymentDone] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [cardData, setCardData] = useState({
    number: '4532 •••• •••• 8892',
    name: 'JUAN PEREZ',
    expiry: '12/28',
    cvv: '123',
  });

  const [phoneData, setPhoneData] = useState('3001234567');

  if (!reservation) return null;

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      const res = await salesService.payReservation(reservation.id, metodoPago);
      if (res?.success || res?.data) {
        const inv = res.data?.invoice || res.data?.factura;
        setInvoiceResult(inv);
        setPaymentDone(true);
        if (onPaymentSuccess) {
          onPaymentSuccess(res.data);
        }
      } else {
        setError(res?.message || 'No se pudo procesar el pago.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al conectar con la pasarela de pago.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadInvoicePdf = async () => {
    if (!invoiceResult?.id) return;
    try {
      setDownloadingPdf(true);
      await invoicesService.downloadInvoicePdf(invoiceResult.id);
    } catch (err) {
      alert('Error al descargar factura: ' + (err.message || 'Ocurrió un error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCloseModal = () => {
    setPaymentDone(false);
    setInvoiceResult(null);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title={paymentDone ? "¡Pago Exitoso!" : "Procesar Pago de Reserva"} size="lg">
      {paymentDone ? (
        <div className="py-4 text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">Pago completado con éxito</h3>
            <p className="text-sm text-neutral-600 mt-1">
              Tu reserva #{reservation.id} en <strong>{reservation.habitacionTitulo || 'la habitación'}</strong> ha sido confirmada y pagada.
            </p>
          </div>

          {invoiceResult && (
            <div className="card p-4 bg-neutral-50 border border-neutral-200 max-w-md mx-auto text-left text-sm space-y-2">
              <div className="flex justify-between items-center border-b pb-2 font-mono">
                <span className="text-neutral-500">N° Factura:</span>
                <span className="font-bold text-neutral-900">{invoiceResult.numeroFactura || `FAC-${invoiceResult.id}`}</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-neutral-500">Monto Pagado:</span>
                <span className="font-bold text-primary-600 text-base">{formatCOP(invoiceResult.total || reservation.total)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-neutral-500">
                <span>Método:</span>
                <span className="capitalize font-semibold">{metodoPago}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {invoiceResult?.id && (
              <Button variant="primary" onClick={handleDownloadInvoicePdf} disabled={downloadingPdf}>
                {downloadingPdf ? 'Descargando...' : '📄 Descargar Factura (PDF)'}
              </Button>
            )}
            <Button variant="secondary" onClick={handleCloseModal}>
              Cerrar y Ver Reservas
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleProcessPayment} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Resumen de reserva */}
          <div className="card p-4 bg-gradient-to-r from-primary-50/50 to-white border border-primary-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs uppercase font-semibold text-primary-600">Detalle del alojamiento</span>
              <h4 className="font-bold text-neutral-900 text-lg">{reservation.habitacionTitulo || `Habitación #${reservation.habitacionId}`}</h4>
              <p className="text-xs text-neutral-500">
                {reservation.fechaIngreso} al {reservation.fechaSalida} ({reservation.totalNoches} {reservation.totalNoches === 1 ? 'noche' : 'noches'})
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500 block">Total a Pagar</span>
              <span className="text-2xl font-bold text-primary-600 font-mono">
                {formatCOP(reservation.total)}
              </span>
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="label-field mb-2">Selecciona tu Método de Pago</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setMetodoPago(method.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 text-center ${
                    metodoPago === method.id
                      ? 'border-primary-600 bg-primary-50/60 ring-2 ring-primary-500/20 shadow-sm'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="text-xs font-semibold text-neutral-800 leading-tight">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Campos dinámicos según método */}
          {metodoPago === 'tarjeta' && (
            <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <p className="text-xs font-semibold uppercase text-neutral-500 mb-1">Datos de la Tarjeta</p>
              <div>
                <label className="text-xs text-neutral-600">Número de Tarjeta</label>
                <input
                  type="text"
                  className="input-field mt-1 font-mono"
                  value={cardData.number}
                  onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-600">Vencimiento</label>
                  <input
                    type="text"
                    className="input-field mt-1 font-mono text-center"
                    placeholder="MM/AA"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-600">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    className="input-field mt-1 font-mono text-center"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {(metodoPago === 'nequi' || metodoPago === 'daviplata') && (
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
              <label className="text-xs text-neutral-600">Número de Celular registrado en {metodoPago.toUpperCase()}</label>
              <input
                type="tel"
                className="input-field font-mono"
                value={phoneData}
                onChange={(e) => setPhoneData(e.target.value)}
                placeholder="Ej: 3001234567"
                required
              />
              <p className="text-xs text-neutral-500">Recibirás una notificación push en tu celular para confirmar la transacción.</p>
            </div>
          )}

          {(metodoPago === 'transferencia' || metodoPago === 'efectivo') && (
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-800">Instrucciones de Pago:</p>
              <p>Al hacer clic en "Confirmar y Pagar", el sistema generará de forma inmediata la orden de cobro y la factura oficial de tu estancia.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={processing}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={processing}>
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando Pago...
                </>
              ) : (
                `Pagar ${formatCOP(reservation.total)}`
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PaymentModal;
