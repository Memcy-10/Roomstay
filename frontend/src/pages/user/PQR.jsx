import { useEffect, useState } from 'react';
import { pqrService } from '../../services/pqr.service.js';
import Modal from '../../components/common/Modal.jsx';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTipoBadgeClass = (tipo) => {
  const map = {
    peticion: 'bg-blue-50 text-blue-700',
    queja: 'bg-red-50 text-red-700',
    reclamo: 'bg-orange-50 text-orange-700',
    sugerencia: 'bg-green-50 text-green-700',
  };
  return map[tipo?.toLowerCase()] || 'bg-neutral-50 text-neutral-700';
};

const getEstadoBadgeClass = (estado) => {
  const map = {
    pendiente: 'bg-yellow-50 text-yellow-700',
    en_proceso: 'bg-blue-50 text-blue-700',
    enproceso: 'bg-blue-50 text-blue-700',
    resuelto: 'bg-green-50 text-green-700',
    cerrado: 'bg-neutral-100 text-neutral-700',
    cancelado: 'bg-red-50 text-red-700',
  };
  return map[estado?.toLowerCase()] || 'bg-neutral-50 text-neutral-700';
};

const getPrioridadLabel = (p) => {
  const map = { alta: 'Alta', media: 'Media', baja: 'Baja' };
  return map[p?.toLowerCase()] || p || '—';
};

