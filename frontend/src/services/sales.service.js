import apiClient from './apiClient.js';

export const salesService = {
  async getSales(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params.append(k, v);
    });
    const qs = params.toString();
    const response = await apiClient.get('/sales' + (qs ? `?${qs}` : ''));
    return response.data;
  },

  async getMySales() {
    const response = await apiClient.get('/sales/me');
    return response.data;
  },

  async getSaleById(id) {
    const response = await apiClient.get(`/sales/${id}`);
    return response.data;
  },

  async createSale(data) {
    const response = await apiClient.post('/sales', data);
    return response.data;
  },

  async createSaleFromReservation(reservationId, metodoPago = 'transferencia') {
    const response = await apiClient.post(`/sales/from-reservation/${reservationId}?metodoPago=${encodeURIComponent(metodoPago)}`);
    return response.data;
  },

  async payReservation(reservationId, metodoPago = 'tarjeta') {
    const response = await apiClient.post(`/sales/pay-reservation/${reservationId}?metodoPago=${encodeURIComponent(metodoPago)}`);
    return response.data;
  },

  async updateStatus(id, estado) {
    const response = await apiClient.patch(`/sales/${id}/status`, { estado });
    return response.data;
  },
};

export default salesService;
