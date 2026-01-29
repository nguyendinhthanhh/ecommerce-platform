import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { TableRowSkeleton } from "../../components/common/LoadingSpinner";
import reviewService from "../../services/reviewService";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rating: "all",
    sortBy: "createdAt",
    sortDir: "desc",
    keyword: "",
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProductReviewsModal, setShowProductReviewsModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [loadingProductReviews, setLoadingProductReviews] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAllReviews(
        pagination.page,
        pagination.size,
        filters.sortBy,
        filters.sortDir,
      );

      if (response) {
        if (response.content) {
          setReviews(response.content);
          setPagination((prev) => ({
            ...prev,
            totalElements: response.totalElements,
            totalPages: response.totalPages,
          }));
        } else if (Array.isArray(response)) {
          setReviews(response);
          setPagination((prev) => ({
            ...prev,
            totalElements: response.length,
            totalPages: 1,
          }));
        }
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      showToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters.sortBy, filters.sortDir]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleViewProductReviews = async (productId, productName) => {
    try {
      setSelectedProductId({ id: productId, name: productName });
      setLoadingProductReviews(true);
      setShowProductReviewsModal(true);

      const response = await reviewService.getReviewsByProduct(
        productId,
        0,
        50,
      );
      if (response) {
        setProductReviews(response.content || response || []);
      }
    } catch (error) {
      console.error("Error loading product reviews:", error);
      showToast("Failed to load product reviews", "error");
    } finally {
      setLoadingProductReviews(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      setDeleting(true);
      await reviewService.deleteReview(selectedReview.id);
      showToast("Review deleted successfully", "success");
      setShowDeleteModal(false);
      setSelectedReview(null);
      loadReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      showToast(
        error.response?.data?.message || "Failed to delete review",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Stats calculations
  const stats = {
    total: pagination.totalElements,
    averageRating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          ).toFixed(1)
        : 0,
    fiveStars: reviews.filter((r) => r.rating === 5).length,
    recentToday: reviews.filter((r) => {
      const today = new Date().toDateString();
      return new Date(r.createdAt).toDateString() === today;
    }).length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-in ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toast.type === "success"
                ? "check_circle"
                : toast.type === "error"
                  ? "error"
                  : "info"}
            </span>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                  reviews
                </span>
              </div>
              Review Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Monitor and manage customer reviews across all products
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                  rate_review
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Reviews
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400">
                  star
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.averageRating}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Average Rating
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                  thumb_up
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.fiveStars}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  5-Star Reviews
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">
                  schedule
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.recentToday}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Today's Reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search reviews by content, customer name..."
                  value={filters.keyword}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, keyword: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <select
              value={filters.rating}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, rating: e.target.value }))
              }
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="createdAt">Date</option>
              <option value="rating">Rating</option>
            </select>

            {/* Sort Direction */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  sortDir: prev.sortDir === "desc" ? "asc" : "desc",
                }))
              }
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                {filters.sortDir === "desc" ? "arrow_downward" : "arrow_upward"}
              </span>
              {filters.sortDir === "desc" ? "Newest" : "Oldest"}
            </button>

            {/* Refresh */}
            <button
              onClick={loadReviews}
              className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRowSkeleton key={i} columns={6} />
                  ))
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">
                          rate_review
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                          No reviews found
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                          Reviews will appear here when customers submit them
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {(review.customerName || review.userName || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {review.customerName ||
                                review.userName ||
                                "Anonymous"}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {review.customerEmail ||
                                review.userEmail ||
                                "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleViewProductReviews(
                              review.productId,
                              review.productName,
                            )
                          }
                          className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors -ml-2"
                        >
                          {review.productThumbnail && (
                            <img
                              src={review.productThumbnail}
                              alt={review.productName}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/48?text=No+Image";
                              }}
                            />
                          )}
                          <div className="text-left">
                            <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                              {review.productName ||
                                `Product #${review.productId}`}
                            </p>
                            <p className="text-sm text-primary">
                              View all reviews →
                            </p>
                          </div>
                        </button>
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {renderStars(review.rating)}
                          <span className="text-sm text-slate-500 mt-1">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>

                      {/* Review Content */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                          {review.comment || review.content || "No comment"}
                        </p>
                        {(review.comment || review.content || "").length >
                          100 && (
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowDetailModal(true);
                            }}
                            className="text-sm text-primary hover:underline mt-1"
                          >
                            Read more
                          </button>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {formatDate(review.createdAt)}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-xl">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-xl">
                              delete
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
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {pagination.page * pagination.size + 1} to{" "}
                {Math.min(
                  (pagination.page + 1) * pagination.size,
                  pagination.totalElements,
                )}{" "}
                of {pagination.totalElements} reviews
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(0, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 0}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const pageNum = i;
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: pageNum }))
                      }
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pagination.page === pageNum
                          ? "bg-primary text-white"
                          : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.totalPages - 1, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Review Detail Modal */}
        {showDetailModal && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDetailModal(false)}
            />
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-500">
                    rate_review
                  </span>
                  Review Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {(
                      selectedReview.customerName ||
                      selectedReview.userName ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-slate-900 dark:text-white">
                      {selectedReview.customerName ||
                        selectedReview.userName ||
                        "Anonymous"}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {selectedReview.customerEmail ||
                        selectedReview.userEmail ||
                        "No email"}
                    </p>
                    <p className="text-sm text-slate-400">
                      Reviewed on {formatDate(selectedReview.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {selectedReview.productThumbnail && (
                    <img
                      src={selectedReview.productThumbnail}
                      alt={selectedReview.productName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {selectedReview.productName ||
                        `Product #${selectedReview.productId}`}
                    </p>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleViewProductReviews(
                          selectedReview.productId,
                          selectedReview.productName,
                        );
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      View all reviews for this product →
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Rating
                  </p>
                  <div className="flex items-center gap-3">
                    {renderStars(selectedReview.rating)}
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Review
                  </p>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                      {selectedReview.comment ||
                        selectedReview.content ||
                        "No comment provided"}
                    </p>
                  </div>
                </div>

                {/* Review Images if any */}
                {selectedReview.images && selectedReview.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Attached Images
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedReview.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Review image ${index + 1}`}
                          className="w-24 h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete
                  </span>
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Reviews Modal */}
        {showProductReviewsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowProductReviewsModal(false)}
            />
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-500">
                    star
                  </span>
                  Reviews for{" "}
                  {selectedProductId?.name ||
                    `Product #${selectedProductId?.id}`}
                </h2>
                <button
                  onClick={() => setShowProductReviewsModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {loadingProductReviews ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : productReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3">
                      rate_review
                    </span>
                    <p className="text-slate-500 dark:text-slate-400">
                      No reviews for this product yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Stats Summary */}
                    <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          {(
                            productReviews.reduce(
                              (sum, r) => sum + (r.rating || 0),
                              0,
                            ) / productReviews.length
                          ).toFixed(1)}
                        </p>
                        <div className="flex justify-center my-1">
                          {renderStars(
                            Math.round(
                              productReviews.reduce(
                                (sum, r) => sum + (r.rating || 0),
                                0,
                              ) / productReviews.length,
                            ),
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {productReviews.length} reviews
                        </p>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = productReviews.filter(
                            (r) => r.rating === star,
                          ).length;
                          const percentage =
                            (count / productReviews.length) * 100;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 w-8">
                                {star}★
                              </span>
                              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-500 w-8">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {productReviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {(review.customerName || review.userName || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {review.customerName ||
                                    review.userName ||
                                    "Anonymous"}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}
                              <button
                                onClick={() => {
                                  setSelectedReview(review);
                                  setShowProductReviewsModal(false);
                                  setShowDeleteModal(true);
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            {review.comment || review.content || "No comment"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">
                    delete_forever
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Delete Review?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete this review by{" "}
                  <span className="font-semibold">
                    {selectedReview.customerName ||
                      selectedReview.userName ||
                      "Anonymous"}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    disabled={deleting}
                    className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
