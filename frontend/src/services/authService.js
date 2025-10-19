import api from './api';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, data: { token, user } };
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal';
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};