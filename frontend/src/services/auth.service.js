import apiClient from './apiClient.js';

export const authService = {
  async getRoles() {
    const response = await apiClient.get('/auth/roles');
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async recoverPassword(email) {
    const response = await apiClient.post('/auth/recover-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword, confirmPassword) {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword, confirmPassword });
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
