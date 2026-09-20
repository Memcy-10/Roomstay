import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReservations = async () => {
    try { const result = await adminService.getAllReservations(); setReservations(result.data?.reservaciones || []); }
    catch (requestError) { setError(requestError.response?.data?.message || 'No se pudieron cargar las reservaciones.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadReservations(); }, []);

  const updateStatus = async (id, estado) => {
    try { await adminService.updateReservationStatus(id, estado); setReservations((current) => current.map((item) => item.id === id ? { ...item, estado } : item)); }
    catch (requestError) { setError(requestError.response?.data?.message || 'No se pudo actualizar la reservación.'); }
  };

  return <div className="container-app space-y-6"><header><p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Administración</p><h1 className="mt-1 text-3xl font-bold text-neutral-900">Reservaciones</h1><p className="mt-2 text-neutral-600">Controla el estado de todas las reservas.</p></header>{error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}{loading ? <div className="card p-6 text-neutral-500">Cargando reservaciones...</div> : <div className="card overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-neutral-50 text-neutral-600"><tr><th className="p-4">Huésped</th><th className="p-4">Hospedaje</th><th className="p-4">Fechas</th><th className="p-4">Estado</th><th className="p-4">Actualizar</th></tr></thead><tbody className="divide-y divide-neutral-100">{reservations.map((item) => <tr key={item.id}><td className="p-4">{item.userFirstName} {item.userLastName}</td><td className="p-4 font-medium">{item.habitacionTitulo || `Reserva #${item.id}`}</td><td className="p-4">{item.fechaIngreso} a {item.fechaSalida}</td><td className="p-4 capitalize">{item.estado}</td><td className="p-4"><select value={item.estado} onChange={(event) => updateStatus(item.id, event.target.value)} className="select-field py-2"><option value="pendiente">Pendiente</option><option value="confirmada">Confirmada</option><option value="cancelada">Cancelada</option><option value="completada">Completada</option></select></td></tr>)}</tbody></table>{reservations.length === 0 && <p className="p-6 text-neutral-600">No hay reservaciones.</p>}</div>}</div>;
};

export default AdminReservations;
