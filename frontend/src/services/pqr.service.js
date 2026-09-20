import apiClient from './apiClient.js';

export const pqrService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params.append(k, v);
    });
    const qs = params.toString();
    const response = await apiClient.get('/pqr' + (qs ? `?${qs}` : ''));
    return response.data;
  },

  async getMyPqr() {
    const response = await apiClient.get('/pqr/me');
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/pqr/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post('/pqr', data);
    return response.data;
  },

  async updateStatus(id, estado) {
    const response = await apiClient.patch(`/pqr/${id}/status`, { estado });
    return response.data;
  },

  async answer(id, respuesta) {
    const response = await apiClient.post(`/pqr/${id}/answer`, { respuesta });
    return response.data;
  },
};

export default pqrService;
