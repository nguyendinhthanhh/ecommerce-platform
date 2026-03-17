import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import reportService from "../../services/reportService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("THIS_MONTH");
  const [selectedYear] = useState(2026);

  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    prevSales: 0,
    lowStock: 0,
  });

  const [lowStockInfo, setLowStockInfo] = useState({
    totalCount: 0,
    name: "Tất cả ổn định",
    stock: 0,
  });

  const [bestSeller, setBestSeller] = useState({
    name: "N/A",
    soldCount: 0,
    thumbnail: null,
  });

  const [paymentStats, setPaymentStats] = useState({});
  const [monthlyRevenue, setMonthlyRevenue] = useState({});

  // 1. Logic chuẩn hóa dữ liệu cho biểu đồ CỘT (Doanh thu 12 tháng)
  const revenueChartData = {
    labels: [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ],
    datasets: [
      {
        label: "Doanh thu",
        // Map dữ liệu từ object {1: val, 2: val} thành array 12 phần tử
        data: Array.from({ length: 12 }, (_, i) => monthlyRevenue[i + 1] || 0),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        hoverBackgroundColor: "#ef4444",
        borderRadius: 8,
        barThickness: 25,
      },
    ],
  };

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { percent: 0, isUp: true };
    const diff = ((current - previous) / previous) * 100;
    return {
      percent: Math.abs(diff).toFixed(1),
      isUp: diff >= 0,
    };
  };

  const getDateRange = (type) => {
    const now = new Date();
    let from = new Date();
    let to = new Date();
    let prevFrom = new Date();
    let prevTo = new Date();

    const formatDate = (date) => date.toISOString().split("T")[0];

    switch (type) {
      case "TODAY":
        from.setHours(0, 0, 0, 0);
        prevFrom.setDate(now.getDate() - 1);
        prevFrom.setHours(0, 0, 0, 0);
        prevTo.setDate(now.getDate() - 1);
        prevTo.setHours(23, 59, 59, 999);
        break;
      case "THIS_WEEK":
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        from = new Date(now.setDate(diff));
        from.setHours(0, 0, 0, 0);
        // Kỳ trước là tuần trước
        prevFrom = new Date(from);
        prevFrom.setDate(from.getDate() - 7);
        prevTo = new Date(from);
        prevTo.setDate(from.getDate() - 1);
        break;
      case "THIS_MONTH":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        // Kỳ trước là tháng trước
        prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevTo = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "THIS_YEAR":
        from = new Date(now.getFullYear(), 0, 1);
        prevFrom = new Date(now.getFullYear() - 1, 0, 1);
        prevTo = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        break;
    }

    return {
      current: { from: formatDate(from), to: formatDate(to) },
      previous: { from: formatDate(prevFrom), to: formatDate(prevTo) },
    };
  };

  // 2. Logic dữ liệu cho biểu đồ TRÒN (Payment Status)
  const paymentChartData = {
    labels: ["Hoàn thành", "Chờ xử lý", "Thất bại"],
    datasets: [
      {
        data: [
          paymentStats.COMPLETED || 0,
          paymentStats.PENDING || 0,
          paymentStats.FAILED || 0,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  const doughnutOptions = {
    cutout: "75%",
    plugins: {
      legend: { display: false },
    },
    maintainAspectRatio: false,
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { current, previous } = getDateRange(filterType);
      const currentYear = new Date().getFullYear();

      const [
        currentRevenue,
        prevRevenue,
        statusData,
        payStats,
        monthlyData,
        bestSellerData,
        lowStockData,
      ] = await Promise.all([
        reportService.getRevenue(current.from, current.to),
        reportService.getRevenue(previous.from, previous.to),
        reportService.getOrderStatusReport(current.from, current.to, null),
        reportService.getPaymentStats(current.from, current.to),
        reportService.getMonthlyRevenue(currentYear),
        reportService.getBestSeller(),
        reportService.getLowStockDetail(10),
      ]);

      setStats((prev) => ({
        ...prev,
        totalSales: currentRevenue.totalRevenue || 0,
        prevSales: prevRevenue.totalRevenue || 0,
        pendingOrders:
          statusData.find(
            (s) => s.status === "PLACED" || s.status === "PENDING",
          )?.total || 0,
      }));

      setPaymentStats(payStats);
      setMonthlyRevenue(monthlyData);
      setBestSeller(bestSellerData);
      setLowStockInfo(lowStockData);
    } catch (error) {
      console.error("Lỗi fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterType]);

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amt || 0);
  };

  const salesTrend = calculateTrend(stats.totalSales, stats.prevSales);

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Header & Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Overview Dashboard
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Hệ thống đang hiển thị dữ liệu năm {new Date().getFullYear()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bộ lọc thời gian linh hoạt */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
            >
              <option value="TODAY">Hôm nay</option>
              <option value="THIS_WEEK">Tuần này</option>
              <option value="THIS_MONTH">Tháng này</option>
              <option value="THIS_YEAR">Năm nay</option>
              <option value="LAST_YEAR">Năm trước</option>
            </select>

            <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-500">
              V1.0.0
            </div>
          </div>
        </div>

        {loading ? (
          /* Hiệu ứng Loading khi đang fetch API */
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">
              Đang cập nhật dữ liệu...
            </p>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Doanh thu{" "}
                    {filterType === "TODAY"
                      ? "hôm nay"
                      : filterType === "THIS_WEEK"
                        ? "tuần này"
                        : filterType === "THIS_MONTH"
                          ? "tháng này"
                          : "giai đoạn này"}
                  </p>
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl text-xl">
                    payments
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(stats.totalSales)}
                    </h3>
                    <p className="text-slate-400 text-[10px] mt-1 font-medium">
                      Kỳ trước: {formatCurrency(stats.prevSales)}
                    </p>
                  </div>

                  {/* Badge Tăng/Giảm % */}
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${
                      salesTrend.isUp
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {salesTrend.isUp ? "trending_up" : "trending_down"}
                    </span>
                    {salesTrend.percent}%
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Đơn chờ xử lý
                  </p>
                  <span className="material-symbols-outlined text-orange-500 bg-orange-500/10 p-2 rounded-xl text-xl">
                    shopping_cart
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats.pendingOrders}
                </h3>
              </div>

              {/* Thay thế Card thứ 3 (Doanh thu tháng này) bằng code dưới đây */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Sản phẩm bán chạy nhất
                  </p>
                  <span className="material-symbols-outlined text-rose-500 bg-rose-500/10 p-2 rounded-xl text-xl">
                    workspace_premium
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Ảnh sản phẩm (Nếu có) */}
                  {bestSeller.thumbnail ? (
                    <img
                      src={bestSeller.thumbnail}
                      alt={bestSeller.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400">
                        image
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-black text-slate-900 dark:text-white truncate"
                      title={bestSeller.name}
                    >
                      {bestSeller.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-black text-primary">
                        {bestSeller.soldCount}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        lượt bán
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thanh progress nhỏ để trang trí */}
                <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Cảnh báo kho hàng
                  </p>
                  <span
                    className={`material-symbols-outlined p-2 rounded-xl text-xl ${
                      lowStockInfo.totalCount > 0
                        ? "text-rose-500 bg-rose-500/10 animate-pulse"
                        : "text-emerald-500 bg-emerald-500/10"
                    }`}
                  >
                    {lowStockInfo.totalCount > 0 ? "warning" : "check_circle"}
                  </span>
                </div>

                <div className="space-y-1">
                  {lowStockInfo.totalCount > 0 ? (
                    <>
                      <h3
                        className="text-sm font-black text-rose-600 dark:text-rose-400 truncate"
                        title={lowStockInfo.name}
                      >
                        {lowStockInfo.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Còn lại trong kho:
                        </p>
                        <span className="text-lg font-black text-rose-600">
                          {lowStockInfo.stock}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-2">
                      <h3 className="text-sm font-bold text-emerald-600">
                        Tất cả ổn định
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Không có sản phẩm sắp hết hàng
                      </p>
                    </div>
                  )}
                </div>

                {/* Hiển thị số lượng các sản phẩm khác nếu có nhiều hơn 1 sản phẩm bị cảnh báo */}
                <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400 italic">
                    {lowStockInfo.totalCount > 1
                      ? `Và ${lowStockInfo.totalCount - 1} sản phẩm khác...`
                      : "Ngưỡng cảnh báo: < 10"}
                  </span>
                  {lowStockInfo.totalCount > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Biểu đồ Cột Doanh Thu */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Hiệu suất doanh thu hàng tháng
                  </h3>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
                    Yearly View
                  </span>
                </div>
                <div className="h-[350px]">
                  <Bar
                    data={revenueChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: "rgba(0,0,0,0.03)" },
                          ticks: { font: { weight: "600" } },
                        },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Biểu đồ Tròn Payment */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">
                  Trạng thái thanh toán
                </h3>

                <div className="relative h-64 mb-8">
                  <Doughnut data={paymentChartData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-black dark:text-white">
                      {(paymentStats.COMPLETED || 0) +
                        (paymentStats.PENDING || 0) +
                        (paymentStats.FAILED || 0)}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Tổng đơn
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-3 mt-auto">
                  {[
                    {
                      label: "Hoàn thành",
                      key: "COMPLETED",
                      color: "bg-emerald-500",
                      raw: paymentStats.COMPLETED,
                    },
                    {
                      label: "Đang chờ",
                      key: "PENDING",
                      color: "bg-orange-400",
                      raw: paymentStats.PENDING,
                    },
                    {
                      label: "Thất bại",
                      key: "FAILED",
                      color: "bg-rose-500",
                      raw: paymentStats.FAILED,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${item.color}`}
                        ></div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          {item.label}
                        </span>
                      </div>
                      <span className="font-bold dark:text-white">
                        {item.raw || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
