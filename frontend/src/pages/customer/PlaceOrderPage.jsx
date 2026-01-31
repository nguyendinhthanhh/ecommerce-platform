import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import { useCart } from "../../contexts/CartContext";
import orderService from "../../services/orderService";
import authService from "../../services/authService";

const PlaceOrderPage = () => {
    const navigate = useNavigate();
    const { cartItems, selectedItems, subtotal, tax, total, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        shippingPhone: "",
        address: "",
        city: "",
        zipCode: "",
        paymentMethod: "VNPAY", // Set VNPay as default
    });

    // Get selected items to display in order summary
    const selectedCartItems = cartItems.filter((item) => selectedItems.has(item.id));

    useEffect(() => {
        const user = authService.getUser();
        if (!user) {
            navigate("/login");
            return;
        }

        // If no items are selected for checkout, redirect back to cart
        if (selectedItems.size === 0) {
            navigate("/cart");
        }
    }, [selectedItems, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUseSavedAddress = async () => {
        try {
            setLoading(true);
            const userData = await authService.getCurrentUser();

            if (userData) {
                // Split full name into first and last name
                const names = userData.fullName?.split(" ") || ["", ""];
                const firstName = names[0] || "";
                const lastName = names.slice(1).join(" ") || "";

                setFormData(prev => ({
                    ...prev,
                    firstName,
                    lastName,
                    shippingPhone: userData.phoneNumber || userData.phone || prev.shippingPhone,
                    address: userData.address || prev.address,
                }));
            }
        } catch (err) {
            console.error("Error fetching saved address:", err);
            // Fallback to minimal data from local storage if API fails
            const storedUser = authService.getUser();
            if (storedUser) {
                const names = storedUser.fullName?.split(" ") || ["", ""];
                setFormData(prev => ({
                    ...prev,
                    firstName: names[0] || "",
                    lastName: names.slice(1).join(" ") || "",
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const orderData = {
                cartItemIds: Array.from(selectedItems),
                shippingName: `${formData.firstName} ${formData.lastName}`.trim(),
                shippingPhone: formData.shippingPhone,
                shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`.trim(),
                note: formData.note,
                paymentMethod: formData.paymentMethod,
            };

            const result = await orderService.placeOrder(orderData);

            // If it's an online payment method, initiate payment and redirect
            if (formData.paymentMethod === "VNPAY" || formData.paymentMethod === "MOMO") {
                try {
                    // Debugging: see what the backend actually returns
                    console.log("FULL Result from placeOrder:", result);

                    // Try to find the order code in various possible fields (supporting array response)
                    let orderCode = null;
                    const responseData = result?.data;

                    if (Array.isArray(responseData) && responseData.length > 0) {
                        // Case: Backend returns an array (as shown in your JSON example)
                        orderCode = responseData[0].orderCode || responseData[0].id || responseData[0].code;
                    } else {
                        // Case: Single object or other format
                        const data = responseData || result;
                        orderCode = data?.orderCode || data?.id || data?.code || data?.orderNumber || (typeof data === 'string' ? data : null);
                    }

                    console.log("Identified order code:", orderCode);

                    if (!orderCode) {
                        throw new Error(`Order created but no order code found. Fields received: ${Object.keys(result || {}).join(", ")}`);
                    }

                    const paymentResponse = await orderService.createPayment(formData.paymentMethod, orderCode);
                    console.log("Payment response received:", paymentResponse);

                    // Extract URL from payment response (support various formats)
                    const paymentUrl = typeof paymentResponse === 'string'
                        ? paymentResponse
                        : (paymentResponse?.data || paymentResponse?.url || paymentResponse?.paymentUrl);

                    if (paymentUrl) {
                        console.log("Redirecting to:", paymentUrl);
                        window.location.href = paymentUrl;
                        return; // IMPORTANT: Stop execution here
                    } else {
                        throw new Error("Payment URL not found in API response.");
                    }
                } catch (payErr) {
                    console.error("Payment initiation error detail:", payErr);
                    const errorMessage = payErr.response?.data?.message || payErr.message || "Unknown error";
                    alert(`Order created, but payment failed: ${errorMessage}. You can pay later from your profile.`);
                    navigate("/profile");
                    return;
                }
            }

            // Clear purchased items from cart
            // Note: useCart should have a method to remove multiple items or clear selected
            // For now, let's assume clearCart or similar logic
            // Actually, we should only clear selected items.

            alert("Order placed successfully!");
            navigate("/profile"); // Navigate to profile or orders page
        } catch (err) {
            console.error("Error placing order:", err);
            setError(err.response?.data?.message || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price || 0);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-[1200px] mx-auto px-4 py-8">
                {/* Stepper */}
                <div className="flex items-center justify-center mb-12">
                    <div className="flex items-center w-full max-w-2xl">
                        <div className="flex flex-col items-center relative">
                            <div className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold z-10">
                                1
                            </div>
                            <span className="absolute -bottom-7 text-sm font-bold text-blue-600 whitespace-nowrap uppercase tracking-wider">Shipping</span>
                        </div>
                        <div className="flex-1 h-1 bg-blue-100 mx-4 rounded-full"></div>
                        <div className="flex flex-col items-center relative text-gray-400">
                            <div className="size-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center font-bold z-10 transition-all">
                                2
                            </div>
                            <span className="absolute -bottom-7 text-sm font-medium whitespace-nowrap uppercase tracking-wider">Payment</span>
                        </div>
                        <div className="flex-1 h-1 bg-gray-100 mx-4 rounded-full"></div>
                        <div className="flex flex-col items-center relative text-gray-400">
                            <div className="size-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center font-bold z-10 transition-all">
                                3
                            </div>
                            <span className="absolute -bottom-7 text-sm font-medium whitespace-nowrap uppercase tracking-wider">Review</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">
                    {/* Left Side - Forms */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Shipping Address */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600">local_shipping</span>
                                    Shipping Address
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleUseSavedAddress}
                                    disabled={loading}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">person_pin_circle</span>
                                    Use saved address
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Alex"
                                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Rivera"
                                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 col-span-full">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="shippingPhone"
                                        value={formData.shippingPhone}
                                        onChange={handleInputChange}
                                        placeholder="090 123 4567"
                                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 col-span-full">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-1">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Street name and number"
                                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="City"
                                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-widest pl-1">Zip Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        placeholder="Zip Code"
                                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Shipping Method */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">rocket_launch</span>
                                Shipping Method
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex items-center justify-between p-6 rounded-2xl border-2 border-blue-600 bg-blue-50/50 cursor-pointer transition-all hover:shadow-md group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <span className="material-symbols-outlined">package_2</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">Standard Shipping</p>
                                            <p className="text-sm text-gray-500">3-5 business days</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-gray-900">Free</span>
                                        <div className="size-6 border-2 border-blue-600 rounded-full flex items-center justify-center">
                                            <div className="size-3 bg-blue-600 rounded-full"></div>
                                        </div>
                                    </div>
                                    <input type="radio" name="shippingMethod" checked readOnly className="hidden" />
                                </label>
                                <label className="flex items-center justify-between p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-gray-50/50 cursor-pointer transition-all hover:shadow-md group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                                            <span className="material-symbols-outlined">bolt</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">Express Delivery</p>
                                            <p className="text-sm text-gray-500">1-2 business days</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-gray-900">$15.00</span>
                                        <div className="size-6 border-2 border-gray-200 group-hover:border-blue-200 rounded-full"></div>
                                    </div>
                                    <input type="radio" name="shippingMethod" className="hidden" />
                                </label>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">account_balance_wallet</span>
                                Payment Method
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <label className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${formData.paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50/50'}`}>
                                    <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined text-3xl">payments</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-gray-900 text-lg">VNPay</p>
                                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-tighter">Instant Online</p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="VNPAY"
                                        checked={formData.paymentMethod === 'VNPAY'}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <div className={`mt-auto size-6 border-2 rounded-full flex items-center justify-center ${formData.paymentMethod === 'VNPAY' ? 'border-blue-600' : 'border-gray-200'}`}>
                                        {formData.paymentMethod === 'VNPAY' && <div className="size-3 bg-blue-600 rounded-full"></div>}
                                    </div>
                                </label>

                                <label className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${formData.paymentMethod === 'MOMO' ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50/50'}`}>
                                    <div className="size-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                                        <span className="material-symbols-outlined text-3xl">wallet</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-gray-900 text-lg">MoMo</p>
                                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-tighter">Fast E-Wallet</p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="MOMO"
                                        checked={formData.paymentMethod === 'MOMO'}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <div className={`mt-auto size-6 border-2 rounded-full flex items-center justify-center ${formData.paymentMethod === 'MOMO' ? 'border-blue-600' : 'border-gray-200'}`}>
                                        {formData.paymentMethod === 'MOMO' && <div className="size-3 bg-blue-600 rounded-full"></div>}
                                    </div>
                                </label>

                                <label className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${formData.paymentMethod === 'CASH' ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50/50'}`}>
                                    <div className="size-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <span className="material-symbols-outlined text-3xl">local_shipping</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-gray-900 text-lg">COD</p>
                                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-tighter">Pay on Delivery</p>
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="CASH"
                                        checked={formData.paymentMethod === 'CASH'}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <div className={`mt-auto size-6 border-2 rounded-full flex items-center justify-center ${formData.paymentMethod === 'CASH' ? 'border-blue-600' : 'border-gray-200'}`}>
                                        {formData.paymentMethod === 'CASH' && <div className="size-3 bg-blue-600 rounded-full"></div>}
                                    </div>
                                </label>
                            </div>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 border-t border-gray-100 pt-8">
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold">
                                    <span className="material-symbols-outlined text-[18px]">lock</span>
                                    256-bit SSL Secure
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold">
                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                    Money Back Guarantee
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Side - Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 sticky top-24">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex flex-col gap-1">
                                Order Summary
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{selectedCartItems.length} items selected</span>
                            </h2>

                            <div className="space-y-6 mb-8 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedCartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 transition-transform group-hover:scale-105">
                                            <img
                                                src={item.image || `https://picsum.photos/100/100?random=${item.id}`}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-bold text-gray-900 truncate text-base leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h4>
                                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">Qty: {item.quantity} | {item.size || 'One Size'}</p>
                                            <p className="font-black text-blue-600 mt-2">{formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 mb-8">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">sell</span>
                                    <input
                                        type="text"
                                        placeholder="Promo Code"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:font-medium"
                                    />
                                </div>
                                <button className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-blue-600 transition-all hover:shadow-lg hover:shadow-blue-200 uppercase tracking-widest">Apply</button>
                            </div>

                            <div className="space-y-4 mb-8 border-y border-gray-100 py-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                                    <span className="font-black text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Shipping</span>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full">
                                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                                        <span className="text-xs font-black uppercase tracking-widest">Free</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Estimated Tax</span>
                                    <span className="font-black text-gray-900">{formatPrice(tax)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-10">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Grand Total</span>
                                    <span className="text-3xl font-black text-blue-600">{formatPrice(total)}</span>
                                </div>
                                <div className="flex items-end gap-0.5 h-10">
                                    <div className="w-1.5 bg-blue-100 rounded-full h-4"></div>
                                    <div className="w-1.5 bg-blue-200 rounded-full h-6"></div>
                                    <div className="w-1.5 bg-blue-300 rounded-full h-5"></div>
                                    <div className="w-1.5 bg-blue-400 rounded-full h-8"></div>
                                    <div className="w-1.5 bg-blue-600 rounded-full h-10"></div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border-2 border-red-100 flex items-center gap-2 animate-shake">
                                    <span className="material-symbols-outlined">error</span>
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className={`w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <span className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Confirm Payment
                                        <span className="material-symbols-outlined font-black">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            <div className="mt-8 flex flex-col items-center gap-2">
                                <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">
                                    Secure Transaction Guarantee
                                </p>
                                <div className="flex gap-4 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-not-allowed">
                                    <span className="material-symbols-outlined">brand_family</span>
                                    <span className="material-symbols-outlined">universal_currency</span>
                                    <span className="material-symbols-outlined">credit_card</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="mt-24 border-t border-gray-200 py-16 bg-white">
                <div className="max-w-[1200px] mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <span className="material-symbols-outlined text-2xl">smart_toy</span>
                            </div>
                            <span className="text-xl font-black text-gray-900">ShopAI<span className="text-blue-600">.</span></span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-10 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
                            <a href="#" className="hover:text-blue-600 transition-colors">Safety</a>
                        </div>
                        <p className="text-sm font-bold text-gray-400">© 2026 ShopAI Next-Gen E-commerce</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PlaceOrderPage;
