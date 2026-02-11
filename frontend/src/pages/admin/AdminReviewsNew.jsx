import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import reviewService from "../../services/reviewService";
import { toast, Toaster } from "react-hot-toast";

const AdminReviewsNew = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // View mode: 'cards' or 'compact'
  const [viewMode, setViewMode] = useState('cards');

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    priority: "ALL", // ALL, URGENT, NEEDS_REPLY, REPORTED
    rating: [],
    status: "ALL",
    dateFrom: "",
    dateTo: "",
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Quick stats
  const [stats, setStats] = useState({
    total: 0,
    needsReply: 0,
    reported: 0,
    avgRating: 0,
    lowRating: 0,
  });

  // Inline reply state
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);

      // Build filters based on priority
      let apiFilters = {
        search: filters.search || null,
        status: filters.status === "ALL" ? null : filters.status,
        rating: filters.rating.length > 0 ? filters.rating[0] : null,
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null,
      };

      // Priority-based filtering
      if (filters.priority === "URGENT") {
        apiFilters.rating = 1; // 1-2 star reviews
      } else if (filters.priority === "NEEDS_REPLY") {
        apiFilters.isReplied = false;
      } else if (filters.priority === "REPORTED") {
        apiFilters.isReported = true;
      }

      const response = await reviewService.getAllReviews(
        apiFilters,
        pagination.page,
        pagination.size,
        sortBy,
        sortDir
      );

      setReviews(response.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      }));

      // Calculate stats
      if (response.content) {
        const needsReply = response.content.filter(r => !r.reply).length;
        const reported = response.content.filter(r => r.isReported).length;
        const lowRating = response.content.filter(r => r.rating <= 2).length;
        const avgRating = response.content.reduce((sum, r) => sum + r.rating, 0) / response.content.length || 0;

        setStats({
          total: response.totalElements,
          needsReply,
          reported,
          avgRating: avgRating.toFixed(1),
          lowRating,
        });
      }

    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters, sortBy, sortDir]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Handlers
  const handleInlineReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      setSubmittingReply(true);
      await reviewService.replyToReview(reviewId, replyText);
      toast.success("Reply sent successfully");
      setReplyingTo(null);
      setReplyText("");
      loadReviews();
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const toggleStatus = async (review) => {
    try {
      const newStatus = review.status === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN';
      await reviewService.updateReviewStatus(review.id, newStatus);
      toast.success(`Review ${newStatus === 'HIDDEN' ? 'hidden' : 'shown'}`);
      loadReviews();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review permanently?')) return;
    
    try {
      await reviewService.adminDeleteReview(reviewId);
      toast.success("Review deleted");
      loadReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const dismissReport = async (reviewId) => {
    try {
      await reviewService.dismissReport(reviewId);
      toast.success("Report dismissed");
      loadReviews();
    } catch (error) {
      toast.error("Failed to dismiss report");
    }
  };

  // Helper functions
  const getPriorityBadge = (review) => {
    if (review.isReported) {
      return { label: "REPORTED", color: "bg-red-100 text-red-700 border-red-200", icon: "flag" };
    }
    if (!review.reply && review.rating <= 2) {
      return { label: "URGENT", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "priority_high" };
    }
    if (!review.reply) {
      return { label: "NEEDS REPLY", color: "bg-blue-100 text-blue-700 border-blue-200", icon: "chat_bubble" };
    }
    return null;
  };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          {i < rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );

  const getSentimentColor = (rating) => {
    if (rating >= 4) return "text-green-600";
    if (rating === 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      
      <div className="flex flex-col h-[calc(100vh-100px)] gap-6">
        
        {/* Header with Stats Cards */}
        <div className="grid grid-cols-5 gap-4">
          {/* Total Reviews */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-3xl opacity-80">rate_review</span>
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Total Reviews</p>
          </div>

          {/* Needs Reply */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 shadow-lg cursor-pointer hover:scale-105 transition-transform"
               onClick={() => setFilters({...filters, priority: "NEEDS_REPLY"})}>
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-3xl opacity-80">chat_bubble</span>
              <span className="text-2xl font-bold">{stats.needsReply}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Needs Reply</p>
          </div>

          {/* Reported */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4 shadow-lg cursor-pointer hover:scale-105 transition-transform"
               onClick={() => setFilters({...filters, priority: "REPORTED"})}>
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-3xl opacity-80">flag</span>
              <span className="text-2xl font-bold">{stats.reported}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Reported</p>
          </div>

          {/* Low Rating */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg cursor-pointer hover:scale-105 transition-transform"
               onClick={() => setFilters({...filters, priority: "URGENT"})}>
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-3xl opacity-80">sentiment_dissatisfied</span>
              <span className="text-2xl font-bold">{stats.lowRating}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Low Rating (≤2★)</p>
          </div>

          {/* Avg Rating */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-3xl opacity-80">star</span>
              <span className="text-2xl font-bold">{stats.avgRating}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Average Rating</p>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                placeholder="Search reviews, products, customers..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            {/* Priority Filter */}
            <div className="flex gap-2">
              {['ALL', 'URGENT', 'NEEDS_REPLY', 'REPORTED'].map(priority => (
                <button
                  key={priority}
                  onClick={() => setFilters({...filters, priority})}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.priority === priority
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {priority.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'cards' ? 'bg-white shadow-sm' : 'text-slate-600'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'compact' ? 'bg-white shadow-sm' : 'text-slate-600'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
            </div>

            {/* Sort */}
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split('-');
                setSortBy(by);
                setSortDir(dir);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="rating-asc">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">inbox</span>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No reviews found</h3>
              <p className="text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className={viewMode === 'cards' ? 'grid gap-4' : 'space-y-2'}>
              {reviews.map(review => {
                const priority = getPriorityBadge(review);
                const isReplying = replyingTo === review.id;

                return (
                  <div
                    key={review.id}
                    className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
                      review.status === 'HIDDEN' ? 'opacity-60 border-slate-200' :
                      priority?.label === 'REPORTED' ? 'border-red-200 bg-red-50/30' :
                      priority?.label === 'URGENT' ? 'border-orange-200 bg-orange-50/30' :
                      'border-slate-200 hover:border-blue-300'
                    } ${viewMode === 'cards' ? 'p-6' : 'p-4'}`}
                  >
                    <div className="flex gap-4">
                      {/* Product Thumbnail */}
                      <div className="flex-shrink-0">
                        <img
                          src={review.productThumbnail || "https://via.placeholder.com/80"}
                          alt={review.productName}
                          className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                        />
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 truncate">{review.productName}</h3>
                              {priority && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${priority.color} flex items-center gap-1`}>
                                  <span className="material-symbols-outlined text-[14px]">{priority.icon}</span>
                                  {priority.label}
                                </span>
                              )}
                              {review.status === 'HIDDEN' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                                  HIDDEN
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">person</span>
                                {review.customer?.fullName}
                              </span>
                              <span>•</span>
                              <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                              <span>•</span>
                              <span className="text-slate-500">Order #{review.orderCode}</span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => toggleStatus(review)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title={review.status === 'HIDDEN' ? 'Show review' : 'Hide review'}
                            >
                              <span className="material-symbols-outlined text-[20px] text-slate-600">
                                {review.status === 'HIDDEN' ? 'visibility' : 'visibility_off'}
                              </span>
                            </button>
                            {review.isReported && (
                              <button
                                onClick={() => dismissReport(review.id)}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Dismiss report"
                              >
                                <span className="material-symbols-outlined text-[20px] text-blue-600">flag_circle</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete review"
                            >
                              <span className="material-symbols-outlined text-[20px] text-red-600">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Rating & Review Content */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-2">
                            {renderStars(review.rating)}
                            <span className={`text-sm font-semibold ${getSentimentColor(review.rating)}`}>
                              {review.rating === 5 ? 'Excellent' :
                               review.rating === 4 ? 'Good' :
                               review.rating === 3 ? 'Average' :
                               review.rating === 2 ? 'Poor' : 'Very Poor'}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                          {review.isReported && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-1">
                                <span className="material-symbols-outlined text-[16px]">report</span>
                                Report Reason:
                              </div>
                              <p className="text-red-600 text-sm italic">"{review.reportReason}"</p>
                            </div>
                          )}
                        </div>

                        {/* Shop Reply Section */}
                        {review.reply ? (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-blue-600 text-[18px]">store</span>
                              <span className="text-sm font-semibold text-blue-900">Shop Response</span>
                              <span className="text-xs text-blue-600">
                                {new Date(review.repliedAt || review.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm">{review.reply}</p>
                            <button
                              onClick={() => {
                                setReplyingTo(review.id);
                                setReplyText(review.reply);
                              }}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                              Edit Reply
                            </button>
                          </div>
                        ) : isReplying ? (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Your Reply</label>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a professional response..."
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows="3"
                              autoFocus
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleInlineReply(review.id)}
                                disabled={submittingReply || !replyText.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                {submittingReply ? 'Sending...' : 'Send Reply'}
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(review.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <span className="material-symbols-outlined text-[18px]">reply</span>
                            Reply to Customer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  Showing {reviews.length} of {pagination.totalElements} reviews
                </span>
                <select
                  className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                  value={pagination.size}
                  onChange={(e) => setPagination({ ...pagination, size: Number(e.target.value), page: 0 })}
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page === 0}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                    const pageNum = pagination.page < 3 ? idx : pagination.page - 2 + idx;
                    if (pageNum >= pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination({ ...pagination, page: pageNum })}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={pagination.page >= pagination.totalPages - 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-1"
                >
                  Next
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviewsNew;
