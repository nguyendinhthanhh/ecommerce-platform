import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

const CartDrawer = () => {
  const {
    cartItems,
    selectedItems,
    isCartOpen,
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
    closeCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Cart Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[9999] transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Shopping Cart
              </h2>
              <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                {totalItemsCount}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Select All */}
          {cartItems.length > 0 && (
            <div className="p-4 border-b bg-gray-50">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.size === cartItems.length &&
                    cartItems.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({totalItemsCount} items)
                </span>
                {selectedItemsCount > 0 && (
                  <span className="text-sm text-gray-500">
                    • {selectedItemsCount} selected
                  </span>
                )}
              </label>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10M17 13l1.5 6M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-4">
                  Add some products to get started
                </p>
                <button
                  onClick={closeCart}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      selectedItems.has(item.id)
                        ? "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Selection Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>

                      {/* Product Image with Skeleton */}
                      <div className="flex-shrink-0 relative">
                        {imageLoadingStates[item.id] && (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
                            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                          </div>
                        )}
                        <img
                          src={`https://picsum.photos/150/150?random=${item.id}`}
                          alt={item.name}
                          className={`w-16 h-16 object-cover rounded-lg transition-opacity duration-300 ${
                            imageLoadingStates[item.id]
                              ? "opacity-0 absolute"
                              : "opacity-100"
                          }`}
                          onLoad={() => handleImageLoad(item.id)}
                          onError={() => handleImageError(item.id)}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.size} • {item.color}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-gray-900">
                            ${(item.price || 0).toFixed(2)}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center border rounded">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-gray-50 text-gray-500 disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <svg
                                className="w-3 h-3"
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
                            <span className="px-2 py-1 text-sm text-gray-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-gray-50 text-gray-500"
                            >
                              <svg
                                className="w-3 h-3"
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

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 mt-2 flex items-center"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Order Summary */}
          {cartItems.length > 0 && (
            <div className="border-t bg-gray-50 p-4 space-y-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal ({selectedItemsCount} items)
                  </span>
                  <span className="text-gray-900">
                    ${(subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">
                    ${(tax || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-lg text-blue-600">
                    ${(total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  disabled={selectedItemsCount === 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    selectedItemsCount > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {selectedItemsCount > 0
                    ? `Checkout (${selectedItemsCount})`
                    : "Select items to checkout"}
                </button>

                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full py-2 px-4 text-center text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors block"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
