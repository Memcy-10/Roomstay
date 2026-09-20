import apiClient from './apiClient.js';

export const adminService = {
  async getUsers() {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  async createUser(data) {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },
  async updateUser(id, data) {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },
  async deleteUser(id) {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  async getAllReservations() {
    const response = await apiClient.get('/admin/reservations');
    return response.data;
  },

  async updateReservationStatus(id, estado) {
    const response = await apiClient.patch(`/reservations/${id}/status`, { estado });
    return response.data;
  },
};

export default adminService;
