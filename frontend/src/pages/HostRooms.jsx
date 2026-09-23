import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { roomsService } from '../services/rooms.service.js';
import Button from '../components/common/Button';

const HostRooms = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const visibleRooms = rooms.filter((room) => `${room.titulo || ''} ${room.ubicacion || ''} ${room.tipo || ''}`.toLowerCase().includes(search.toLowerCase()));

  const fetchMyRooms = async () => {
    setIsLoading(true);
    try {
      const result = await roomsService.getMyRooms();
      if (result?.success) {
        setRooms(result.data.habitaciones || []);
      } else {
        setError('No se pudieron cargar tus habitaciones.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchMyRooms();
    }
  }, [user, authLoading]);

  const handleDelete = async (roomId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este hospedaje? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      const result = await roomsService.deleteRoom(roomId);
      if (result?.success) {
        setSuccessMsg('Hospedaje eliminado correctamente.');
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError('No se pudo eliminar el hospedaje.');
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al eliminar el hospedaje.');
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

  const isHost = user?.rol === 'host' || user?.rol === 'admin' || user?.role === 'host' || user?.role === 'admin';
  if (!isHost) {
    return (
      <div className="container-app py-16">
        <div className="card max-w-2xl mx-auto p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Acceso Restringido</h2>
          <p className="text-neutral-600 mb-6">
            Esta sección está disponible solo para hospedadores.
          </p>
          <Link to="/">
            <Button variant="primary">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-10 md:py-14">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Mis Hospedajes</h1>
          <p className="text-neutral-600">
            Administra las habitaciones y alojamientos que tienes publicados.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/host/rooms/new')}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Publicar Hospedaje
        </Button>
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

      <div className="card p-4 mb-6"><input className="input-field" placeholder="Buscar por nombre, ubicación o tipo..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>{error && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-80 bg-neutral-100" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="card p-12 text-center max-w-2xl mx-auto border border-dashed border-neutral-300 bg-neutral-50/50">
          <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No has publicado hospedajes</h3>
          <p className="text-neutral-600 mb-6">
            Empieza a ganar dinero alquilando tus habitaciones o alojamientos.
          </p>
          <Button variant="primary" onClick={() => navigate('/host/rooms/new')}>
            Crear mi primera publicación
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleRooms.map((room) => (
            <article key={room.id} className="card overflow-hidden group hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={room.imageUrl}
                    alt={room.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="badge bg-white/90 backdrop-blur-sm text-neutral-800 shadow-sm text-xs font-semibold">
                      {room.tipo}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`badge ${room.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs font-semibold shadow-sm`}>
                      {room.disponible ? 'Disponible' : 'Ocupado/No disp.'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center text-xs text-neutral-500 mb-1.5 gap-1">
                    <svg className="w-3.5 h-3.5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{room.ubicacion}</span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
                    {room.titulo}
                  </h3>
                  <p className="text-sm text-neutral-500 font-bold mb-3">
                    ${Number(room.precio).toLocaleString('es-CO')} <span className="font-normal text-xs">/ noche</span>
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/rooms/${room.id}`)}>
                  Ver
                </Button>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/host/rooms/edit/${room.id}`)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(room.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostRooms;
