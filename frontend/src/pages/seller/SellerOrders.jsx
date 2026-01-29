import { useState, useEffect } from "react";
import SellerLayout from "../../components/layout/SellerLayout";
import orderService from "../../services/orderService";
import { TableRowSkeleton } from "../../components/common/LoadingSpinner";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 42850.12,
    revenueGrowth: 14.2,
    pendingOrders: 124,
    newOrders: 5,
    toShip: 38,
  });

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getSellerOrders();
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      // Mock data for demo
      setOrders([
        {
          id: 8821,
          productName: "Wireless Headphones XT-200",
          productImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC34w-NU0fVQbnvbRDU_PvuP9poz6NJVsbWIMPo0EdDVILJ4KT5nhD0Oo8HXARV4LmupFoO82BeTuRZ05IpCkPdIlU5blVTmXLmTQ4mZCH9w4s0JBo0lOWhdSDahKd0HfDRisBvZCcvkj4OkZgryxhs_hk51KbYynZrdUm6p1xyST_CBERmifPbZSD-dgdp67llHXLhyOuhZaouNJ2aIYLS8mKazkQLnQHBd2nso7Pr1eSA_s03TtjExZgzH3AFjaL76boG3TdW5nA",
          customerName: "Sarah Jenkins",
          customerEmail: "sarah.j@example.com",
          status: "TO_SHIP",
          amount: 129.0,
        },
        {
          id: 8820,
          productName: "Smart Watch Pro Series 7",
          productImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD2HJb5OT_bdf5zOnR1FhwJN2dLzJy3G6-zQWq6spQXxepXqUaYLRoOUe4nN-LAJWrqWMGpmCrJm2t39JFZ7ovsBn3f6pMt6qqeIVJPcXjxw9-xLA-snj4ZwYcCFm5CTGr2BCOefEX-ONg7XcrF3mda5YYQXCofpKpU_6nF1j3L0OrLfsEpaYLBqmwoIpJXNySNPawY1qY05k5KMduM5CwxlN8kqEbkd_1Hya6dO85R8_ERwZhB-2r_mPIZiG-IGL9AujjVT1qXc4w",
          customerName: "Michael Chen",
          customerEmail: "m.chen88@gmail.com",
          status: "PENDING",
          amount: 299.5,
        },
        {
          id: 8819,
          productName: "Minimalist Leather Wallet",
          productImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAoI7Gdco89BXzJUWqYGc4SgCS3RPgWR2TYFLVugLEuw79BOrqg81hFdNguI9WK9rmpfUuYT9O4gmvopq0rtqu8qWiVccWjsPX70IVsMq5oPUfaOrG8bpqtjrd0zcSbL_FV9XT4fRn59VThIRFAfMCxGwh1mm7DFIJ-Eff5j1ITUAVlunchQ3wMCxLpkTCVSZVdays8cWq9ZyQJMmkUrXpXxg9gIAs3L-AKAWkj3J9GzrAV45iF__hRWArLMoQK1mAAmR0fY2L8ZyQ",
          customerName: "David Miller",
          customerEmail: "dmiller@web.com",
          status: "COMPLETED",
          amount: 45.0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      TO_SHIP: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        label: "To Ship",
      },
      PENDING: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-700 dark:text-orange-400",
        label: "Pending",
      },
      COMPLETED: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        label: "Completed",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${config.bg} ${config.text} text-[10px] font-bold uppercase tracking-tight`}
      >
        <span
          className={`size-1.5 rounded-full ${config.text.includes("blue") ? "bg-blue-500" : config.text.includes("orange") ? "bg-orange-500" : "bg-green-500"}`}
        ></span>
        {config.label}
      </span>
    );
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  return (
    <SellerLayout>
      <div className="flex-1 overflow-y-auto p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">
                Total Revenue
              </span>
              <span className="material-symbols-outlined text-primary">
                payments
              </span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold tracking-tight">
                ${stats.totalRevenue.toFixed(2)}
              </p>
              <span className="text-xs font-bold text-green-500 pb-1">
                +{stats.revenueGrowth}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">
                Pending Orders
              </span>
              <span className="material-symbols-outlined text-orange-500">
                pending_actions
              </span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold tracking-tight">
                {stats.pendingOrders}
              </p>
              <span className="text-xs font-bold text-orange-500 pb-1">
                +{stats.newOrders} new
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">
                To Ship
              </span>
              <span className="material-symbols-outlined text-blue-500">
                local_shipping
              </span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold tracking-tight">
                {stats.toShip}
              </p>
              <span className="text-xs font-bold text-slate-500 pb-1">
                Ready for pickup
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 border-b-2 text-sm font-bold transition-colors ${
                  activeTab === "all"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 border-b-2 text-sm font-medium transition-colors relative ${
                  activeTab === "pending"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Pending
                <span className="absolute top-3 -right-4 px-1.5 py-0.5 bg-orange-500 text-[10px] text-white rounded-full">
                  5
                </span>
              </button>
              <button
                onClick={() => setActiveTab("toship")}
                className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === "toship"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                To Ship
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === "completed"
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Completed
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-lg">
                  filter_list
                </span>
                Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">
                <span className="material-symbols-outlined text-lg">
                  download
                </span>
                Export
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedOrders.length > 0 && (
            <div className="bg-primary/5 px-6 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {selectedOrders.length} Orders Selected
                </span>
                <div className="h-4 w-[1px] bg-primary/20"></div>
                <button className="text-xs font-bold text-primary hover:underline">
                  Batch Print Labels
                </button>
                <button className="text-xs font-bold text-primary hover:underline">
                  Mark as Shipped
                </button>
              </div>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                      checked={
                        selectedOrders.length === orders.length &&
                        orders.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  // Skeleton loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRowSkeleton key={index} columns={6} />
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-4xl text-slate-300">
                            shopping_bag
                          </span>
                        </div>
                        <h3 className="text-lg font-bold">No orders yet</h3>
                        <p className="text-sm text-slate-500 max-w-xs text-center mt-1">
                          We couldn't find any orders matching your current
                          filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-primary/5 transition-colors group"
                      style={{
                        backgroundColor:
                          order.id % 2 === 0
                            ? "rgba(37, 19, 236, 0.02)"
                            : "transparent",
                      }}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-primary focus:ring-primary"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-10 rounded-lg bg-cover bg-center border border-slate-200 dark:border-slate-700"
                            style={{
                              backgroundImage: `url(${order.productImage})`,
                            }}
                          ></div>
                          <div>
                            <p className="text-sm font-bold">#ORD-{order.id}</p>
                            <p className="text-xs text-slate-500">
                              {order.productName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-sm">
                        ${order.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === "TO_SHIP" && (
                            <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">
                              Print Label
                            </button>
                          )}
                          {order.status === "PENDING" && (
                            <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">
                              Accept Order
                            </button>
                          )}
                          {order.status === "COMPLETED" && (
                            <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                              View Invoice
                            </button>
                          )}
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <span className="material-symbols-outlined text-xl">
                              more_vert
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {orders.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">
                Showing 1 to {orders.length} of 1,240 orders
              </p>
              <div className="flex items-center gap-1">
                <button className="size-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800">
                  <span className="material-symbols-outlined text-lg">
                    chevron_left
                  </span>
                </button>
                <button className="size-8 rounded bg-primary text-white flex items-center justify-center text-xs font-bold">
                  1
                </button>
                <button className="size-8 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center text-xs font-medium">
                  2
                </button>
                <button className="size-8 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center text-xs font-medium">
                  3
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button className="size-8 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center text-xs font-medium">
                  42
                </button>
                <button className="size-8 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800">
                  <span className="material-symbols-outlined text-lg">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerOrders;
