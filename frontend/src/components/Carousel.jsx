import { useState, useEffect, useCallback } from 'react';
import { habitaciones as fallbackHabitaciones } from '../data/habitaciones';
import { roomsService } from '../services/rooms.service.js';

const normalizeRoomImage = (imageUrl) => imageUrl || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState(fallbackHabitaciones);
  const [isLoading, setIsLoading] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const result = await roomsService.getRooms();
        if (result?.success && result.data?.habitaciones?.length > 0) {
          setSlides(result.data.habitaciones.map((room) => ({
            ...room,
            imageUrl: normalizeRoomImage(room.imageUrl),
          })));
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (isPaused || isLoading) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, isLoading, nextSlide]);

  if (isLoading && slides.length === 0) {
    return (
      <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-neutral-100 animate-pulse flex items-center justify-center">
        <svg className="w-12 h-12 text-neutral-300 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[16/9] md:aspect-[21/9]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0 scale-100'
                : index < currentIndex
                ? 'opacity-0 -translate-x-full scale-95'
                : 'opacity-0 translate-x-full scale-95'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.titulo}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-12">
              <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-primary-600 text-white">
                    {slide.tipo}
                  </span>
                  <span className="badge bg-white/20 text-white backdrop-blur-sm">
                    <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {slide.ubicacion}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 text-shadow">
                  {slide.titulo}
                </h3>
                <p className="text-sm md:text-base lg:text-lg text-white/80 mb-4 line-clamp-2 md:line-clamp-3 max-w-2xl">
                  {slide.descripcion}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-white">
                    <span className="text-3xl md:text-4xl font-bold text-primary-400">
                      ${Number(slide.precio).toLocaleString('es-CO')}
                    </span>
                    <span className="text-white/60 text-sm md:text-base ml-1">/noche</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-sm md:text-base">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Hasta {slide.capacidad} personas
                  </div>
                  <button className="btn-primary text-sm md:text-base py-2 px-5">
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/20 group"
        aria-label="Anterior"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/20 group"
        aria-label="Siguiente"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
