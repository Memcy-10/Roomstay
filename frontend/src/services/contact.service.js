import apiClient from './apiClient.js';

export const contactService = {
  async sendMessage(messageData) {
    const response = await apiClient.post('/contact', messageData);
    return response.data;
  },

  async getAll() {
    const response = await apiClient.get('/contact');
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/contact/${id}`);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/contact/${id}`);
    return response.data;
  },
};

export default contactService;
