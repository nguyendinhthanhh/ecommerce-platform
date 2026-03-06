import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import { useCart } from "../../contexts/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");

  const {
    cartItems,
    selectedItems,
    loading,
    imageLoadingStates,
    subtotal,
    tax,
    total,
    selectedItemsCount,
    totalItemsCount,
    updateQuantity,
    removeItem,
    toggleItemSelection,
    toggleSelectAll,
    handleImageLoad,
    handleImageError,
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8]">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f6f8]">
        <Header />
        <div className="max-w-[1200px] mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <img src="https://via.placeholder.com/200x200?text=Empty+Cart" alt="Empty Cart" className="w-48 h-48 mb-6 opacity-50" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-500 mb-6">Hãy chọn thêm sản phẩm để mua sắm nhé.</p>
          <Link to="/" className="bg-primary text-white font-bold px-8 py-3 rounded hover:bg-red-700 transition-colors uppercase">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#111418] font-display pb-20">
      <Header />

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl font-bold text-gray-900 uppercase">Giỏ hàng</span>
          <span className="text-gray-500 font-medium">({totalItemsCount} sản phẩm)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Cart Items (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Header Row */}
            <div className="bg-white rounded p-4 flex items-center shadow-sm border border-gray-100 text-[14px] text-gray-500 font-medium">
              <div className="flex-shrink-0 w-8">
                <input
                  type="checkbox"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
                />
              </div>
              <div className="flex-grow">Sản phẩm</div>
              <div className="w-24 text-center">Đơn giá</div>
              <div className="w-32 text-center">Số lượng</div>
              <div className="w-28 text-right">Thành tiền</div>
              <div className="w-10 text-center ml-4"></div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded shadow-sm border border-gray-100 flex flex-col">
              {cartItems.map((item, index) => (
                <div key={item.id} className={`flex items-center p-4 ${index !== cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex-shrink-0 w-8">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
                    />
                  </div>

                  <div className="flex-grow flex items-center gap-4">
                    <Link to={`/products/${item.id}`} className="flex-shrink-0 block w-20 h-20 border border-gray-100 rounded p-1 object-contain bg-white">
                      <img
                        src={item.image || 'https://via.placeholder.com/80x80?text=SP'}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onLoad={() => handleImageLoad(item.id)}
                        onError={(e) => { e.target.onerror = null; handleImageError(item.id); }}
                      />
                    </Link>
                    <div className="flex flex-col gap-1">
                      <Link to={`/products/${item.id}`} className="font-medium text-[14px] text-gray-900 hover:text-primary line-clamp-2 leading-tight">
                        {item.name}
                      </Link>
                      {item.frequentlyBoughtWith && (
                        <span className="text-[12px] text-gray-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-green-500">sell</span> Mua kèm ưu đãi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-24 text-center font-bold text-[14px] text-gray-900">
                    {formatPrice(item.price)}
                  </div>

                  <div className="w-32 flex justify-center">
                    <div className="flex items-center border border-gray-300 rounded h-8 w-24 overflow-hidden bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="flex-grow h-full flex items-center justify-center text-[13px] font-bold border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="w-28 text-right font-bold text-[14px] text-primary">
                    {formatPrice((item.price || 0) * item.quantity)}
                  </div>

                  <div className="w-10 text-center ml-4 flex justify-end">
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded shadow-sm border border-gray-100 p-5 sticky top-8 flex flex-col gap-4">

              <h2 className="text-[16px] font-bold text-gray-900 border-b border-gray-100 pb-3">Thanh toán</h2>

              {/* Promo Row */}
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-medium text-gray-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">local_offer</span>
                  Mã khuyến mãi
                </span>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-grow px-3 py-2 text-[13px] focus:outline-none"
                  />
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 text-[13px] font-bold transition-colors border-l border-gray-300">
                    Áp dụng
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex flex-col gap-3 text-[14px]">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng</span>
                  <span className="font-bold text-green-600 uppercase">Miễn phí</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                <span className="text-[15px] font-medium text-gray-900">Tổng cộng</span>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                  <span className="text-[11px] text-gray-500">(Đã bao gồm VAT nếu có)</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/place-order")}
                disabled={selectedItemsCount === 0}
                className={`w-full py-4 mt-2 rounded font-bold uppercase flex flex-col items-center justify-center transition-all ${selectedItemsCount > 0
                    ? "bg-primary text-white hover:bg-red-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <span className="text-[16px]">Tiến hành thanh toán</span>
                <span className="text-[11px] font-medium normal-case mt-0.5 opacity-90">({selectedItemsCount} sản phẩm được chọn)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
