import apiClient, { API_BASE_URL, getToken } from './apiClient.js';

export const invoicesService = {
  async getInvoices(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params.append(k, v);
    });
    const qs = params.toString();
    const response = await apiClient.get('/invoices' + (qs ? `?${qs}` : ''));
    return response.data;
  },

  async getMyInvoices() {
    const response = await apiClient.get('/invoices/me');
    return response.data;
  },

  async getInvoiceById(id) {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  async createInvoice(data) {
    const response = await apiClient.post('/invoices', data);
    return response.data;
  },

  async updateStatus(id, estado) {
    const response = await apiClient.patch(`/invoices/${id}/status`, { estado });
    return response.data;
  },

  async downloadInvoicePdf(id) {
    const token = getToken();
    const url = `${API_BASE_URL}/reports/invoice/${id}/pdf`;
    const resp = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resp.ok) throw new Error('No se pudo descargar la factura');
    const blob = await resp.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `factura_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },
};

export default invoicesService;
