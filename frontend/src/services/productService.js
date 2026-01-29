import api from "./api";
import apiCache, { CACHE_TTL } from "../utils/apiCache";

const productService = {
  // Get all products with pagination (with caching)
  getAllProducts: async (
    page = 0,
    size = 12,
    sortBy = "createdAt",
    sortDir = "desc",
  ) => {
    const cacheKey = apiCache.generateKey("/products", {
      page,
      size,
      sortBy,
      sortDir,
    });
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await api.get("/products", {
      params: { page, size, sortBy, sortDir },
    });
    const data = response.data.data;

    apiCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    return data;
  },

  // Search products (no caching - dynamic search)
  searchProducts: async (keyword, page = 0, size = 12) => {
    const response = await api.get("/products/search", {
      params: { keyword, page, size },
    });
    return response.data.data;
  },

  // Get products by category (with caching)
  getProductsByCategory: async (categoryId, page = 0, size = 12) => {
    const cacheKey = apiCache.generateKey(`/products/category/${categoryId}`, {
      page,
      size,
    });
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await api.get(`/products/category/${categoryId}`, {
      params: { page, size },
    });
    const data = response.data.data;

    apiCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    return data;
  },

  // Get product by ID (with caching)
  getProductById: async (id) => {
    const cacheKey = `/products/${id}`;
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await api.get(`/products/${id}`);
    const data = response.data.data;

    apiCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    return data;
  },

  // Get top selling products (with caching)
  getTopSellingProducts: async (page = 0, size = 10) => {
    const cacheKey = apiCache.generateKey("/products/top-selling", {
      page,
      size,
    });
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await api.get("/products/top-selling", {
      params: { page, size },
    });
    const data = response.data.data;

    apiCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    return data;
  },

  // Get newest products (with caching)
  getNewestProducts: async (page = 0, size = 10) => {
    const cacheKey = apiCache.generateKey("/products/newest", { page, size });
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await api.get("/products/newest", {
      params: { page, size },
    });
    const data = response.data.data;

    apiCache.set(cacheKey, data, CACHE_TTL.MEDIUM);
    return data;
  },

  // Invalidate product cache (call after product updates)
  invalidateCache: () => {
    apiCache.invalidatePattern("/products");
  },

  // Invalidate specific product cache
  invalidateProductCache: (productId) => {
    apiCache.invalidate(`/products/${productId}`);
    apiCache.invalidatePattern("/products/top-selling");
    apiCache.invalidatePattern("/products/newest");
  },
};

export default productService;
