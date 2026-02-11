import api from "./api";

const reviewService = {
  // Get all reviews for management (admin)
  getAllReviews: async (
    filters = {},
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
  ) => {
    // Determine status from filters if provided, for backward compatibility or direct usage
    const params = {
      ...filters,
      page,
      size,
      sortBy,
      sortDir
    };

    // Clean up undefined/null/empty params
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    const response = await api.get("/reviews/management", { params });
    return response.data.data;
  },

  // Get reviews by product
  getReviewsByProduct: async (
    productId,
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
  ) => {
    const response = await api.get(`/reviews/product/${productId}`, {
      params: { page, size, sortBy, sortDir },
    });
    return response.data.data;
  },

  // Get review by ID
  getReviewById: async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data.data;
  },

  // Delete review (admin)
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Admin delete review (any review)
  adminDeleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/admin/${reviewId}`);
    return response.data;
  },

  // Update review status (approve/reject)
  updateReviewStatus: async (reviewId, status) => {
    const response = await api.patch(`/reviews/${reviewId}/status`, { status });
    return response.data;
  },

  // Get review statistics
  getReviewStats: async () => {
    // This endpoint might need to be created in backend if not exists, 
    // or we calculate from the list. 
    // The controller has /product/{id}/statistics but not global stats yet?
    // Actually ReviewController doesn't have a global /stats endpoint.
    // I will mock it or just calculate from the list for now if needed.
    // But wait, the previous code called /reviews/stats. Let me check the controller again.
    // Controller has: getProductReviewStatistics, but no general stats.
    // I will implementation calculation in frontend for now.
    return {};
  },

  // Reply to review
  replyToReview: async (reviewId, reply) => {
    const response = await api.put(`/reviews/${reviewId}/reply`, { reply });
    return response.data.data;
  },

  // Create review
  createReview: async (reviewData) => {
    const response = await api.post("/reviews", reviewData);
    return response.data.data;
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data.data;
  },

  // Check eligibility to review a product
  checkEligibility: async (productId) => {
    const response = await api.get(`/reviews/check-eligibility/${productId}`);
    return response.data.data;
  },

  // Report review
  reportReview: async (reviewId, reason) => {
    const response = await api.post(`/reviews/${reviewId}/report`, { 
      reportReason: reason 
    });
    return response.data;
  },

  // Get product review statistics
  getProductReviewStatistics: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}/statistics`);
    return response.data.data;
  },
};

export default reviewService;
