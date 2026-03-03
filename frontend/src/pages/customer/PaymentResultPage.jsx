import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("loading"); // loading, success, failed

    const orderCode = searchParams.get("orderCode");
    const paymentStatus = searchParams.get("status");
    const message = searchParams.get("message");

    useEffect(() => {
        if (!orderCode) {
            navigate("/");
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const orderData = await orderService.getOrderByCode(orderCode);
                setOrder(orderData);
                setStatus(paymentStatus === "success" ? "success" : "failed");
            } catch (error) {
                console.error("Error fetching order details:", error);
                setStatus("failed");
                toast.error("Could not load order details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderCode, paymentStatus, navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price || 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="size-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Processing Payment Result...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-[1000px] mx-auto px-4 py-12 md:py-20">
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100">
                    {/* Result Header */}
                    <div className={`p-10 text-center ${status === 'success' ? 'bg-gradient-to-b from-green-50 to-white' : 'bg-gradient-to-b from-red-50 to-white'}`}>
                        <div className={`mx-auto size-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${status === 'success' ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'}`}>
                            <span className="material-symbols-outlined text-5xl font-black">
                                {status === 'success' ? 'check_circle' : 'error'}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                            {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                        </h1>
                        <p className="text-gray-500 text-lg max-w-md mx-auto font-medium">
                            {status === 'success'
                                ? "Great news! Your payment has been processed and your order is being prepared."
                                : `We're sorry, but there was an issue processing your payment. ${message ? `(Error: ${message})` : ''}`}
                        </p>
                    </div>

                    {/* Order Summary Card */}
                    {order && (
                        <div className="p-8 md:p-12 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Details List */}
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Order Details</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-gray-500 font-bold">Order Code</span>
                                                <span className="text-gray-900 font-black">#{order.orderCode}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-gray-500 font-bold">Date</span>
                                                <span className="text-gray-900 font-bold">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                <span className="text-gray-500 font-bold">Payment Status</span>
                                                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {status === 'success' ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-3">
                                                <span className="text-gray-500 font-bold">Order Status</span>
                                                <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest">
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Shipping To</h3>
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <p className="font-black text-gray-900 mb-1">{order.shippingName}</p>
                                            <p className="text-gray-600 font-medium">{order.shippingPhone}</p>
                                            <p className="text-gray-600 text-sm mt-2 leading-relaxed">{order.shippingAddress}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Summary */}
                                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 flex flex-col">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Items Summary</h3>
                                    <div className="flex-1 space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="flex gap-4 items-center">
                                                <div className="size-16 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0">
                                                    <img
                                                        src={item.productThumbnail || 'https://via.placeholder.com/60x60?text=Product'}
                                                        alt={item.productName}
                                                        className="size-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-black text-gray-900 text-sm">{formatPrice(item.unitPrice)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-500 font-bold">Subtotal</span>
                                            <span className="text-gray-900 font-bold">{formatPrice(order.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-gray-500 font-bold">Shipping</span>
                                            <span className="text-green-600 font-black uppercase text-xs tracking-widest">Free</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-gray-900 font-black text-lg">Total Amount</span>
                                            <span className="text-3xl font-black text-blue-600">{formatPrice(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="p-8 md:p-12 bg-gray-900 text-center flex flex-col md:flex-row gap-4 items-center justify-center">
                        <Link
                            to="/my-orders"
                            className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/20"
                        >
                            View Order Status
                        </Link>
                        <Link
                            to="/"
                            className="w-full md:w-auto px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl transition-all border border-white/10"
                        >
                            Back to Shopping
                        </Link>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        Secure transaction verified by ShopAI.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PaymentResultPage;
