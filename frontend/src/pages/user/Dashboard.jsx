import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationsService } from '../../services/reservations.service.js';
import { useAuth } from '../../hooks/useAuth.js';

const UserDashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationsService.getMyReservations()
      .then((result) => setReservations(result.data?.reservaciones || []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, []);

  const activeReservations = reservations.filter((item) => item.estado !== 'cancelada');
  const firstName = user?.firstName || user?.name || 'viajero';

  return (
    <div className="container-app space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Mi panel</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Hola, {firstName}</h1>
        <p className="mt-2 text-neutral-600">Encuentra tu próxima estadía y administra tus reservas.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-neutral-500">Reservas totales</p><p className="mt-2 text-3xl font-bold text-neutral-900">{loading ? '...' : reservations.length}</p></div>
        <div className="card p-5"><p className="text-sm text-neutral-500">Reservas activas</p><p className="mt-2 text-3xl font-bold text-primary-600">{loading ? '...' : activeReservations.length}</p></div>
        <div className="card p-5"><p className="text-sm text-neutral-500">Tipo de cuenta</p><p className="mt-2 text-2xl font-bold text-neutral-900">Huésped</p></div>
      </div>

      <section className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-semibold text-neutral-900">¿Listo para viajar?</h2><p className="mt-1 text-neutral-600">Explora habitaciones disponibles y reserva en pocos pasos.</p></div>
        <Link to="/rooms" className="btn-primary shrink-0 text-center">Explorar hospedajes</Link>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-neutral-900">Últimas reservas</h2><Link to="/user/bookings" className="text-sm font-semibold text-primary-600 hover:underline">Ver todas</Link></div>
        {loading ? <div className="card p-6 text-neutral-500">Cargando reservas...</div> : reservations.length === 0 ? <div className="card p-6 text-neutral-600">Todavía no tienes reservas.</div> : <div className="space-y-3">{reservations.slice(0, 3).map((reservation) => <div key={reservation.id} className="card flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold text-neutral-900">{reservation.habitacionTitulo || `Reserva #${reservation.id}`}</p><p className="text-sm text-neutral-500">{reservation.fechaIngreso} a {reservation.fechaSalida}</p></div><span className="badge bg-primary-50 text-primary-700 capitalize">{reservation.estado}</span></div>)}</div>}
      </section>
    </div>
  );
};

export default UserDashboard;
