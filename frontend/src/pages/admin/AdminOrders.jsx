import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import orderService from "../../services/orderService";
import { toast, Toaster } from "react-hot-toast";
import { OrderTableRowSkeleton } from "../../components/common/LoadingSpinner";
import reportService from "../../services/reportService";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    dateFrom: "",
    dateTo: "",
    paymentStatus: "",
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState(new Set());

  const [stats, setStats] = useState({
    total: 0,
    placed: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  const [showExportPopup, setShowExportPopup] = useState(false);
  const [exportDate, setExportDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchOrders = async (page = 0) => {
    try {
      if (orders.length === 0) setLoading(true);
      else setRefreshing(true);

      const data = await orderService.getAllOrders(
        filters.status || null,
        page,
        pagination.size,
      );

      setOrders(data.content);
      setPagination((prev) => ({
        ...prev,
        page: data.pageNumber,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      }));

      await fetchStats();
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [statusReport, totalCountData] = await Promise.all([
        reportService.getOrderStatusReport(null, null),
        reportService.countOrders(null, null),
      ]);

      console.log("Dữ liệu Report về:", statusReport);

      const newStats = {
        total: totalCountData.totalOrders || 0,
        placed: statusReport.find((r) => r.status === "PLACED")?.total || 0,
        confirmed:
          statusReport.find((r) => r.status === "CONFIRMED")?.total || 0,
        shipped: statusReport.find((r) => r.status === "SHIPPED")?.total || 0,
        delivered:
          statusReport.find((r) => r.status === "DELIVERED")?.total || 0,
        cancelled:
          statusReport.find((r) => r.status === "CANCELLED")?.total || 0,
        totalRevenue:
          statusReport.find((r) => r.status === "DELIVERED")?.revenue || 0,
      };

      setStats(newStats);
    } catch (error) {
      console.error("Lỗi khi lấy stats:", error);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setShowOrderModal(false);
      }
      fetchOrders(pagination.page);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update status";
      toast.error(message);
    }
  };

  const handleSearch = () => {
    fetchOrders(0);
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      paymentStatus: "",
    });
    setTimeout(() => fetchOrders(0), 100);
  };

  const hasActiveFilters = () => {
    return (
      filters.status ||
      filters.search ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.paymentStatus
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.search) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.paymentStatus) count++;
    return count;
  };

  const toggleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o.id)));
    }
  };

  const handleExecuteExport = async () => {
    const toastId = toast.loading(
      `Đang chuẩn bị dữ liệu tháng ${exportDate.month}/${exportDate.year}...`,
    );
    setShowExportPopup(false);

    try {
      const status = filters.status || null;

      const blob = await reportService.exportOrders(
        exportDate.year,
        exportDate.month,
        status,
      );

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;

      const fileName = `Orders_${exportDate.month}_${exportDate.year}${status ? "_" + status : ""}.xlsx`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất dữ liệu thành công!", { id: toastId });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất file. Vui lòng thử lại.", { id: toastId });
    }
  };

  const handlePrintInvoice = (order) => {
    toast.success("Preparing invoice for print...");
    // TODO: Implement print logic
  };

  const getStatusBadge = (status) => {
    const styles = {
      PLACED:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      CONFIRMED:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      SHIPPED:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      DELIVERED:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      CANCELLED:
        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
      RETURNED:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return styles[status] || "bg-slate-100 text-slate-700";
  };

  const getStatusIcon = (status) => {
    const icons = {
      PLACED: "shopping_cart",
      CONFIRMED: "check_circle",
      SHIPPED: "local_shipping",
      DELIVERED: "done_all",
      CANCELLED: "cancel",
      RETURNED: "keyboard_return",
    };
    return icons[status] || "receipt";
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amt);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderTimeline = (order) => {
    const timeline = [];

    if (order.createdAt) {
      timeline.push({
        status: "PLACED",
        label: "Order Placed",
        time: order.createdAt,
        icon: "shopping_cart",
        color: "blue",
      });
    }

    if (order.confirmedAt) {
      timeline.push({
        status: "CONFIRMED",
        label: "Order Confirmed",
        time: order.confirmedAt,
        icon: "check_circle",
        color: "indigo",
      });
    }

    if (order.shippedAt) {
      timeline.push({
        status: "SHIPPED",
        label: "Order Shipped",
        time: order.shippedAt,
        icon: "local_shipping",
        color: "orange",
      });
    }

    if (order.deliveredAt) {
      timeline.push({
        status: "DELIVERED",
        label: "Order Delivered",
        time: order.deliveredAt,
        icon: "done_all",
        color: "emerald",
      });
    }

    return timeline;
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">
                receipt_long
              </span>
              Order Management
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Monitor and process all platform orders
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchOrders(pagination.page)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Làm mới
            </button>

            <button
              onClick={() => setShowExportPopup(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                download
              </span>
              {filters.dateFrom
                ? `Xuất Excel tháng ${new Date(filters.dateFrom).getMonth() + 1}/${new Date(filters.dateFrom).getFullYear()}`
                : "Xuất Excel tháng này"}
            </button>
          </div>
        </div>

        {/* Enhanced Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Total Orders */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
                  receipt_long
                </span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
              Total Orders
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {pagination.totalElements}
            </h3>
          </div>

          {/* New Orders */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-300">
                  shopping_cart
                </span>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                New
              </span>
            </div>
            <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide mb-1">
              Placed
            </p>
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.placed}
            </h3>
          </div>

          {/* Confirmed */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-200 dark:bg-indigo-800 rounded-lg">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-300">
                  check_circle
                </span>
              </div>
            </div>
            <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-1">
              Confirmed
            </p>
            <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {stats.confirmed}
            </h3>
          </div>

          {/* Shipping */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-300">
                  local_shipping
                </span>
              </div>
            </div>
            <p className="text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wide mb-1">
              Shipped
            </p>
            <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {stats.shipped}
            </h3>
          </div>

          {/* Delivered */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-300">
                  done_all
                </span>
              </div>
            </div>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-1">
              Delivered
            </p>
            <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.delivered}
            </h3>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-300">
                  payments
                </span>
              </div>
            </div>
            <p className="text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wide mb-1">
              Revenue
            </p>
            <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(stats.totalRevenue)}
            </h3>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">
                filter_alt
              </span>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Filters
              </h3>
              {hasActiveFilters() && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              {showAdvancedFilters ? "Hide" : "Show"} Advanced
              <span className="material-symbols-outlined text-lg">
                {showAdvancedFilters ? "expand_less" : "expand_more"}
              </span>
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Search Orders
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Order code, customer name, phone..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Order Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="">All Statuses</option>
                  <option value="PLACED">Placed</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RETURNED">Returned</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    search
                  </span>
                  Search
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, paymentStatus: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">All Payments</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
          {/* Refreshing indicator - subtle top bar */}
          {refreshing && !loading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 z-10 overflow-hidden">
              <div className="h-full bg-primary animate-[shimmer_1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Order Code
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <OrderTableRowSkeleton rows={pagination.size} />
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-slate-400">
                            receipt_long
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            No orders found
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Try adjusting your filters
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          #{order.orderCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {order.customerName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {order.shippingPhone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined">
                            visibility
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing page{" "}
                <span className="font-medium">{pagination.page + 1}</span> of{" "}
                <span className="font-medium">{pagination.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 0}
                  onClick={() => fetchOrders(pagination.page - 1)}
                  className="px-3 py-1 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page === pagination.totalPages - 1}
                  onClick={() => fetchOrders(pagination.page + 1)}
                  className="px-3 py-1 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowOrderModal(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-bold dark:text-white">
                  Order Details
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  #{selectedOrder.orderCode}
                </p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto space-y-8">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Customer info
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedOrder.customerName}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedOrder.customerEmail}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedOrder.shippingPhone}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Shipping Address
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Order Items
                </h4>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-500">
                          Product
                        </th>
                        <th className="px-4 py-3 font-bold text-slate-500 text-center">
                          Qty
                        </th>
                        <th className="px-4 py-3 font-bold text-slate-500 text-right">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.productThumbnail && (
                                <img
                                  src={item.productThumbnail}
                                  alt={item.productName}
                                  className="w-10 h-10 rounded object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://via.placeholder.com/40x40?text=No+Image";
                                  }}
                                />
                              )}
                              <span className="font-medium text-slate-900 dark:text-white">
                                {item.productName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                            {formatCurrency(item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                      <tr className="font-bold text-slate-900 dark:text-white">
                        <td colSpan="2" className="px-4 py-3 text-right">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right text-primary">
                          {formatCurrency(selectedOrder.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status Actions */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Actions
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedOrder.status === "PLACED" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedOrder.id, "CONFIRMED")
                        }
                        className="flex-1 bg-primary text-white text-sm font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedOrder.id, "CANCELLED")
                        }
                        className="flex-1 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-bold py-3 px-6 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
                      >
                        Reject Order
                      </button>
                    </>
                  )}
                  {selectedOrder.status === "CONFIRMED" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, "SHIPPED")
                      }
                      className="flex-1 bg-indigo-600 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                    >
                      Ship Order
                    </button>
                  )}
                  {selectedOrder.status === "SHIPPED" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, "DELIVERED")
                      }
                      className="flex-1 bg-emerald-600 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {["DELIVERED", "CANCELLED"].includes(
                    selectedOrder.status,
                  ) && (
                    <div className="w-full text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-500 text-sm italic">
                      This order is completed and no further actions are
                      available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Popup Chọn thời gian Export */}
      {showExportPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowExportPopup(false)}
          ></div>

          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">
                    sim_card_download
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Xuất Báo Cáo
                  </h3>
                  <p className="text-sm text-slate-500">
                    Chọn thời gian xuất file Excel
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">
                    Tháng
                  </label>
                  <select
                    value={exportDate.month}
                    onChange={(e) =>
                      setExportDate({
                        ...exportDate,
                        month: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Tháng {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase px-1">
                    Năm
                  </label>
                  <select
                    value={exportDate.year}
                    onChange={(e) =>
                      setExportDate({
                        ...exportDate,
                        year: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>
                        Năm {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ghi chú về Filter Status nếu có */}
              {filters.status && (
                <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-sm">
                    filter_list
                  </span>
                  <span>
                    Đang áp dụng lọc trạng thái:{" "}
                    <strong>{filters.status}</strong>
                  </span>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowExportPopup(false)}
                  className="flex-1 py-3 px-4 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleExecuteExport}
                  className="flex-1 py-3 px-4 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 transition-all"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
