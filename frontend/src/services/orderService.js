import api from './api';

const orderService = {
  // Place order
  placeOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    // Return the whole data object to be safe, as some APIs don't wrap in .data
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  },

  // Get my orders
  getMyOrders: async (page = 0, size = 10) => {
    const response = await api.get('/orders/my-orders', {
      params: { page, size }
    });
    return response.data.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data.data;
  },

  // Get shop orders (for sellers)
  getShopOrders: async (shopId, status = null, page = 0, size = 10) => {
    const response = await api.get(`/orders/shop/${shopId}`, {
      params: { status, page, size }
    });
    return response.data.data;
  },

  // Update order status (for sellers)
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  // Get seller orders (all orders for current seller's shop)
  getSellerOrders: async (status = null, page = 0, size = 10) => {
    try {
      const response = await api.get('/orders/seller/orders', {
        params: { status, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      throw error;
    }
  },

  // Initiate payment
  createPayment: async (paymentMethod, orderCode) => {
    // Map internal payment method to API path
    const pathMap = {
      'VNPAY': 'vn_pay',
      'MOMO': 'momo'
    };

    const path = pathMap[paymentMethod] || 'vn_pay';
    const response = await api.post(`/payment/${path}`, null, {
      params: { orderCode }
    });
    return response.data; // Should return the payment URL string or an object containing it
  },
};

export default orderService;
