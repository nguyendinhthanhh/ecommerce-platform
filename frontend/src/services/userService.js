import api from "./api";
import apiCache, { CACHE_TTL } from "../utils/apiCache";

const userService = {
  // Get current user profile
  getMyProfile: async () => {
    const cacheKey = "/users/me";
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await api.get("/users/me");
    const data = response.data.data;

    apiCache.set(cacheKey, data, CACHE_TTL.SHORT);
    return data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put("/users/me", profileData);
    // Invalidate cache after update
    apiCache.invalidate("/users/me");
    return response.data.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post("/users/me/change-password", passwordData);
    return response.data;
  },

  // Invalidate profile cache
  invalidateCache: () => {
    apiCache.invalidate("/users/me");
  },

  // ==================== ADMIN ENDPOINTS ====================

  // Get all users (admin)
  getAllUsers: async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  // Get user by ID (admin)
  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  // Create new user (admin)
  createUser: async (userData) => {
    const response = await api.post("/admin/users", userData);
    return response.data.data;
  },

  // Update user (admin)
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data.data;
  },

  // Delete user (admin)
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

export default userService;
