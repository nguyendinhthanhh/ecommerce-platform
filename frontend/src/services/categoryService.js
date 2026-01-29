import api from "./api";
import apiCache, { CACHE_TTL } from "../utils/apiCache";

const categoryService = {
  // Get all categories with filters (with caching)
  getAllCategories: async (params = {}) => {
    const cacheKey = apiCache.generateKey("/categories", params);
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await api.get("/categories", { params });
    const data = response.data.data;

    apiCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    return data;
  },

  // Get category by ID (with caching)
  getCategoryById: async (id) => {
    const cacheKey = `/categories/${id}`;
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await api.get(`/categories/${id}`);
    const data = response.data.data;

    apiCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    return data;
  },

  // Create a new category
  createCategory: async (categoryData) => {
    const response = await api.post("/categories", categoryData);
    // Invalidate cache after creating
    apiCache.invalidatePattern("/categories");
    return response.data.data;
  },

  // Update a category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    // Invalidate cache after updating
    apiCache.invalidate(`/categories/${id}`);
    apiCache.invalidatePattern("/categories");
    return response.data.data;
  },

  // Delete a category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    // Invalidate cache after deleting
    apiCache.invalidate(`/categories/${id}`);
    apiCache.invalidatePattern("/categories");
    return response.data;
  },

  // Invalidate category cache
  invalidateCache: () => {
    apiCache.invalidatePattern("/categories");
  },
};

export default categoryService;
