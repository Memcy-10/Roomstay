import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import { habitaciones as fallbackHabitaciones } from '../data/habitaciones';
import { roomsService } from '../services/rooms.service.js';
import Button from '../components/common/Button';

const normalizeRoomImage = (imageUrl) => imageUrl || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

const Home = () => {
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState(fallbackHabitaciones);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const result = await roomsService.getRooms();
        if (result?.success && result.data?.habitaciones?.length > 0) {
          setHabitaciones(result.data.habitaciones.map((room) => ({
            ...room,
            imageUrl: normalizeRoomImage(room.imageUrl),
          })));
        }
      } catch {
      } finally {
        setIsLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Reservas Seguras',
      description: 'Tus pagos y datos protegidos con encriptación de nivel bancario.',
      color: 'from-secondary-500 to-secondary-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Check-in Rápido',
      description: 'Proceso de ingreso ágil con código QR. Sin colas ni papeleo.',
      color: 'from-amber-500 to-amber-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Atención 24/7',
      description: 'Nuestro equipo está siempre disponible para ayudarte en lo que necesites.',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Precios Transparentes',
      description: 'Sin cargos ocultos. Lo que ves es lo que pagas, garantizado.',
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  const tiposHabitacion = [
    { nombre: 'Individuales', cantidad: 156, emoji: '🛏️' },
    { nombre: 'Dobles', cantidad: 243, emoji: '🛌' },
    { nombre: 'Suites', cantidad: 67, emoji: '🏨' },
    { nombre: 'Apartamentos', cantidad: 89, emoji: '🏠' },
    { nombre: 'Cabañas', cantidad: 34, emoji: '🏡' },
  ];

  return (
    <div className="flex-1">
      <section className="container-app pt-6 md:pt-10">
        <Carousel />
      </section>

      <section className="container-app py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="card p-6 hover:shadow-card-hover transition-shadow duration-300 group"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 border-y border-neutral-200">
        <div className="container-app">
          <div className="text-center mb-10 md:mb-12">
            <span className="badge bg-primary-100 text-primary-700 mb-3 px-3 py-1">
              Nuestra oferta
            </span>
            <h2 className="mb-3">Habitaciones Destacadas</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Explora nuestra selección exclusiva de habitaciones verificadas y listas para ti.
              Calidad garantizada en cada una.
            </p>
          </div>

          <div id="habitaciones" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitaciones.slice(0, 6).map((hab) => (
              <article
                key={hab.id}
                className="card group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={hab.imageUrl}
                    alt={hab.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="badge bg-white/90 backdrop-blur-sm text-neutral-800 shadow-sm">
                      {hab.tipo}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      aria-label="Guardar favorito"
                      className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-500 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center text-sm text-neutral-500 mb-2 gap-1.5">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{hab.ubicacion}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {hab.titulo}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {hab.descripcion}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {hab.servicios.slice(0, 3).map((serv) => (
                      <span
                        key={serv}
                        className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600"
                      >
                        {serv}
                      </span>
                    ))}
                    {hab.servicios.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                        +{hab.servicios.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between pt-4 border-t border-neutral-100">
                    <div>
                      <p className="text-sm text-neutral-500">Precio por noche</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        ${Number(hab.precio).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <Button size="sm" variant="primary" onClick={() => navigate(`/rooms/${hab.id}`)}>
                      Reservar
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" onClick={() => navigate('/rooms')}>
              Ver todas las habitaciones
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-app py-12 md:py-16">
        <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {tiposHabitacion.map((tipo, idx) => (
              <div key={idx} className="group">
                <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {tipo.emoji}
                </div>
                <p className="text-3xl md:text-4xl font-bold text-neutral-900 mb-1">
                  {tipo.cantidad}+
                </p>
                <p className="text-sm text-neutral-600 font-medium">{tipo.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app pb-16">
        <div className="card bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-8 md:p-12 text-center text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-20 w-80 h-80 rounded-full bg-primary-500 blur-3xl" />
            <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-secondary-500 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-white mb-4">¿Listo para tu próxima aventura?</h2>
            <p className="text-neutral-300 mb-8 text-lg">
              Únete a RoomStay y accede a ofertas exclusivas, descuentos de bienvenida y las mejores habitaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-neutral-900 hover:bg-neutral-100 border-0"
              >
                Crear cuenta gratis
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Explorar habitaciones
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
