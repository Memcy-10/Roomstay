import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { habitaciones as fallbackHabitaciones } from '../data/habitaciones';
import { roomsService } from '../services/rooms.service.js';
import { reservationsService } from '../services/reservations.service.js';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PaymentModal from '../components/common/PaymentModal.jsx';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [habitacion, setHabitacion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservaForm, setReservaForm] = useState({
    fechaIngreso: '',
    fechaSalida: '',
    huespedes: '1',
  });
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      setIsLoading(true);
      try {
        const result = await roomsService.getRoomById(id);
        if (result?.success && result.data?.habitacion) {
          setHabitacion(result.data.habitacion);
        } else {
          const fallback = fallbackHabitaciones.find((h) => String(h.id) === String(id));
          setHabitacion(fallback || null);
        }
      } catch {
        const fallback = fallbackHabitaciones.find((h) => String(h.id) === String(id));
        setHabitacion(fallback || null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleFormChange = (name, value) => {
    setReservaForm((prev) => ({ ...prev, [name]: value }));
    setAvailabilityResult(null);
    setErrorMessage('');
  };

  const calcularNoches = () => {
    if (!reservaForm.fechaIngreso || !reservaForm.fechaSalida) return 0;
    const ingreso = new Date(reservaForm.fechaIngreso);
    const salida = new Date(reservaForm.fechaSalida);
    const diffMs = salida - ingreso;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const noches = calcularNoches();
  const totalEstimado = habitacion ? noches * Number(habitacion.precio) : 0;

  const handleCheckAvailability = async () => {
    setErrorMessage('');
    if (!reservaForm.fechaIngreso || !reservaForm.fechaSalida) {
      setErrorMessage('Por favor selecciona las fechas de ingreso y salida.');
      return;
    }
    if (noches <= 0) {
      setErrorMessage('La fecha de salida debe ser posterior a la fecha de ingreso.');
      return;
    }
    const huespedesNum = Number(reservaForm.huespedes);
    if (huespedesNum <= 0) {
      setErrorMessage('Por favor ingresa un número válido de huéspedes.');
      return;
    }
    if (habitacion && huespedesNum > Number(habitacion.capacidad)) {
      setErrorMessage(
        `Esta habitación permite máximo ${habitacion.capacidad} huéspedes.`
      );
      return;
    }

    setIsCheckingAvailability(true);
    try {
      const result = await reservationsService.checkAvailability({
        habitacionId: id,
        fechaIngreso: reservaForm.fechaIngreso,
        fechaSalida: reservaForm.fechaSalida,
        huespedes: reservaForm.huespedes,
      });
      setAvailabilityResult({
        disponible: result?.success ?? true,
        noches,
        total: totalEstimado,
        ...(result?.data || {}),
      });
    } catch {
      setAvailabilityResult({
        disponible: true,
        noches,
        total: totalEstimado,
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleConfirmReservation = async () => {
    setErrorMessage('');
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/rooms/${id}` } });
      return;
    }
    if (!availabilityResult || !availabilityResult.disponible) {
      setErrorMessage('Primero debes consultar la disponibilidad.');
      return;
    }

    setIsCreatingReservation(true);
    try {
      const res = await reservationsService.createReservation({
        habitacionId: id,
        fechaIngreso: reservaForm.fechaIngreso,
        fechaSalida: reservaForm.fechaSalida,
        huespedes: Number(reservaForm.huespedes),
        total: availabilityResult.total,
        noches: availabilityResult.noches,
      });
      const resObj = res?.data?.reservacion || res?.data || res;
      setCreatedReservation(resObj);
      setReservationSuccess(true);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          'No se pudo confirmar la reserva. Intenta nuevamente.'
      );
    } finally {
      setIsCreatingReservation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 container-app py-10">
        <div className="animate-pulse space-y-6">
          <div className="aspect-video w-full bg-neutral-200 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 bg-neutral-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-200 rounded w-1/3" />
              <div className="h-4 bg-neutral-200 rounded w-full" />
              <div className="h-4 bg-neutral-200 rounded w-5/6" />
              <div className="h-4 bg-neutral-200 rounded w-2/3" />
            </div>
            <div className="h-80 bg-neutral-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!habitacion) {
    return (
      <div className="flex-1 container-app py-20">
        <div className="card p-12 text-center max-w-2xl mx-auto">
          <svg
            className="w-16 h-16 mx-auto text-neutral-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            Habitación no encontrada
          </h2>
          <p className="text-neutral-600 mb-6">
            La habitación que buscas no existe o fue eliminada.
          </p>
          <Button variant="primary" onClick={() => navigate('/rooms')}>
            Volver a habitaciones
          </Button>
        </div>
      </div>
    );
  }

  const hostFullName = [habitacion.hostFirstName, habitacion.hostLastName]
    .filter(Boolean)
    .join(' ') || 'Anfitrión RoomStay';

  return (
    <div className="flex-1">
      {reservationSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
              ¡Reserva confirmada!
            </h3>
            <p className="text-neutral-600 mb-6">
              Tu reserva para <strong>{habitacion.titulo}</strong> ha sido creada exitosamente.
              Revisa tu correo electrónico para más detalles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => navigate('/user/bookings')}>
                Mis Reservaciones
              </Button>
              <Button variant="secondary" onClick={() => navigate('/rooms')}>
                Explorar más
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="container-app py-8 md:py-10">
        <button
          onClick={() => navigate('/rooms')}
          className="btn-link mb-6 text-sm"
        >
          <svg
            className="w-4 h-4 mr-1 inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a habitaciones
        </button>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={habitacion.imageUrl}
            alt={habitacion.titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="badge bg-white/90 backdrop-blur-sm text-neutral-800 shadow-sm text-sm px-3 py-1">
              {habitacion.tipo}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
                  {habitacion.titulo}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-neutral-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-5 h-5 text-neutral-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{habitacion.ubicacion}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-5 h-5 text-neutral-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    Capacidad: {habitacion.capacidad}{' '}
                    {habitacion.capacidad === 1 ? 'huésped' : 'huéspedes'}
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl md:text-4xl font-bold text-neutral-900">
                  ${Number(habitacion.precio).toLocaleString('es-CO')}
                </p>
                <p className="text-neutral-500">por noche</p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-3">
                Descripción
              </h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {habitacion.descripcion}
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Servicios incluidos
              </h2>
              <div className="flex flex-wrap gap-2">
                {habitacion.servicios?.length > 0 ? (
                  habitacion.servicios.map((serv) => (
                    <span
                      key={serv}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-100"
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {serv}
                    </span>
                  ))
                ) : (
                  <p className="text-neutral-500">
                    No hay servicios disponibles para esta habitación.
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Información del anfitrión
              </h2>
              <div className="card p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {hostFullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-neutral-900">
                      {hostFullName}
                    </p>
                    <p className="text-sm text-neutral-500">Anfitrión verificado</p>
                  </div>
                </div>
                <div className="space-y-2.5 text-sm">
                  {(habitacion.hostPhone || habitacion.hostEmail) && (
                    <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                      {habitacion.hostPhone && (
                        <div className="flex items-center gap-2.5 text-neutral-700">
                          <svg
                            className="w-4 h-4 text-neutral-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span>{habitacion.hostPhone}</span>
                        </div>
                      )}
                      {habitacion.hostEmail && (
                        <div className="flex items-center gap-2.5 text-neutral-700">
                          <svg
                            className="w-4 h-4 text-neutral-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="truncate">{habitacion.hostEmail}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="card p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Reserva esta habitación
                </h3>

                <div className="space-y-4 mb-5">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Fecha de ingreso"
                      name="fechaIngreso"
                      type="date"
                      value={reservaForm.fechaIngreso}
                      onChange={handleFormChange}
                      required
                    />
                    <Input
                      label="Fecha de salida"
                      name="fechaSalida"
                      type="date"
                      value={reservaForm.fechaSalida}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <Input
                    label="Número de huéspedes"
                    name="huespedes"
                    type="number"
                    value={reservaForm.huespedes}
                    onChange={handleFormChange}
                    min="1"
                    max={habitacion.capacidad}
                    required
                  />
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleCheckAvailability}
                  disabled={isCheckingAvailability}
                  className="mb-4"
                >
                  {isCheckingAvailability ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Consultando...
                    </>
                  ) : (
                    'Consultar disponibilidad'
                  )}
                </Button>

                {availabilityResult && (
                  <div className="mb-5 p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-3">
                    {availabilityResult.disponible ? (
                      <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Disponible para tus fechas
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        No disponible en estas fechas
                      </div>
                    )}
                    <div className="space-y-2 pt-2 border-t border-neutral-200 text-sm">
                      <div className="flex justify-between text-neutral-600">
                        <span>
                          ${Number(habitacion.precio).toLocaleString('es-CO')} x{' '}
                          {availabilityResult.noches}{' '}
                          {availabilityResult.noches === 1 ? 'noche' : 'noches'}
                        </span>
                        <span>
                          $
                          {(
                            availabilityResult.noches * Number(habitacion.precio)
                          ).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Huéspedes</span>
                        <span>{reservaForm.huespedes}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-neutral-900 pt-2 border-t border-neutral-200 text-base">
                        <span>Total</span>
                        <span>
                          $
                          {Number(availabilityResult.total).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleConfirmReservation}
                  disabled={
                    !availabilityResult?.disponible ||
                    isCreatingReservation
                  }
                >
                  {isCreatingReservation ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Confirmando...
                    </>
                  ) : isAuthenticated ? (
                    'Confirmar Reserva'
                  ) : (
                    <>
                      Inicia sesión para reservar
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                    </>
                  )}
                </Button>

                {reservationSuccess && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ¡Reserva Confirmada!
                    </div>
                    <p className="text-xs text-neutral-600">
                      Tu reserva ha sido registrada exitosamente. Puedes realizar el pago ahora mismo para generar tu factura oficial.
                    </p>
                    <div className="flex flex-col gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setPaymentModalOpen(true)}
                      >
                        💳 Realizar Pago Ahora
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/user/bookings')}
                      >
                        Ver Mis Reservaciones
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        reservation={createdReservation || {
          id: 'nueva',
          habitacionTitulo: habitacion?.titulo,
          fechaIngreso: reservaForm.fechaIngreso,
          fechaSalida: reservaForm.fechaSalida,
          totalNoches: availabilityResult?.noches || 1,
          total: availabilityResult?.total || 0,
        }}
        onPaymentSuccess={() => {
          setTimeout(() => navigate('/user/invoices'), 1000);
        }}
      />
    </div>
  );
};

export default RoomDetail;
