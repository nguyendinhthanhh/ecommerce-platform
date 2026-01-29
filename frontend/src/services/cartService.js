import api from "./api";

const cartService = {
  // Get cart
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data.data;
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post("/cart/items", { productId, quantity });
    return response.data.data;
  },

  // Update cart item
  updateQuantity: async (itemId, quantity) => {
    const response = await api.put(
      `/cart/items/${itemId}?quantity=${quantity}`,
    );
    return response.data.data;
  },

  // Remove from cart
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete("/cart");
    return response.data;
  },
};

export default cartService;
