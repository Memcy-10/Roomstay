import { useEffect, useState } from 'react';
import { reservationsService } from '../../services/reservations.service.js';

const UserBookings = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="container-app space-y-6">
      <header><p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Mi cuenta</p><h1 className="mt-1 text-3xl font-bold text-neutral-900">Mis reservaciones</h1><p className="mt-2 text-neutral-600">Consulta y administra tus próximas estadías.</p></header>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      {loading ? <div className="card p-6 text-neutral-500">Cargando reservas...</div> : reservations.length === 0 ? <div className="card p-8 text-center text-neutral-600">No tienes reservaciones todavía.</div> : <div className="space-y-4">{reservations.map((reservation) => <article key={reservation.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><h2 className="font-semibold text-neutral-900">{reservation.habitacionTitulo || `Reserva #${reservation.id}`}</h2><p className="mt-1 text-sm text-neutral-500">{reservation.habitacionUbicacion || 'Ubicación no disponible'}</p><p className="mt-2 text-sm text-neutral-700">{reservation.fechaIngreso} a {reservation.fechaSalida} · {reservation.huespedes} huésped(es)</p></div><div className="flex items-center gap-3"><span className="badge bg-primary-50 text-primary-700 capitalize">{reservation.estado}</span>{reservation.estado !== 'cancelada' && <button type="button" onClick={() => cancelReservation(reservation.id)} className="text-sm font-semibold text-red-600 hover:underline">Cancelar</button>}</div></article>)}</div>}
    </div>
  );
};

export default UserBookings;
