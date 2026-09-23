import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { habitaciones as fallbackHabitaciones } from '../data/habitaciones';
import { roomsService } from '../services/rooms.service.js';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const normalizeRoomImage = (imageUrl) => imageUrl || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

const RoomsList = () => {
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState(fallbackHabitaciones);
  const [filteredHabitaciones, setFilteredHabitaciones] = useState(fallbackHabitaciones);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    tipo: '',
    minPrecio: '',
    maxPrecio: '',
    ubicacion: '',
    busqueda: '',
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const result = await roomsService.getRooms();
        if (result?.success && result.data?.habitaciones?.length > 0) {
          const rooms = result.data.habitaciones.map((room) => ({
            ...room,
            imageUrl: normalizeRoomImage(room.imageUrl),
          }));
          setHabitaciones(rooms);
          setFilteredHabitaciones(rooms);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const tiposUnicos = [...new Set(habitaciones.map((h) => h.tipo).filter(Boolean))];
  const tipoOptions = tiposUnicos.map((t) => ({ value: t, label: t }));

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const applyFilters = () => {
      let result = [...habitaciones];

      if (filters.tipo) {
        result = result.filter((h) => h.tipo === filters.tipo);
      }

      if (filters.minPrecio) {
        const min = Number(filters.minPrecio);
        if (!isNaN(min)) {
          result = result.filter((h) => Number(h.precio) >= min);
        }
      }

      if (filters.maxPrecio) {
        const max = Number(filters.maxPrecio);
        if (!isNaN(max)) {
          result = result.filter((h) => Number(h.precio) <= max);
        }
      }

      if (filters.ubicacion) {
        const loc = filters.ubicacion.toLowerCase();
        result = result.filter((h) => h.ubicacion.toLowerCase().includes(loc));
      }

      if (filters.busqueda) {
        const term = filters.busqueda.toLowerCase();
        result = result.filter((h) =>
          `${h.titulo || ''} ${h.descripcion || ''} ${h.ubicacion || ''}`.toLowerCase().includes(term)
        );
      }

      setFilteredHabitaciones(result);
    };

    applyFilters();
  }, [filters, habitaciones]);

  const clearFilters = () => {
    setFilters({
      tipo: '',
      minPrecio: '',
      maxPrecio: '',
      ubicacion: '',
      busqueda: '',
    });
  };

  return (
    <div className="flex-1">
      <section className="container-app py-10 md:py-14">
        <div className="text-center mb-10">
          <span className="badge bg-primary-100 text-primary-700 mb-3 px-3 py-1">
            Catálogo completo
          </span>
          <h1 className="mb-3">Todas las habitaciones</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Explora nuestra colección completa de alojamientos. Usa los filtros para encontrar tu estancia ideal.
          </p>
        </div>

        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Filtros de búsqueda</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Buscar alojamiento"
              name="busqueda"
              type="text"
              value={filters.busqueda}
              onChange={handleFilterChange}
              placeholder="Nombre o descripción"
            />
            <Select
              label="Tipo de habitación"
              name="tipo"
              value={filters.tipo}
              onChange={handleFilterChange}
              options={tipoOptions}
              placeholder="Todos los tipos"
            />
            <Input
              label="Precio mínimo"
              name="minPrecio"
              type="number"
              value={filters.minPrecio}
              onChange={handleFilterChange}
              placeholder="Ej: 50000"
              min="0"
            />
            <Input
              label="Precio máximo"
              name="maxPrecio"
              type="number"
              value={filters.maxPrecio}
              onChange={handleFilterChange}
              placeholder="Ej: 500000"
              min="0"
            />
            <Input
              label="Ubicación"
              name="ubicacion"
              type="text"
              value={filters.ubicacion}
              onChange={handleFilterChange}
              placeholder="Ej: Bogotá"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-neutral-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                  <div className="h-5 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-full" />
                  <div className="h-4 bg-neutral-200 rounded w-5/6" />
                  <div className="flex gap-1.5 pt-2">
                    <div className="h-6 bg-neutral-200 rounded w-16" />
                    <div className="h-6 bg-neutral-200 rounded w-16" />
                    <div className="h-6 bg-neutral-200 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredHabitaciones.length === 0 ? (
          <div className="card p-12 text-center">
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
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No se encontraron habitaciones
            </h3>
            <p className="text-neutral-600 mb-6">
              Intenta ajustar los filtros de búsqueda para ver más resultados.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-neutral-600">
              Mostrando {filteredHabitaciones.length}{' '}
              {filteredHabitaciones.length === 1 ? 'habitación' : 'habitaciones'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHabitaciones.map((hab) => (
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
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center text-sm text-neutral-500 mb-2 gap-1.5">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
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
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/rooms/${hab.id}`)}
                      >
                        Reservar
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default RoomsList;
