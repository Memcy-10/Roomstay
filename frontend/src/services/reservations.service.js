import apiClient from './apiClient.js';

export const reservationsService = {
  async createReservation(payload) {
    const response = await apiClient.post('/reservations', payload);
    return response.data;
  },

  async getMyReservations() {
    const response = await apiClient.get('/reservations/me');
    return response.data;
  },

  async getHostReservations() {
    const response = await apiClient.get('/reservations/host');
    return response.data;
  },

  async getReservationById(id) {
    const response = await apiClient.get(`/reservations/${id}`);
    return response.data;
  },

  async updateStatus(id, estado) {
    const response = await apiClient.patch(`/reservations/${id}/status`, { estado });
    return response.data;
  },

  async cancelReservation(id) {
    const response = await apiClient.delete(`/reservations/${id}`);
    return response.data;
  },

  async checkAvailability(params) {
    const qs = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/reservations/availability?${qs}`);
    return response.data;
  },
};

export default reservationsService;
