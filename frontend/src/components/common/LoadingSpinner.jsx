import React from "react";

// Modern spinning loader
export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin ${className}`}
    />
  );
};

// Pulsing dots loader
export const LoadingDots = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
};

// Product card skeleton
export const ProductCardSkeleton = ({ variant = "grid" }) => {
  if (variant === "carousel") {
    return (
      <div className="min-w-[280px] snap-center bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse">
        <div className="relative aspect-[4/3] bg-gray-200 dark:bg-slate-700" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-20" />
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-slate-700" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-12" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-4/5" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16" />
          <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};

// Stats card skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-lg" />
      </div>
      <div className="flex items-end gap-2">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-28" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-12 mb-1" />
      </div>
    </div>
  );
};

// Table row skeleton
export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full" />
        </td>
      ))}
    </tr>
  );
};

// Full page loading overlay
export const PageLoading = ({ message = "Đang tải..." }) => {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {message}
        </p>
      </div>
    </div>
  );
};

// Inline loading state
export const InlineLoading = ({ message = "Đang tải..." }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {message}
      </span>
    </div>
  );
};

// Shimmer effect component
export const Shimmer = ({ className = "" }) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 dark:bg-slate-700 ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};

// Loading container with skeleton grid
export const ProductGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} variant="grid" />
      ))}
    </div>
  );
};

// Loading container for carousel
export const ProductCarouselSkeleton = ({ count = 4 }) => {
  return (
    <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} variant="carousel" />
      ))}
    </div>
  );
};

// Admin Product Table Row Skeleton with shimmer effect
export const ProductTableRowSkeleton = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr
          key={index}
          className="animate-pulse"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Product Info */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer flex-shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
                <div className="h-3 w-16 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              </div>
            </div>
          </td>
          {/* Category */}
          <td className="px-6 py-4">
            <div className="h-6 w-20 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
          </td>
          {/* Price */}
          <td className="px-6 py-4">
            <div className="space-y-1">
              <div className="h-4 w-24 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-3 w-20 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </td>
          {/* Stock */}
          <td className="px-6 py-4">
            <div className="h-4 w-12 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
          </td>
          {/* Sold */}
          <td className="px-6 py-4">
            <div className="h-4 w-10 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
          </td>
          {/* Rating */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-16 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </td>
          {/* Status */}
          <td className="px-6 py-4">
            <div className="h-6 w-20 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
          </td>
          {/* Shop */}
          <td className="px-6 py-4">
            <div className="h-4 w-24 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
          </td>
          {/* Actions */}
          <td className="px-6 py-4">
            <div className="flex justify-end">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

// Admin Page Header Skeleton
export const AdminHeaderSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
        <div className="h-4 w-72 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-24 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
};

// Admin Filter Bar Skeleton
export const AdminFilterSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 h-11 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
        <div className="h-11 w-40 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
        <div className="h-11 w-40 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
};

// Stats Cards Skeleton Row
export const StatsRowSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
            <div className="h-6 w-16 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-24 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
            <div className="h-4 w-32 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Product Detail Skeleton - Professional loading for product detail page
export const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Gallery Skeleton */}
          <div className="flex flex-col gap-6">
            {/* Main Image Skeleton */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </div>
              {/* Zoom icon skeleton */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-gray-300/50 rounded-full animate-pulse" />
            </div>

            {/* Thumbnail Gallery Skeleton */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info Skeleton */}
          <div className="flex flex-col gap-6">
            {/* Brand & Title */}
            <div className="space-y-3">
              <div className="h-5 w-24 bg-blue-100 rounded-full animate-pulse" />
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Rating Skeleton */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-5 h-5 bg-yellow-200 rounded animate-pulse"
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Price Skeleton */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-10 w-32 bg-blue-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-300 rounded animate-pulse" />
                <div className="h-6 w-16 bg-red-200 rounded-full animate-pulse" />
              </div>
              <div className="h-4 w-48 bg-green-200 rounded animate-pulse" />
            </div>

            {/* Variants Skeleton */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"
                      style={{ animationDelay: `${i * 75}ms` }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 75}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity Skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-4">
              <div className="flex-1 h-14 bg-blue-200 rounded-xl animate-pulse" />
              <div className="flex-1 h-14 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-14 w-14 bg-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Features Skeleton */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mt-12 space-y-6">
          <div className="flex gap-8 border-b">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-gray-200 rounded-t animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>

          {/* Tab Content Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <div
                            key={j}
                            className="w-3 h-3 bg-yellow-200 rounded"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoadingSpinner;
