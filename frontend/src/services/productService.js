import api from './api';

const productService = {
  // Get all products with pagination
  getAllProducts: async (page = 0, size = 12, sortBy = 'createdAt', sortDir = 'desc') => {
    const response = await api.get('/products', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data.data;
  },

  // Search products
  searchProducts: async (keyword, page = 0, size = 12) => {
    const response = await api.get('/products/search', {
      params: { keyword, page, size }
    });
    return response.data.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId, page = 0, size = 12) => {
    const response = await api.get(`/products/category/${categoryId}`, {
      params: { page, size }
    });
    return response.data.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // Get top selling products
  getTopSellingProducts: async (page = 0, size = 10) => {
    const response = await api.get('/products/top-selling', {
      params: { page, size }
    });
    return response.data.data;
  },

  // Get newest products
  getNewestProducts: async (page = 0, size = 10) => {
    const response = await api.get('/products/newest', {
      params: { page, size }
    });
    return response.data.data;
  },
};

export default productService;
