import apiClient, { API_BASE_URL, getToken } from './apiClient.js';

export const statsService = {
  async getOverview(fechaInicio, fechaFin) {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);
    const qs = params.toString();
    const response = await apiClient.get('/stats/overview' + (qs ? `?${qs}` : ''));
    return response.data;
  },

  async getKpiCards() {
    const response = await apiClient.get('/stats/kpi-cards');
    return response.data;
  },
};

export const reportsService = {
  async getDailySales(fecha) {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await apiClient.get(`/reports/daily-sales${params}`);
    return response.data;
  },

  async downloadDailyPdf(fecha) {
    const token = getToken();
    const params = fecha ? `?fecha=${fecha}` : '';
    const url = `${API_BASE_URL}/reports/daily-sales/pdf${params}`;
    const resp = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resp.ok) throw new Error('No se pudo generar el PDF');
    const blob = await resp.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    const fname = fecha ? `reporte_ventas_${fecha}.pdf` : 'reporte_ventas.pdf';
    link.download = fname;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },

  async downloadDailyExcel(fecha) {
    const token = getToken();
    const params = fecha ? `?fecha=${fecha}` : '';
    const url = `${API_BASE_URL}/reports/daily-sales/excel${params}`;
    const resp = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resp.ok) throw new Error('No se pudo generar el Excel');
    const blob = await resp.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    const fname = fecha ? `reporte_ventas_${fecha}.xlsx` : 'reporte_ventas.xlsx';
    link.download = fname;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },
};

export default statsService;
