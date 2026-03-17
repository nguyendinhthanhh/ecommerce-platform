import api from "./api";

const reportService = {
  // Lấy báo cáo theo trạng thái đơn hàng (Pie Chart)
  getOrderStatusReport: async (from, to, statuses) => {
    const response = await api.get("/reports/orders/status", {
      params: {
        from,
        to,
        // Nếu statuses đã là mảng thì join, nếu là chuỗi thì giữ nguyên
        statuses: Array.isArray(statuses) ? statuses.join(",") : statuses,
      },
    });
    return response.data.data;
  },

  // Đếm tổng số đơn hàng
  countOrders: async (from, to) => {
    const response = await api.get("/reports/orders/count", {
      params: { from, to },
    });
    return response.data.data;
  },

  // Xuất file Excel (vẫn giữ year/month vì API export thường dùng cho báo cáo định kỳ)
  exportOrders: async (year, month, status) => {
    const response = await api.get("/reports/orders/export", {
      params: { year, month, status },
      responseType: "blob",
    });
    return response.data;
  },

  // Lấy tổng doanh thu (Đã đổi params sang from/to)
  getRevenue: async (from, to) => {
    const response = await api.get("/reports/orders/revenue", {
      params: { from, to },
    });
    return response.data.data;
  },

  // Thống kê trạng thái thanh toán (Đã đổi params sang from/to)
  getPaymentStats: async (from, to) => {
    const response = await api.get("/reports/payments/stats", {
      params: { from, to },
    });
    return response.data.data;
  },

  // Lấy số lượng đơn hàng chờ xử lý
  getPendingCount: async () => {
    const response = await api.get("/reports/orders/status", {
      params: { statuses: "PLACED" },
    });
    // Tìm trong mảng kết quả record có status là PLACED
    const stats = response.data.data;
    const placed = stats.find((item) => item.status === "PLACED");
    return placed ? placed.total : 0;
  },

  // Doanh thu hàng tháng trong 1 năm (Biểu đồ cột/đường)
  getMonthlyRevenue: async (year) => {
    const response = await api.get("/reports/orders/revenue/monthly", {
      params: { year },
    });
    return response.data.data;
  },

  getBestSeller: async () => {
    const response = await api.get("/reports/products/best-seller");
    return response.data.data;
  },

  getLowStockDetail: async (threshold = 10) => {
    const response = await api.get("/reports/products/low-stock", {
      params: { threshold },
    });
    return response.data.data;
  },
};

export default reportService;
