import axios from "axios";
import storage from "../utils/storage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = storage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 403 (Forbidden) - user doesn't have permission
    if (error.response?.status === 403) {
      const user = storage.getJSON("user");
      const userRole = user?.role || "GUEST";
      const requestUrl = originalRequest.url;

      // Don't log error for cart endpoint (ADMIN/STAFF might not have cart access)
      if (!requestUrl?.includes("/cart")) {
        console.error(
          `Access denied (403): User role [${userRole}] does not have permission for [${requestUrl}]`
        );
      }

      // Simple role-based protection for specific areas
      if (userRole !== "ADMIN" && requestUrl?.includes("/admin/")) {
        console.warn("Redirecting non-admin user from admin endpoint");
        window.location.href = "/";
      } else if (userRole !== "SELLER" && requestUrl?.includes("/seller/")) {
        console.warn("Redirecting non-seller user from seller endpoint");
        window.location.href = "/";
      }

      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if this is a public endpoint that doesn't require auth
      const publicEndpoints = [
        '/products',
        '/categories',
        '/reviews/product',
        '/reviews/check-eligibility',
        '/auth/'
      ];
      
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        originalRequest.url?.includes(endpoint)
      );

      // If it's a public endpoint, just return the error without trying to refresh
      if (isPublicEndpoint && originalRequest.method?.toLowerCase() === 'get') {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = storage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {
              refreshToken,
            },
          );

          const { accessToken } = response.data.data;
          storage.setItem("accessToken", accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        storage.removeItem("accessToken");
        storage.removeItem("refreshToken");
        storage.removeItem("user");
        
        // Only redirect to login if not on a public page
        if (!isPublicEndpoint) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