const PQR = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [pqrs, setPqrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPqr, setSelectedPqr] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'peticion',
    prioridad: 'media',
    titulo: '',
    descripcion: '',
    reservationId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadPqrs = async () => {
    try {
      setLoading(true);
      const result = await pqrService.getMyPqr();
      const list = result.data?.pqrs || result.data?.pqr || (Array.isArray(result.data) ? result.data : []);
      setPqrs(list);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar tus PQR.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') loadPqrs();
  }, [activeTab]);

  const handleRowClick = async (pqr) => {
    try {
      const detail = await pqrService.getById(pqr.id);
      setSelectedPqr(detail.data || detail);
      setModalOpen(true);
    } catch {
      setSelectedPqr(pqr);
      setModalOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      setError('Por favor completa el título y la descripción.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        tipo: formData.tipo,
        prioridad: formData.prioridad,
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
      };
      if (formData.reservationId && !isNaN(Number(formData.reservationId))) {
        payload.reservationId = Number(formData.reservationId);
      }
      await pqrService.create(payload);
      setSuccessMsg('PQR creada exitosamente.');
      setFormData({
        tipo: 'peticion',
        prioridad: 'media',
        titulo: '',
        descripcion: '',
        reservationId: '',
      });
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('list');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear la PQR.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Mi cuenta</p>
        <h1 className="mt-1 text-3xl font-bold text-neutral-900">Peticiones, Quejas y Reclamos</h1>
        <p className="mt-2 text-neutral-600">Consulta el estado de tus PQR o crea una nueva solicitud.</p>
      </header>

      <div className="card">
        <div className="flex border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'list'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Mis PQR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'new'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Nueva PQR
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          {activeTab === 'list' && (
            <div>
              {loading ? (
                <div className="py-8 text-center text-neutral-500">Cargando PQR...</div>
              ) : pqrs.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-neutral-700 font-medium">No tienes PQR registradas aún.</p>
                  <p className="mt-1 text-sm text-neutral-500">Crea tu primera solicitud en la pestaña "Nueva PQR".</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="btn-primary mt-4"
                  >
                    Crear PQR
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-neutral-200 text-xs font-semibold uppercase text-neutral-500">
                        <th className="pb-3 pr-4">Radicado</th>
                        <th className="pb-3 pr-4">Fecha</th>
                        <th className="pb-3 pr-4">Tipo</th>
                        <th className="pb-3 pr-4">Estado</th>
                        <th className="pb-3 pr-4">Prioridad</th>
                        <th className="pb-3">Título</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pqrs.map((pqr) => (
                        <tr
                          key={pqr.id}
                          onClick={() => handleRowClick(pqr)}
                          className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 pr-4 font-mono text-sm text-neutral-900">
                            {pqr.numeroRadicado || `#${pqr.id}`}
                          </td>
                          <td className="py-3 pr-4 text-sm text-neutral-600">
                            {formatDate(pqr.createdAt)}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`badge capitalize ${getTipoBadgeClass(pqr.tipo)}`}>
                              {pqr.tipo || '—'}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`badge capitalize ${getEstadoBadgeClass(pqr.estado)}`}>
                              {pqr.estado || 'pendiente'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-sm text-neutral-700 font-medium">
                            {getPrioridadLabel(pqr.prioridad)}
                          </td>
                          <td className="py-3 text-sm text-neutral-900">
                            {pqr.titulo}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'new' && (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Tipo de solicitud</label>
                  <select
                    className="select-field"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="peticion">Petición</option>
                    <option value="queja">Queja</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="sugerencia">Sugerencia</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Prioridad</label>
                  <select
                    className="select-field"
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-field">Título</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Resume brevemente tu solicitud"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">Descripción</label>
                <textarea
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Describe detalladamente tu petición, queja, reclamo o sugerencia..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">ID de Reserva (opcional)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Número de reserva asociada (si aplica)"
                  value={formData.reservationId}
                  onChange={(e) => setFormData({ ...formData, reservationId: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar PQR'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setError('');
                    setFormData({
                      tipo: 'peticion',
                      prioridad: 'media',
                      titulo: '',
                      descripcion: '',
                      reservationId: '',
                    });
                  }}
                >
                  Limpiar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Detalle PQR ${selectedPqr?.numeroRadicado ? `#${selectedPqr.numeroRadicado}` : selectedPqr?.id ? `#${selectedPqr.id}` : ''}`}
        size="lg"
      >
        {selectedPqr && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className={`badge capitalize ${getTipoBadgeClass(selectedPqr.tipo)}`}>
                Tipo: {selectedPqr.tipo || '—'}
              </span>
              <span className={`badge capitalize ${getEstadoBadgeClass(selectedPqr.estado)}`}>
                Estado: {selectedPqr.estado || 'pendiente'}
              </span>
              <span className="badge bg-purple-50 text-purple-700">
                Prioridad: {getPrioridadLabel(selectedPqr.prioridad)}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-neutral-500 mb-1">Título</p>
              <p className="text-lg font-semibold text-neutral-900">{selectedPqr.titulo}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card p-4 bg-neutral-50">
                <p className="text-xs font-semibold uppercase text-neutral-500 mb-1">Fecha de creación</p>
                <p className="text-neutral-900">{formatDate(selectedPqr.createdAt)}</p>
              </div>
              {selectedPqr.reservationId && (
                <div className="card p-4 bg-neutral-50">
                  <p className="text-xs font-semibold uppercase text-neutral-500 mb-1">Reserva asociada</p>
                  <p className="text-neutral-900 font-mono">#{selectedPqr.reservationId}</p>
                </div>
              )}
            </div>

            <div className="card p-4 border-l-4 border-primary-500">
              <p className="text-xs font-semibold uppercase text-neutral-500 mb-2">Descripción</p>
              <p className="text-neutral-800 whitespace-pre-wrap leading-relaxed">
                {selectedPqr.descripcion}
              </p>
            </div>

            {selectedPqr.respuesta && (
              <div className="card p-4 border-l-4 border-green-500 bg-green-50/50">
                <p className="text-xs font-semibold uppercase text-green-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Respuesta
                </p>
                <p className="text-neutral-800 whitespace-pre-wrap leading-relaxed">
                  {selectedPqr.respuesta}
                </p>
                {selectedPqr.updatedAt && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Respondido el {formatDate(selectedPqr.updatedAt)}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PQR;
