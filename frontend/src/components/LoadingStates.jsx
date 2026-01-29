import React from "react";

const LoadingStates = {
  // Cart item with loading overlay
  CartItemLoading: () => (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {/* Your cart item content */}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg
            className="animate-spin h-4 w-4 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Đang cập nhật...</span>
        </div>
      </div>
    </div>
  ),

  // Quantity input loading
  QuantityLoading: () => (
    <div className="flex items-center space-x-1">
      <button
        disabled
        className="p-1 border rounded opacity-50 cursor-not-allowed"
      >
        -
      </button>
      <div className="w-12 h-8 bg-gray-100 rounded animate-pulse"></div>
      <button
        disabled
        className="p-1 border rounded opacity-50 cursor-not-allowed"
      >
        +
      </button>
    </div>
  ),

  // Button loading state
  ButtonLoading: ({ text = "Đang xử lý..." }) => (
    <div className="flex items-center space-x-2">
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span>{text}</span>
    </div>
  ),

  // Cart page skeleton
  CartSkeleton: () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-6"></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex space-x-4 p-4 border-b">
          <div className="w-20 h-20 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export default LoadingStates;
