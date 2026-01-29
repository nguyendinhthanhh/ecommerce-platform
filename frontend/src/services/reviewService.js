import api from "./api";

const reviewService = {
  // Get all reviews for management (admin)
  getAllReviews: async (
    page = 0,
    size = 10,
    sortBy = "createdAt",
    sortDir = "desc",
  ) => {
    const response = await api.get("/reviews/management", {
      params: { page, size, sortBy, sortDir },
    });
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

  // Update review status (approve/reject)
  updateReviewStatus: async (reviewId, status) => {
    const response = await api.patch(`/reviews/${reviewId}/status`, { status });
    return response.data;
  },

  // Get review statistics
  getReviewStats: async () => {
    const response = await api.get("/reviews/stats");
    return response.data.data;
  },
};

export default reviewService;
