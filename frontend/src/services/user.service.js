import apiClient from './apiClient.js';

export const userService = {
  async getProfile() {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  },

  async getFavorites() {
    const response = await apiClient.get('/user/favorites');
    return response.data;
  },

  async toggleFavorite(habitacionId) {
    const response = await apiClient.post(`/user/favorites/${habitacionId}`);
    return response.data;
  },

  async removeFavorite(habitacionId) {
    const response = await apiClient.delete(`/user/favorites/${habitacionId}`);
    return response.data;
  },

  async changePassword(oldPassword, newPassword, confirmPassword) {
    const response = await apiClient.put('/user/change-password', { old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword });
    return response.data;
  },
};

export default userService;
