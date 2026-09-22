import { useEffect, useState } from 'react';
import { reservationsService } from '../../services/reservations.service.js';
import PaymentModal from '../../components/common/PaymentModal.jsx';

const UserBookings = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedForPayment, setSelectedForPayment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const loadReservations = async () => {
    try {
      const result = await reservationsService.getMyReservations();
      setReservations(result.data?.reservaciones || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudieron cargar tus reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReservations(); }, []);

  const cancelReservation = async (id) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    try {
      await reservationsService.cancelReservation(id);
      setReservations((current) => current.map((item) => item.id === id ? { ...item, estado: 'cancelada' } : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo cancelar la reserva.');
    }
  };

  const handleOpenPayment = (reservation) => {
    setSelectedForPayment(reservation);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    loadReservations();
  };

  return (
    <div className="container-app space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Mi cuenta</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Mis reservaciones</h1>
        <p className="mt-2 text-neutral-600">Consulta y administra tus próximas estadías y realiza el pago de tus reservas.</p>
      </header>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      {loading ? (
        <div className="card p-6 text-neutral-500">Cargando reservas...</div>
      ) : reservations.length === 0 ? (
        <div className="card p-8 text-center text-neutral-600">No tienes reservaciones todavía.</div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <article key={reservation.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between border border-neutral-200 hover:shadow-sm transition-shadow">
              <div>
                <h2 className="font-semibold text-neutral-900 text-lg">{reservation.habitacionTitulo || `Reserva #${reservation.id}`}</h2>
                <p className="mt-1 text-sm text-neutral-500">{reservation.habitacionUbicacion || 'Ubicación no disponible'}</p>
                <p className="mt-2 text-sm text-neutral-700 font-medium">
                  {reservation.fechaIngreso} a {reservation.fechaSalida} · {reservation.huespedes} huésped(es)
                </p>
                <p className="mt-1 font-mono font-bold text-primary-600">
                  Total: ${Number(reservation.total).toLocaleString('es-CO')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`badge capitalize ${
                  reservation.estado === 'pagada'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold'
                    : reservation.estado === 'confirmada' || reservation.estado === 'completada'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : reservation.estado === 'cancelada'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {reservation.estado === 'pagada' ? '✅ Pagada' : reservation.estado}
                </span>

                {(reservation.estado === 'pendiente' || reservation.estado === 'confirmada') && (
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(reservation)}
                    className="btn-primary !py-1.5 !px-3.5 text-sm"
                  >
                    💳 Pagar Reserva
                  </button>
                )}

                {reservation.estado !== 'cancelada' && reservation.estado !== 'completada' && (
                  <button
                    type="button"
                    onClick={() => cancelReservation(reservation.id)}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        reservation={selectedForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default UserBookings;
