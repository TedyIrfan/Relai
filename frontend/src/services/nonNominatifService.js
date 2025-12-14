import api from './api';

const nonNominatifService = {
  // Get all non-nominatifs
  getAll: async () => {
    const response = await api.get('/non-nominatifs');
    return response.data;
  },

  // Get single non-nominatif
  getById: async (id) => {
    const response = await api.get(`/non-nominatifs/${id}`);
    return response.data;
  },

  // Create new non-nominatif
  create: async (data) => {
    const response = await api.post('/non-nominatifs', data);
    return response.data;
  },

  // Update non-nominatif
  update: async (id, data) => {
    const response = await api.put(`/non-nominatifs/${id}`, data);
    return response.data;
  },

  // Delete non-nominatif
  delete: async (id) => {
    const response = await api.delete(`/non-nominatifs/${id}`);
    return response.data;
  },

  // Submit draft non-nominatif
  submit: async (id) => {
    const response = await api.post(`/non-nominatifs/${id}/submit`);
    return response.data;
  },
};

export default nonNominatifService;