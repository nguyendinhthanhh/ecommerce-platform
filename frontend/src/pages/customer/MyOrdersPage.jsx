import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import orderService from '../../services/orderService';
import { toast } from 'react-hot-toast';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    
    const [filters, setFilters] = useState({
        status: 'ALL'
    });

    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });

    useEffect(() => {
        fetchMyOrders();
    }, [pagination.page, filters.status]);

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getMyOrders(pagination.page, pagination.size);
            
            // Apply status filter
            let filteredOrders = data.content;
            if (filters.status !== 'ALL') {
                filteredOrders = filteredOrders.filter(order => order.status === filters.status);
            }
            
            setOrders(filteredOrders);
            setPagination({
                ...pagination,
                totalPages: data.totalPages,
                totalElements: data.totalElements
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            setCancellingOrderId(orderId);
            await orderService.cancelOrder(orderId);
            toast.success('Order cancelled successfully');
            fetchMyOrders();
            if (selectedOrder?.id === orderId) {
                setShowDetailModal(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancellingOrderId(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            PLACED: 'bg-blue-100 text-blue-700 border-blue-200',
            CONFIRMED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            SHIPPED: 'bg-orange-100 text-orange-700 border-orange-200',
            DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
            RETURNED: 'bg-purple-100 text-purple-700 border-purple-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            PLACED: 'shopping_cart',
            CONFIRMED: 'check_circle',
            SHIPPED: 'local_shipping',
            DELIVERED: 'done_all',
            CANCELLED: 'cancel',
            RETURNED: 'keyboard_return'
        };
        return icons[status] || 'receipt';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderProgress = (status) => {
        const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
        const currentIndex = steps.indexOf(status);
        return ((currentIndex + 1) / steps.length) * 100;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <span className="material-symbols-outlined">home</span>
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium">My Orders</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-blue-600">receipt_long</span>
                        My Orders
                    </h1>
                    <p className="text-gray-600 mt-2">Track and manage your orders</p>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                    <div className="flex overflow-x-auto">
                        {[
                            { label: 'All Orders', value: 'ALL', icon: 'list_alt' },
                            { label: 'Placed', value: 'PLACED', icon: 'shopping_cart' },
                            { label: 'Confirmed', value: 'CONFIRMED', icon: 'check_circle' },
                            { label: 'Shipping', value: 'SHIPPED', icon: 'local_shipping' },
                            { label: 'Delivered', value: 'DELIVERED', icon: 'done_all' },
                            { label: 'Cancelled', value: 'CANCELLED', icon: 'cancel' }
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setFilters({ ...filters, status: tab.value })}
                                className={`flex-1 min-w-[140px] px-6 py-4 flex items-center justify-center gap-2 font-medium transition-all border-b-2 ${
                                    filters.status === tab.value
                                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                        <div className="h-3 w-48 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="h-20 bg-gray-100 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-gray-400">shopping_bag</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    Order #{order.orderCode}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                                    <span className="material-symbols-outlined text-sm">{getStatusIcon(order.status)}</span>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Placed on {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Total Amount</p>
                                                <p className="text-xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {!['CANCELLED', 'RETURNED'].includes(order.status) && (
                                        <div className="mt-4">
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                                    style={{ width: `${getOrderProgress(order.status)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {order.items.slice(0, 2).map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <img
                                                    src={item.productThumbnail || 'https://via.placeholder.com/80x80?text=Product'}
                                                    alt={item.productName}
                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                </div>
                                                <p className="font-bold text-gray-900">{formatPrice(item.unitPrice)}</p>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <p className="text-sm text-gray-600 italic">
                                                +{order.items.length - 2} more items
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Actions */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowDetailModal(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                        View Details
                                    </button>
                                    {order.status === 'PLACED' && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            disabled={cancellingOrderId === order.id}
                                            className="px-4 py-2 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors font-medium text-sm flex items-center gap-1 disabled:opacity-50"
                                        >
                                            {cancellingOrderId === order.id ? (
                                                <>
                                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                                    Cancelling...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-lg">cancel</span>
                                                    Cancel Order
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page === 0}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-700">
                            Page {pagination.page + 1} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page >= pagination.totalPages - 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Details</h2>
                                    <p className="text-gray-600">#{selectedOrder.orderCode}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-gray-600">close</span>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Status & Timeline */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">Order Status</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(selectedOrder.status)}`}>
                                        <span className="material-symbols-outlined text-sm">{getStatusIcon(selectedOrder.status)}</span>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                
                                {/* Timeline */}
                                <div className="space-y-3">
                                    {selectedOrder.createdAt && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-white text-sm">shopping_cart</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Order Placed</p>
                                                <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedOrder.confirmedAt && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-white text-sm">check_circle</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Order Confirmed</p>
                                                <p className="text-sm text-gray-600">{formatDate(selectedOrder.confirmedAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedOrder.shippedAt && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-white text-sm">local_shipping</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Order Shipped</p>
                                                <p className="text-sm text-gray-600">{formatDate(selectedOrder.shippedAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedOrder.deliveredAt && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-white text-sm">done_all</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Order Delivered</p>
                                                <p className="text-sm text-gray-600">{formatDate(selectedOrder.deliveredAt)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600">local_shipping</span>
                                    Shipping Information
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium text-gray-700">Name:</span> {selectedOrder.shippingName}</p>
                                    <p><span className="font-medium text-gray-700">Phone:</span> {selectedOrder.shippingPhone}</p>
                                    <p><span className="font-medium text-gray-700">Address:</span> {selectedOrder.shippingAddress}</p>
                                    {selectedOrder.note && (
                                        <p><span className="font-medium text-gray-700">Note:</span> {selectedOrder.note}</p>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Product</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedOrder.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={item.productThumbnail || 'https://via.placeholder.com/50x50?text=Product'}
                                                                alt={item.productName}
                                                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                                                                }}
                                                            />
                                                            <span className="font-medium text-gray-900">{item.productName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatPrice(item.unitPrice)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t border-gray-200">
                                            <tr>
                                                <td colSpan="2" className="px-4 py-3 text-right font-bold text-gray-900">Total:</td>
                                                <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">{formatPrice(selectedOrder.totalAmount)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors font-medium"
                            >
                                Close
                            </button>
                            {selectedOrder.status === 'PLACED' && (
                                <button
                                    onClick={() => handleCancelOrder(selectedOrder.id)}
                                    disabled={cancellingOrderId === selectedOrder.id}
                                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    {cancellingOrderId === selectedOrder.id ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                            Cancelling...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">cancel</span>
                                            Cancel Order
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
