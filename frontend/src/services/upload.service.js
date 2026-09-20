import apiClient from './apiClient.js';

export const uploadService = {
  async uploadImage(file, onProgress) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
    return response.data;
  },
};

export default uploadService;
