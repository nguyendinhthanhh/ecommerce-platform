import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import orderService from '../../services/orderService';
import { toast, Toaster } from 'react-hot-toast';
import { OrderTableRowSkeleton } from '../../components/common/LoadingSpinner';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Advanced filters
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        dateFrom: '',
        dateTo: '',
        paymentStatus: ''
    });

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState(new Set());

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipping: 0,
        delivered: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0
    });

    const fetchOrders = async (page = 0) => {
        try {
            if (orders.length === 0) setLoading(true);
            else setRefreshing(true);

            // Fetch với status filter từ backend
            const data = await orderService.getAllOrders(
                filters.status || null,
                page,
                pagination.size
            );

            // Apply client-side filters
            let filteredOrders = data.content;

            // Search filter (order code, customer name, phone)
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredOrders = filteredOrders.filter(order =>
                    order.orderCode?.toLowerCase().includes(searchLower) ||
                    order.customerName?.toLowerCase().includes(searchLower) ||
                    order.shippingPhone?.includes(filters.search)
                );
            }

            // Date range filter
            if (filters.dateFrom) {
                const fromDate = new Date(filters.dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                filteredOrders = filteredOrders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= fromDate;
                });
            }

            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                filteredOrders = filteredOrders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate <= toDate;
                });
            }

            // Payment status filter
            if (filters.paymentStatus) {
                filteredOrders = filteredOrders.filter(order =>
                    order.payment?.status === filters.paymentStatus
                );
            }

            setOrders(filteredOrders);
            setPagination({
                ...pagination,
                page: data.pageNumber,
                totalPages: data.totalPages,
                totalElements: filteredOrders.length // Update với filtered count
            });

            // Calculate stats from filtered data
            calculateStats(filteredOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const calculateStats = (ordersList) => {
        const newStats = {
            total: pagination.totalElements,
            pending: ordersList.filter(o => o.status === 'PENDING').length,
            confirmed: ordersList.filter(o => o.status === 'CONFIRMED').length,
            processing: ordersList.filter(o => o.status === 'PROCESSING').length,
            shipping: ordersList.filter(o => o.status === 'SHIPPING').length,
            delivered: ordersList.filter(o => o.status === 'DELIVERED').length,
            completed: ordersList.filter(o => o.status === 'COMPLETED').length,
            cancelled: ordersList.filter(o => o.status === 'CANCELLED').length,
            totalRevenue: ordersList
                .filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status))
                .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0)
        };
        setStats(newStats);
    };

    useEffect(() => {
        fetchOrders(0);
    }, []); // Chỉ load lần đầu

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order updated to ${newStatus}`);
            if (selectedOrder && selectedOrder.id === orderId) {
                setShowOrderModal(false);
            }
            fetchOrders(pagination.page);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update status';
            toast.error(message);
        }
    };

    const handleSearch = () => {
        fetchOrders(0); // Apply filters khi click Search
    };

    const handleResetFilters = () => {
        setFilters({
            status: '',
            search: '',
            dateFrom: '',
            dateTo: '',
            paymentStatus: ''
        });
        // Fetch lại với filters rỗng
        setTimeout(() => fetchOrders(0), 100);
    };

    // Check if any filter is active
    const hasActiveFilters = () => {
        return filters.status || filters.search || filters.dateFrom || filters.dateTo || filters.paymentStatus;
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
            setSelectedOrders(new Set(orders.map(o => o.id)));
        }
    };

    const handleExportSelected = () => {
        if (selectedOrders.size === 0) {
            toast.error('Please select orders to export');
            return;
        }
        toast.success(`Exporting ${selectedOrders.size} orders...`);
        // TODO: Implement export logic
    };

    const handlePrintInvoice = (order) => {
        toast.success('Preparing invoice for print...');
        // TODO: Implement print logic
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            CONFIRMED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            PROCESSING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            SHIPPING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
        };
        return styles[status] || 'bg-slate-100 text-slate-700';
    };

    const getStatusIcon = (status) => {
        const icons = {
            PENDING: 'shopping_cart',
            CONFIRMED: 'check_circle',
            PROCESSING: 'autorenew',
            SHIPPING: 'local_shipping',
            DELIVERED: 'done_all',
            COMPLETED: 'task_alt',
            CANCELLED: 'cancel'
        };
        return icons[status] || 'receipt';
    };

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };



    return (
        <AdminLayout>
            <Toaster position="top-right" />
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6">

                {/* Header with Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
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
                            Refresh
                        </button>

                        <button
                            onClick={handleExportSelected}
                            disabled={selectedOrders.size === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-lg">download</span>
                            Export {selectedOrders.size > 0 && `(${selectedOrders.size})`}
                        </button>
                    </div>
                </div>

                {/* Enhanced Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {/* Total Orders */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">receipt_long</span>
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">Total Orders</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pagination.totalElements}</h3>
                    </div>

                    {/* Pending Orders */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-300">shopping_cart</span>
                            </div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">New</span>
                        </div>
                        <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide mb-1">Pending</p>
                        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.pending}</h3>
                    </div>

                    {/* Confirmed */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-indigo-200 dark:bg-indigo-800 rounded-lg">
                                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-300">check_circle</span>
                            </div>
                        </div>
                        <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-1">Confirmed</p>
                        <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.confirmed}</h3>
                    </div>

                    {/* Shipping */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
                                <span className="material-symbols-outlined text-orange-600 dark:text-orange-300">local_shipping</span>
                            </div>
                        </div>
                        <p className="text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wide mb-1">Shipping</p>
                        <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.shipping}</h3>
                    </div>

                    {/* Delivered */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-300">done_all</span>
                            </div>
                        </div>
                        <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-1">Delivered</p>
                        <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.delivered}</h3>
                    </div>

                    {/* Revenue */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                                <span className="material-symbols-outlined text-purple-600 dark:text-purple-300">payments</span>
                            </div>
                        </div>
                        <p className="text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wide mb-1">Revenue</p>
                        <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatCurrency(stats.totalRevenue)}</h3>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">filter_alt</span>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
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
                            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
                            <span className="material-symbols-outlined text-lg">
                                {showAdvancedFilters ? 'expand_less' : 'expand_more'}
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
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
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
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPING">Shipping</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleSearch}
                                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">search</span>
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
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
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
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                        Payment Status
                                    </label>
                                    <select
                                        value={filters.paymentStatus}
                                        onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
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
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Order Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
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
                                                    <span className="material-symbols-outlined text-3xl text-slate-400">receipt_long</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">No orders found</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">#{order.orderCode}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{order.customerName}</span>
                                                    <span className="text-xs text-slate-500">{order.shippingPhone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(order.status)}`}>
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
                                                    <span className="material-symbols-outlined">visibility</span>
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
                                Showing page <span className="font-medium">{pagination.page + 1}</span> of <span className="font-medium">{pagination.totalPages}</span>
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
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowOrderModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h3 className="text-xl font-bold dark:text-white">Order Details</h3>
                                <p className="text-sm text-slate-500 font-medium">#{selectedOrder.orderCode}</p>
                            </div>
                            <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Timeline */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Timeline</h4>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                                    {[
                                        { key: 'createdAt', title: 'Order Pending', icon: 'shopping_cart', color: 'blue', status: 'PENDING' },
                                        { key: 'confirmedAt', title: 'Order Confirmed', icon: 'check_circle', color: 'indigo', status: 'CONFIRMED' },
                                        { key: 'processingAt', title: 'Order Processing', icon: 'inventory_2', color: 'purple', status: 'PROCESSING' },
                                        { key: 'shippedAt', title: 'Order Shipping', icon: 'local_shipping', color: 'orange', status: 'SHIPPING' },
                                        { key: 'deliveredAt', title: 'Order Delivered', icon: 'done_all', color: 'emerald', status: 'DELIVERED' },
                                        { key: 'completedAt', title: 'Order Completed', icon: 'task_alt', color: 'green', status: 'COMPLETED' },
                                        { key: 'cancelledAt', title: 'Order Cancelled', icon: 'cancel', color: 'rose', status: 'CANCELLED' }
                                    ].filter(e => selectedOrder[e.key]).map((event, index, array) => {
                                        const isLast = index === array.length - 1;
                                        const isCurrent = isLast; // The last recorded timestamp is the current status

                                        const getColors = () => {
                                            if (!isCurrent) return { bg: 'bg-white border-2 border-slate-200 dark:bg-slate-900 dark:border-slate-700', text: 'text-slate-400', ring: '' };
                                            const colors = {
                                                blue: { bg: 'bg-blue-600', text: 'text-white', ring: 'ring-4 ring-blue-50 dark:ring-blue-900/30' },
                                                indigo: { bg: 'bg-indigo-600', text: 'text-white', ring: 'ring-4 ring-indigo-50 dark:ring-indigo-900/30' },
                                                purple: { bg: 'bg-purple-600', text: 'text-white', ring: 'ring-4 ring-purple-50 dark:ring-purple-900/30' },
                                                orange: { bg: 'bg-orange-600', text: 'text-white', ring: 'ring-4 ring-orange-50 dark:ring-orange-900/30' },
                                                emerald: { bg: 'bg-emerald-600', text: 'text-white', ring: 'ring-4 ring-emerald-50 dark:ring-emerald-900/30' },
                                                green: { bg: 'bg-green-600', text: 'text-white', ring: 'ring-4 ring-green-50 dark:ring-green-900/30' },
                                                rose: { bg: 'bg-rose-600', text: 'text-white', ring: 'ring-4 ring-rose-50 dark:ring-rose-900/30' }
                                            };
                                            return colors[event.color];
                                        };
                                        const style = getColors();

                                        return (
                                            <div key={event.key} className="relative flex gap-4 pb-6 last:pb-0">
                                                {!isLast && (
                                                    <div className="absolute left-4 top-8 bottom-[-8px] w-0.5 bg-slate-200 dark:bg-slate-700" />
                                                )}
                                                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${style.bg} ${style.ring}`}>
                                                    <span className={`material-symbols-outlined text-[16px] ${style.text}`}>
                                                        {event.icon}
                                                    </span>
                                                </div>
                                                <div className="flex-1 pt-1.5">
                                                    <p className={`text-sm font-bold ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {event.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                                        {formatDateTime(selectedOrder[event.key])}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Customer info</h4>
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.customerName}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{selectedOrder.customerEmail}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{selectedOrder.shippingPhone}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Shipping Address</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {selectedOrder.shippingAddress}
                                    </p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Items</h4>
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-slate-500">Product</th>
                                                <th className="px-4 py-3 font-bold text-slate-500 text-center">Qty</th>
                                                <th className="px-4 py-3 font-bold text-slate-500 text-right">Price</th>
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
                                                                        e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                                                                    }}
                                                                />
                                                            )}
                                                            <span className="font-medium text-slate-900 dark:text-white">{item.productName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(item.unitPrice)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                                            <tr className="font-medium text-slate-600 dark:text-slate-400">
                                                <td colSpan="2" className="px-4 py-2 pt-4 text-right">Subtotal:</td>
                                                <td className="px-4 py-2 pt-4 text-right text-slate-900 dark:text-white">{formatCurrency(selectedOrder.subtotal)}</td>
                                            </tr>
                                            <tr className="font-medium text-slate-600 dark:text-slate-400">
                                                <td colSpan="2" className="px-4 py-2 text-right">Shipping:</td>
                                                <td className="px-4 py-2 text-right text-slate-900 dark:text-white">{formatCurrency(selectedOrder.shippingFee)}</td>
                                            </tr>
                                            <tr className="font-medium text-slate-600 dark:text-slate-400">
                                                <td colSpan="2" className="px-4 py-2 pb-4 text-right">Tax (10%):</td>
                                                <td className="px-4 py-2 pb-4 text-right text-slate-900 dark:text-white">{formatCurrency(selectedOrder.taxAmount)}</td>
                                            </tr>
                                            <tr className="font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                                                <td colSpan="2" className="px-4 py-4 text-right">Total:</td>
                                                <td className="px-4 py-4 text-right text-primary">{formatCurrency(selectedOrder.totalAmount)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Status Actions */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Actions</h4>
                                <div className="flex flex-wrap gap-3">
                                    {selectedOrder.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')}
                                                className="flex-1 bg-primary text-white text-sm font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                                            >
                                                Accept Order
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                                                className="flex-1 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-bold py-3 px-6 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
                                            >
                                                Reject Order
                                            </button>
                                        </>
                                    )}
                                    {selectedOrder.status === 'CONFIRMED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                                            className="flex-1 bg-yellow-500 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-all"
                                        >
                                            Start Processing
                                        </button>
                                    )}
                                    {selectedOrder.status === 'PROCESSING' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPING')}
                                            className="flex-1 bg-indigo-600 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                                        >
                                            Ship Order
                                        </button>
                                    )}
                                    {selectedOrder.status === 'SHIPPING' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                                            className="flex-1 bg-emerald-600 text-white text-sm font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                                        >
                                            Mark as Delivered
                                        </button>
                                    )}
                                    {['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(selectedOrder.status) && (
                                        <div className="w-full text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-500 text-sm italic">
                                            This order is completed and no further actions are available.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;
