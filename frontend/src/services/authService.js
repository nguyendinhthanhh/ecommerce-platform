import api from './api';
import storage from '../utils/storage';

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data.data;
    
    // Extract user info from response
    const user = {
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role
    };
    
    // Store tokens and user info
    storage.setItem('accessToken', data.accessToken);
    storage.setItem('refreshToken', data.refreshToken);
    storage.setJSON('user', user);
    
    return { ...response.data, data: { ...data, user } };
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const data = response.data.data;
    
    // Extract user info from response
    const user = {
      id: data.userId,
      email: data.email,
      fullName: data.fullName,
      role: data.role
    };
    
    // Store tokens and user info
    storage.setItem('accessToken', data.accessToken);
    storage.setItem('refreshToken', data.refreshToken);
    storage.setJSON('user', user);
    
    return { ...response.data, data: { ...data, user } };
  },

  // Logout
  logout: async () => {
    const refreshToken = storage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local storage
    storage.removeItem('accessToken');
    storage.removeItem('refreshToken');
    storage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = storage.getItem('accessToken');
    return !!token;
  },

  // Get stored user info
  getUser: () => {
    return storage.getJSON('user');
  },

  // Get redirect path based on user role
  getRedirectPath: (user) => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SELLER':
        return '/seller/dashboard';
      case 'CUSTOMER':
      default:
        return '/';
    }
  },
};

export default authService;
