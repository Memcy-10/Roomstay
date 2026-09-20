import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal.jsx';
import { pqrService } from '../../services/pqr.service.js';

const TIPO_BADGE = {
  peticion: 'bg-blue-50 text-blue-700',
  queja: 'bg-red-50 text-red-700',
  reclamo: 'bg-orange-50 text-orange-700',
  sugerencia: 'bg-teal-50 text-teal-700',
};

const ESTADO_BADGE_PQR = {
  pendiente: 'bg-yellow-50 text-yellow-700',
  en_proceso: 'bg-blue-50 text-blue-700',
  respondida: 'bg-green-50 text-green-700',
  cerrada: 'bg-gray-100 text-gray-700',
};

const PRIORIDAD_BADGE = {
  alta: 'bg-red-50 text-red-700',
  media: 'bg-amber-50 text-amber-700',
  baja: 'bg-green-50 text-green-700',
};

const TIPOS_PQR = ['peticion', 'queja', 'reclamo', 'sugerencia'];
const ESTADOS_PQR = ['pendiente', 'en_proceso', 'respondida', 'cerrada'];
const PRIORIDADES = ['alta', 'media', 'baja'];

const HostPQR = () => {
  const [pqrs, setPqrs] = useState([]);
  const [allPqrs, setAllPqrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    tipo: '',
    estado: '',
    prioridad: '',
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [pqrDetail, setPqrDetail] = useState(null);
  const [changeEstado, setChangeEstado] = useState('');

  const loadPqrs = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await pqrService.getMyPqr();
      const list = result.data?.pqrs || result.data || [];
      setAllPqrs(list);
      applyFilters(list, filters);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudieron cargar los PQR.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (list, f) => {
    let filtered = [...list];
    if (f.tipo) filtered = filtered.filter((p) => p.tipo === f.tipo);
    if (f.estado) filtered = filtered.filter((p) => p.estado === f.estado);
    if (f.prioridad) filtered = filtered.filter((p) => p.prioridad === f.prioridad);
    setPqrs(filtered);
  };

  useEffect(() => {
    loadPqrs();
  }, []);

  useEffect(() => {
    applyFilters(allPqrs, filters);
  }, [filters.tipo, filters.estado, filters.prioridad, allPqrs]);

  const handleViewDetail = async (pqr) => {
    try {
      const result = await pqrService.getById(pqr.id);
      const data = result.data || result;
      setPqrDetail(data);
      setChangeEstado(data.estado || '');
      setDetailOpen(true);
    } catch (requestError) {
      alert('Error al cargar detalle: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  const submitStatusChange = async () => {
    if (!pqrDetail || !changeEstado) return;
    try {
      await pqrService.updateStatus(pqrDetail.id, changeEstado);
      const updatedList = allPqrs.map((p) => p.id === pqrDetail.id ? { ...p, estado: changeEstado } : p);
      setAllPqrs(updatedList);
      setPqrDetail((current) => current ? { ...current, estado: changeEstado } : current);
      alert('Estado actualizado correctamente.');
    } catch (requestError) {
      alert('Error: ' + (requestError.response?.data?.message || requestError.message));
    }
  };

  return (
    <div className="container-app space-y-6 py-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Hospedador</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">PQR</h1>
        <p className="mt-2 text-neutral-600">Peticiones, Quejas, Reclamos y Sugerencias sobre tus alojamientos.</p>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <section className="card p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Filtros</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label-field">Tipo</label>
            <select
              className="select-field"
              value={filters.tipo}
              onChange={(e) => setFilters((f) => ({ ...f, tipo: e.target.value }))}
            >
              <option value="">Todos</option>
              {TIPOS_PQR.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Estado</label>
            <select
              className="select-field"
              value={filters.estado}
              onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value }))}
            >
              <option value="">Todos</option>
              {ESTADOS_PQR.map((e) => <option key={e} value={e} className="capitalize">{e.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Prioridad</label>
            <select
              className="select-field"
              value={filters.prioridad}
              onChange={(e) => setFilters((f) => ({ ...f, prioridad: e.target.value }))}
            >
              <option value="">Todas</option>
              {PRIORIDADES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="card overflow-x-auto">
        {loading ? (
          <div className="p-6 text-neutral-500">Cargando PQR...</div>
        ) : pqrs.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-neutral-700 font-medium">No hay PQR registrados.</p>
            <p className="mt-1 text-sm text-neutral-500">Cuando tus huéspedes envíen PQR los verás aquí.</p>
          </div>
        ) : (
          <>
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="p-4">Radicado</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Prioridad</th>
                  <th className="p-4">Título</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pqrs.map((p) => (
                  <tr key={p.id}>
                    <td className="p-4 font-semibold">#{p.numeroRadicado || p.id}</td>
                    <td className="p-4">{p.createdAt?.split('T')[0] || p.fecha || '-'}</td>
                    <td className="p-4">
                      <div className="font-medium">{p.clienteNombre || `${p.userFirstName || ''} ${p.userLastName || ''}`.trim() || '-'}</div>
                      <div className="text-xs text-neutral-500">{p.clienteEmail || p.email || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`badge capitalize ${TIPO_BADGE[p.tipo] || 'bg-neutral-100 text-neutral-600'}`}>
                        {p.tipo || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`badge capitalize ${ESTADO_BADGE_PQR[p.estado] || 'bg-neutral-100 text-neutral-600'}`}>
                        {(p.estado || 'pendiente').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`badge capitalize ${PRIORIDAD_BADGE[p.prioridad] || 'bg-neutral-100 text-neutral-600'}`}>
                        {p.prioridad || 'media'}
                      </span>
                    </td>
                    <td className="p-4 max-w-[200px] truncate" title={p.titulo || p.asunto}>{p.titulo || p.asunto || '-'}</td>
                    <td className="p-4">
                      <button type="button" className="btn-outline !py-1.5 !px-3 text-xs" onClick={() => handleViewDetail(p)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle PQR" size="xl">
        {pqrDetail ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div><span className="text-sm text-neutral-500">Radicado:</span> <p className="font-semibold">#{pqrDetail.numeroRadicado || pqrDetail.id}</p></div>
              <div><span className="text-sm text-neutral-500">Fecha creación:</span> <p className="font-semibold">{pqrDetail.createdAt?.split('T')[0] || pqrDetail.fecha || '-'}</p></div>
              <div><span className="text-sm text-neutral-500">Cliente:</span> <p className="font-semibold">{pqrDetail.clienteNombre || `${pqrDetail.userFirstName || ''} ${pqrDetail.userLastName || ''}`.trim()}</p></div>
              <div><span className="text-sm text-neutral-500">Contacto:</span> <p className="font-medium">{pqrDetail.clienteEmail || pqrDetail.email || '-'}</p></div>
              <div>
                <span className="text-sm text-neutral-500">Tipo:</span>
                <p><span className={`badge capitalize mt-1 ${TIPO_BADGE[pqrDetail.tipo] || ''}`}>{pqrDetail.tipo || '-'}</span></p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Prioridad:</span>
                <p><span className={`badge capitalize mt-1 ${PRIORIDAD_BADGE[pqrDetail.prioridad] || ''}`}>{pqrDetail.prioridad || 'media'}</span></p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-1 text-neutral-900">Título</h4>
              <p className="text-neutral-800">{pqrDetail.titulo || pqrDetail.asunto || '-'}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-1 text-neutral-900">Descripción</h4>
              <p className="text-neutral-800 whitespace-pre-wrap bg-neutral-50 p-3 rounded-lg">{pqrDetail.descripcion || pqrDetail.mensaje || 'Sin descripción.'}</p>
            </div>

            {pqrDetail.respuesta && (
              <div>
                <h4 className="font-semibold mb-1 text-neutral-900">Respuesta</h4>
                <p className="text-neutral-800 whitespace-pre-wrap bg-green-50 p-3 rounded-lg border border-green-200">{pqrDetail.respuesta}</p>
              </div>
            )}

            <div className="pt-3 border-t">
              <label className="label-field">Cambiar estado</label>
              <div className="flex gap-2">
                <select
                  className="select-field flex-1"
                  value={changeEstado}
                  onChange={(e) => setChangeEstado(e.target.value)}
                >
                  {ESTADOS_PQR.map((e) => <option key={e} value={e} className="capitalize">{e.replace('_', ' ')}</option>)}
                </select>
                <button type="button" className="btn-primary !py-2.5" onClick={submitStatusChange}>Actualizar</button>
              </div>
            </div>
          </div>
        ) : <p className="text-neutral-500">Cargando...</p>}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <button type="button" className="btn-secondary" onClick={() => setDetailOpen(false)}>Cerrar</button>
        </div>
      </Modal>
    </div>
  );
};

export default HostPQR;
