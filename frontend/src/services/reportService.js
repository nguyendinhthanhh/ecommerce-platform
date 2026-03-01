import api from "./api";

const reportService = {
  getOrderStatusReport: async (from, to, statuses) => {
    const response = await api.get("/reports/orders/status", {
      params: {
        from,
        to,
        statuses,
      },
    });
    return response.data.data;
  },

  countOrders: async (from, to) => {
    const response = await api.get("/reports/orders/count", {
      params: { from, to },
    });
    return response.data.data;
  },

  exportOrders: async (year, month, status) => {
    const response = await api.get("/reports/orders/export", {
      params: {
        year,
        month,
        status,
      },
      responseType: "blob",
    });
    return response.data;
  },

  getPendingCount: async () => {
    const response = await api.get("/reports/orders/status", {
      params: { statuses: "PLACED" },
    });
    return response.data.data?.[0]?.count || 0;
  },
};

export default reportService;
