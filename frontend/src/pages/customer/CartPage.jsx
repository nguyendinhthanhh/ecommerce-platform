import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import { useCart } from "../../contexts/CartContext";

const CartPage = () => {
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

  const recommendedItem = {
    id: 4,
    name: "Artisan Leather Belt",
    price: 30.0,
    image: "/api/placeholder/60/60",
    tag: "RECOMMENDED FOR YOU",
  };

  const moveToWishlist = (itemId) => {
    // TODO: Implement move to wishlist functionality
    console.log("Move to wishlist:", itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Your Shopping Cart
            </h1>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.size === cartItems.length &&
                    cartItems.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({totalItemsCount})
                </span>
              </label>
            </div>
          </div>
          <p className="text-gray-600">
            Review your {totalItemsCount} items • {selectedItemsCount} selected
            for checkout
          </p>
        </div>

        {/* AI Suggestion Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-blue-900">
                Save $10 more by adding a matching belt
              </p>
              <p className="text-sm text-blue-700">
                ShopAI suggests adding a belt to your order to unlock the "AI
                Bundle" discount.
              </p>
            </div>
          </div>
          <button className="text-blue-600 font-medium hover:text-blue-700 flex items-center">
            View belt options
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-200 ${
                  selectedItems.has(item.id)
                    ? "ring-2 ring-blue-500 ring-opacity-50"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Selection Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Product Image with Skeleton */}
                  <div className="flex-shrink-0 relative">
                    {imageLoadingStates[item.id] && (
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                        <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                      </div>
                    )}
                    <img
                      src={`https://picsum.photos/200/200?random=${item.id}`}
                      alt={item.name}
                      className={`w-24 h-24 object-cover rounded-lg transition-opacity duration-300 ${
                        imageLoadingStates[item.id]
                          ? "opacity-0 absolute"
                          : "opacity-100"
                      }`}
                      onLoad={() => handleImageLoad(item.id)}
                      onError={() => handleImageError(item.id)}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>
                        {item.frequentlyBoughtWith && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            🔄 Frequently bought with{" "}
                            {item.frequentlyBoughtWith}
                          </span>
                        )}
                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                          <p>
                            Size: {item.size} | Color: {item.color}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          ${(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => moveToWishlist(item.id)}
                          className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          Move to Wishlist
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-gray-500 flex items-center text-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-50 text-gray-500"
                          disabled={item.quantity <= 1}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="px-4 py-2 text-gray-900 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-50 text-gray-500"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Shipping Notice */}
            {selectedItemsCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-blue-800 text-sm">
                  {subtotal >= 150
                    ? "🎉 Your selected items qualify for free express shipping!"
                    : `Orders over $150 qualify for free express shipping. Add $${(150 - (subtotal || 0)).toFixed(2)} more to your selection!`}
                </p>
              </div>
            )}
          </div>

          {/* Order Summary & Recommendations */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Summary
                </h2>
                <span className="text-sm text-gray-500">
                  {selectedItemsCount} item{selectedItemsCount !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ${(subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">
                    ${(tax || 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ${(total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label
                  htmlFor="promo-code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Promo Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm font-medium">
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                disabled={selectedItemsCount === 0}
                className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center transition-all duration-200 ${
                  selectedItemsCount > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {selectedItemsCount > 0
                  ? `Checkout ${selectedItemsCount} item${selectedItemsCount !== 1 ? "s" : ""}`
                  : "Select items to checkout"}
                {selectedItemsCount > 0 && (
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Secure Checkout Powered by ShopAI
              </p>

              {/* Payment Methods */}
              <div className="flex justify-center space-x-2 mt-3">
                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                <div className="w-8 h-5 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Recommended Item */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {recommendedItem.tag}
                </span>
                <button className="text-blue-600 hover:text-blue-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <img
                  src={recommendedItem.image}
                  alt={recommendedItem.name}
                  className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                />
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">
                    {recommendedItem.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Unlock 5% AI Wholesale
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
