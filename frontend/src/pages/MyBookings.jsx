import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { reservationsService } from '../services/reservations.service.js';
import Button from '../components/common/Button';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const result = await reservationsService.getMyReservations();
      if (result?.success) {
        setBookings(result.data.reservaciones || []);
      } else {
        setError('No se pudieron cargar tus reservaciones.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, authLoading]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reservación?')) {
      return;
    }
    try {
      const result = await reservationsService.cancelReservation(bookingId);
      if (result?.success) {
        setSuccessMsg('Reservación cancelada correctamente.');
        // Update local state status
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, estado: 'cancelada' } : b))
        );
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError('No se pudo cancelar la reservación.');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cancelar la reservación.');
      setTimeout(() => setError(''), 4000);
    }
  };

  if (authLoading) {
    return (
      <div className="container-app py-16 text-center">
        <div className="animate-pulse text-neutral-500">Cargando autenticación...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-app py-16">
        <div className="card max-w-2xl mx-auto p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Inicia Sesión</h2>
          <p className="text-neutral-600 mb-6">
            Inicia sesión para ver tu historial de reservaciones.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente':
        return <span className="badge bg-yellow-100 text-yellow-800 border border-yellow-200">Pendiente</span>;
      case 'confirmada':
        return <span className="badge bg-green-100 text-green-800 border border-green-200">Confirmada</span>;
      case 'cancelada':
        return <span className="badge bg-red-100 text-red-800 border border-red-200">Cancelada</span>;
      case 'completada':
        return <span className="badge bg-neutral-100 text-neutral-800 border border-neutral-200">Completada</span>;
      default:
        return <span className="badge bg-neutral-100 text-neutral-600">{status}</span>;
    }
  };

  return (
    <div className="container-app py-10 md:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Mis Reservaciones</h1>
        <p className="text-neutral-600">
          Consulta y gestiona las estancias que has solicitado.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">{successMsg}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="card animate-pulse h-48 bg-neutral-100" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card p-12 text-center max-w-2xl mx-auto border border-dashed border-neutral-300 bg-neutral-50/50">
          <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No tienes reservaciones</h3>
          <p className="text-neutral-600 mb-6">
            Aún no has reservado ninguna habitación. ¡Explora nuestras opciones y planea tu viaje!
          </p>
          <Button variant="primary" onClick={() => navigate('/rooms')}>
            Explorar Habitaciones
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="card overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 p-5">
              <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={booking.habitacionImage}
                  alt={booking.habitacionTitulo}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-neutral-900 hover:text-primary-600 cursor-pointer" onClick={() => navigate(`/rooms/${booking.habitacionId}`)}>
                      {booking.habitacionTitulo}
                    </h3>
                    {getStatusBadge(booking.estado)}
                  </div>
                  <p className="text-xs text-neutral-500 mb-4 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {booking.habitacionUbicacion}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-xs text-neutral-500 block">Llegada</span>
                      <span className="font-semibold text-neutral-800">
                        {new Date(booking.fechaIngreso).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-500 block">Salida</span>
                      <span className="font-semibold text-neutral-800">
                        {new Date(booking.fechaSalida).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-500 block">Noches</span>
                      <span className="font-semibold text-neutral-800">{booking.totalNoches}</span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-500 block">Huéspedes</span>
                      <span className="font-semibold text-neutral-800">{booking.huespedes}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between border-t border-neutral-100 pt-4 gap-3">
                  <div>
                    <span className="text-xs text-neutral-500">Total pagado / estimado</span>
                    <p className="text-lg font-bold text-neutral-900">
                      ${Number(booking.total).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/rooms/${booking.habitacionId}`)}>
                      Ver Habitación
                    </Button>
                    {(booking.estado === 'pendiente' || booking.estado === 'confirmada') && (
                      <Button variant="danger" size="sm" onClick={() => handleCancelBooking(booking.id)}>
                        Cancelar Reserva
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
