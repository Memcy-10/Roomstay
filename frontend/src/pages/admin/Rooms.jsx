import { useEffect, useState } from 'react';
import { roomsService } from '../../services/rooms.service.js';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { roomsService.getRooms().then((result) => setRooms(result.data?.habitaciones || [])).catch((requestError) => setError(requestError.response?.data?.message || 'No se pudieron cargar las habitaciones.')).finally(() => setLoading(false)); }, []);

  const visibleRooms = rooms.filter((room) => `${room.titulo || ''} ${room.ubicacion || ''} ${room.tipo || ''}`.toLowerCase().includes(search.toLowerCase()));

  const removeRoom = async (id) => {
    if (!window.confirm('¿Eliminar este hospedaje?')) return;
    try { await roomsService.deleteRoom(id); setRooms((current) => current.filter((item) => item.id !== id)); }
    catch (requestError) { setError(requestError.response?.data?.message || 'No se pudo eliminar el hospedaje.'); }
  };

  return <div className="container-app space-y-6"><header><p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Administración</p><h1 className="mt-1 text-3xl font-bold text-neutral-900">Habitaciones</h1><p className="mt-2 text-neutral-600">Supervisa todos los hospedajes publicados.</p></header><div className="card p-4"><input className="input-field" placeholder="Buscar por nombre, ubicación o tipo..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>{error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}{loading ? <div className="card p-6 text-neutral-500">Cargando habitaciones...</div> : <div className="card overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-neutral-50 text-neutral-600"><tr><th className="p-4">Hospedaje</th><th className="p-4">Ubicación</th><th className="p-4">Precio/noche</th><th className="p-4">Estado</th><th className="p-4">Acción</th></tr></thead><tbody className="divide-y divide-neutral-100">{visibleRooms.map((room) => <tr key={room.id}><td className="p-4 font-medium">{room.titulo}</td><td className="p-4">{room.ubicacion}</td><td className="p-4">${Number(room.precio).toLocaleString('es-CO')}</td><td className="p-4"><span className={`badge ${room.disponible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{room.disponible ? 'Disponible' : 'No disponible'}</span></td><td className="p-4"><button type="button" onClick={() => removeRoom(room.id)} className="text-sm font-semibold text-red-600 hover:underline">Eliminar</button></td></tr>)}</tbody></table>{rooms.length === 0 && <p className="p-6 text-neutral-600">No hay habitaciones publicadas.</p>}</div>}</div>;
};

export default AdminRooms;
