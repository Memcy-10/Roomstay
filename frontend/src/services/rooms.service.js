import apiClient from './apiClient.js';

export const roomsService = {
  async getRooms(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString();
    const response = await apiClient.get(`/rooms/${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getMyRooms() {
    const response = await apiClient.get('/rooms/me');
    return response.data;
  },

  async getRoomById(id) {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data;
  },

  async createRoom(roomData) {
    const response = await apiClient.post('/rooms/', roomData);
    return response.data;
  },

  async updateRoom(id, roomData) {
    const response = await apiClient.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  async deleteRoom(id) {
    const response = await apiClient.delete(`/rooms/${id}`);
    return response.data;
  },
};

export default roomsService;
