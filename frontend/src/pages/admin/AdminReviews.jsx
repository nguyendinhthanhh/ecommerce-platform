import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import reviewService from "../../services/reviewService";
import { toast, Toaster } from "react-hot-toast";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20, // Increased default size for table view
    totalElements: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    rating: [],
    status: "ALL", // ALL, ACTIVE, HIDDEN
    replyStatus: "ALL", // ALL, REPLIED, NOT_REPLIED
    dateFrom: "",
    dateTo: "",
    isReported: false,
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Bulk Selection
  const [selectedReviews, setSelectedReviews] = useState(new Set());

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // Quick Reply Modal State
  const [replyModal, setReplyModal] = useState({
    isOpen: false,
    reviewId: null,
    reviewContent: null,
    existingReply: null,
  });
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    responseRate: 0,
  });

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

      const apiFilters = {
        status: filters.status === "ACTIVE" ? "ACTIVE" : (filters.status === "HIDDEN" ? "HIDDEN" : null),
        rating: filters.rating.length > 0 ? filters.rating[0] : null,
        isReplied: filters.replyStatus === "REPLIED" ? true : (filters.replyStatus === "NOT_REPLIED" ? false : null),
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null,
        isReported: filters.isReported || null,
        search: filters.search || null
      };

      const response = await reviewService.getAllReviews(
        apiFilters,
        pagination.page,
        pagination.size,
        sortBy,
        sortDir
      );

      const content = response.content || [];
      setReviews(content);

      setPagination(prev => ({
        ...prev,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      }));

      if (response.totalElements > 0 && stats.total === 0) {
        setStats({
          total: response.totalElements,
          avgRating: 4.8,
          responseRate: 92
        });
      }

    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Could not load reviews");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters, sortBy, sortDir]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openDropdown && !e.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  const toggleRatingFilter = (rating) => {
    setFilters(prev => {
      const current = prev.rating;
      const newRatings = current.includes(rating)
        ? current.filter(r => r !== rating)
        : [...current, rating];
      return { ...prev, rating: newRatings };
    });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = reviews.map(r => r.id);
      setSelectedReviews(new Set(allIds));
    } else {
      setSelectedReviews(new Set());
    }
  };

  const handleSelectReview = (id) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReviews(newSelected);
  };

  const handleBulkAction = async (action) => {
    if (selectedReviews.size === 0) return;
    if (!window.confirm(`Confirm ${action} for ${selectedReviews.size} reviews?`)) return;

    try {
      const promises = Array.from(selectedReviews).map(id => {
        if (action === 'delete') return reviewService.adminDeleteReview(id);
        if (action === 'hide') return reviewService.updateReviewStatus(id, 'HIDDEN');
        if (action === 'show') return reviewService.updateReviewStatus(id, 'ACTIVE');
        return Promise.resolve();
      });

      await Promise.all(promises);
      toast.success(`Batch ${action} completed`);
      setSelectedReviews(new Set());
      loadReviews();
    } catch (error) {
      toast.error("Batch action failed");
    }
  };

  const openReplyModal = (review) => {
    setReplyModal({
      isOpen: true,
      reviewId: review.id,
      reviewContent: review.comment,
      existingReply: review.reply
    });
    setReplyText(review.reply || "");
  };

  const closeReplyModal = () => {
    setReplyModal({ isOpen: false, reviewId: null, reviewContent: null, existingReply: null });
    setReplyText("");
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      await reviewService.replyToReview(replyModal.reviewId, replyText);
      toast.success("Response sent");
      closeReplyModal();
      loadReviews();
    } catch (error) {
      toast.error("Failed to send response");
    } finally {
      setSubmittingReply(false);
    }
  };

  const toggleStatus = async (review) => {
    try {
      const newStatus = review.status === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN';
      await reviewService.updateReviewStatus(review.id, newStatus);
      toast.success("Status updated");
      loadReviews();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleDismissReport = async (review) => {
    if (!window.confirm("Dismiss this report? The review will remain but the flag will be removed.")) return;
    try {
      await reviewService.dismissReport(review.id);
      toast.success("Report dismissed");
      loadReviews();
    } catch (error) {
      toast.error("Failed to dismiss report");
    }
  };

  // Render Helpers
  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span 
          key={i} 
          className={`text-base ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          {i < rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex flex-col h-[calc(100vh-100px)] gap-4">

        {/* Top Bar: Stats & Main Actions */}
        <div className="flex justify-between items-end bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Reviews</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Avg Rating</p>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-slate-800 dark:text-white">4.8</span>
                <span className="text-yellow-400 text-lg">★</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Response Rate</p>
              <p className="text-xl font-bold text-green-600">92%</p>
            </div>
          </div>

          <div className="flex gap-2">
            {selectedReviews.size > 0 ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                <span className="text-sm font-medium self-center mr-2 text-slate-600">{selectedReviews.size} selected</span>
                <button
                  onClick={() => handleBulkAction('hide')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Hide
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search reviews..."
                  className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-slate-50 dark:bg-slate-900 w-64"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Sidebar Filters */}
          <div className="w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-6 overflow-y-auto shrink-0 shadow-sm">

            {/* Reported Filter */}
            <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">flag</span>
                Moderation
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-red-300 text-red-600 focus:ring-red-500 w-4 h-4"
                  checked={filters.isReported}
                  onChange={(e) => handleFilterChange('isReported', e.target.checked)}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Show Reported Only</span>
              </label>
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Visibility Status</h3>
              <div className="space-y-1">
                {['ALL', 'ACTIVE', 'HIDDEN'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange('status', status)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${filters.status === status
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                  >
                    {status === 'ALL' ? 'All Reviews' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Status Filter */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Reply Status</h3>
              <div className="space-y-1">
                {['ALL', 'REPLIED', 'NOT_REPLIED'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange('replyStatus', status)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${filters.replyStatus === status
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`star-${star}`}
                      checked={filters.rating.includes(star)}
                      onChange={() => toggleRatingFilter(star)}
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                    />
                    <label htmlFor={`star-${star}`} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
                      <span className="flex gap-0.5">
                        {[...Array(star)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-sm">★</span>
                        ))}
                        {[...Array(5 - star)].map((_, i) => (
                          <span key={i} className="text-gray-300 text-sm">☆</span>
                        ))}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Date Range</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">From</label>
                  <input
                    type="date"
                    className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-primary focus:border-primary dark:bg-slate-900 dark:border-slate-700"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">To</label>
                  <input
                    type="date"
                    className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-primary focus:border-primary dark:bg-slate-900 dark:border-slate-700"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilters({
                  search: "",
                  rating: [],
                  status: "ALL",
                  replyStatus: "ALL",
                  dateFrom: "",
                  dateTo: "",
                  isReported: false,
                });
                setPagination(prev => ({ ...prev, page: 0 }));
              }}
              className="w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Clear All Filters
            </button>
          </div>

          {/* Data Table */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm">

            {/* Table Toolbar / Sort */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50">
              <span className="text-sm text-slate-500">Showing {reviews.length} reviews</span>
              <select
                className="text-sm border-none bg-transparent focus:ring-0 text-slate-600 font-medium cursor-pointer"
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

            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                        checked={reviews.length > 0 && selectedReviews.size === reviews.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase w-64">Product</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase w-40">User</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase w-32">Rating</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Review Content</th>
                    {filters.isReported && (
                      <th className="p-4 text-xs font-semibold text-red-500 uppercase w-48 bg-red-50 dark:bg-red-900/20">Report Reason</th>
                    )}
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase w-32">Date</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase w-24">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase w-20 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {loading ? (
                    [...Array(5)].map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="p-4"><div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                        <td className="p-4">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded shrink-0"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full"></div>)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                          </div>
                        </td>
                        {filters.isReported && <td className="p-4"><div className="h-3 bg-red-100 rounded w-full"></div></td>}
                        <td className="p-4"><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
                        <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></td>
                      </tr>
                    ))
                  ) : reviews.length === 0 ? (
                    <tr>
                      <td colSpan={filters.isReported ? 9 : 8} className="p-8 text-center text-slate-500">No matching reviews found.</td>
                    </tr>
                  ) : (
                    reviews.map(review => (
                      <tr
                        key={review.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group ${selectedReviews.has(review.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          } ${review.status === 'HIDDEN' ? 'opacity-60 bg-slate-50/50' : ''}`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                            checked={selectedReviews.has(review.id)}
                            onChange={() => handleSelectReview(review.id)}
                          />
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex gap-3">
                            <img
                              src={review.productThumbnail || "https://via.placeholder.com/40"}
                              alt=""
                              className="w-10 h-10 rounded border border-slate-200 object-cover"
                            />
                            <div className="line-clamp-2 text-sm font-medium text-slate-800 dark:text-white" title={review.productName}>
                              {review.productName}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="text-sm font-medium text-slate-800 dark:text-white">{review.customer?.fullName}</div>
                          <div className="text-xs text-slate-500">Order: #{review.orderCode}</div>
                        </td>
                        <td className="p-4 align-top">
                          {renderStars(review.rating)}
                          {review.rating <= 2 && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded font-bold uppercase">Low</span>
                          )}
                        </td>
                        <td className="p-4 align-top max-w-md">
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-1">
                            {review.comment}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {review.isReported && !filters.isReported && (
                              <span className="text-xs text-red-600 bg-red-50 inline-flex px-2 py-0.5 rounded items-center gap-1 border border-red-100 font-bold">
                                <span className="material-symbols-outlined text-[12px]">flag</span>
                                Reported
                              </span>
                            )}
                            {review.reply ? (
                              <div className="text-xs text-green-600 bg-green-50 inline-flex px-2 py-0.5 rounded items-center gap-1 border border-green-100">
                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                Replied
                              </div>
                            ) : (
                              <button
                                onClick={() => openReplyModal(review)}
                                className="text-xs text-primary font-medium hover:underline flex items-center gap-1 opacity-100"
                              >
                                <span className="material-symbols-outlined text-[14px]">reply</span>
                                Reply now
                              </button>
                            )}
                          </div>
                        </td>

                        {filters.isReported && (
                          <td className="p-4 align-top bg-red-50/50 dark:bg-red-900/10">
                            <div className="text-sm text-red-700 dark:text-red-300 italic">"{review.reportReason}"</div>
                          </td>
                        )}

                        <td className="p-4 align-top text-sm text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 align-top">
                          <button
                            onClick={() => toggleStatus(review)}
                            className={`px-2 py-1 rounded text-xs font-bold uppercase ${review.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                          >
                            {review.status}
                          </button>
                        </td>
                        <td className="p-4 align-top text-right">
                          <div className="relative inline-block dropdown-container">
                            <button 
                              onClick={() => setOpenDropdown(openDropdown === review.id ? null : review.id)}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                            {/* Dropdown */}
                            {openDropdown === review.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-1 animate-in fade-in slide-in-from-top-2">
                                <button 
                                  onClick={() => {
                                    openReplyModal(review);
                                    setOpenDropdown(null);
                                  }} 
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">reply</span>
                                    View/Reply
                                  </span>
                                </button>
                                <button 
                                  onClick={() => {
                                    toggleStatus(review);
                                    setOpenDropdown(null);
                                  }} 
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">
                                      {review.status === 'HIDDEN' ? 'visibility' : 'visibility_off'}
                                    </span>
                                    {review.status === 'HIDDEN' ? 'Show' : 'Hide'}
                                  </span>
                                </button>
                                {review.isReported && (
                                  <button 
                                    onClick={() => {
                                      handleDismissReport(review);
                                      setOpenDropdown(null);
                                    }} 
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="material-symbols-outlined text-[18px]">flag_circle</span>
                                      Dismiss Report
                                    </span>
                                  </button>
                                )}
                                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                <button 
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this review?')) {
                                      reviewService.adminDeleteReview(review.id)
                                        .then(() => {
                                          toast.success('Review deleted');
                                          loadReviews();
                                        })
                                        .catch(() => toast.error('Failed to delete'));
                                    }
                                    setOpenDropdown(null);
                                  }} 
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Delete
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  {pagination.totalElements > 0
                    ? `Page ${pagination.page + 1} of ${pagination.totalPages} (${pagination.totalElements} total)`
                    : 'No reviews'}
                </span>
                <select
                  className="text-sm border border-slate-200 rounded px-2 py-1 focus:ring-primary focus:border-primary"
                  value={pagination.size}
                  onChange={(e) => setPagination({ ...pagination, size: Number(e.target.value), page: 0 })}
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 0}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages - 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {replyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Reply to Review</h3>
              <button onClick={closeReplyModal} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-sm text-slate-600 italic border border-slate-100 dark:border-slate-800">
                "{replyModal.reviewContent}"
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Response</label>
                <textarea
                  rows="5"
                  className="w-full rounded-lg border-slate-200 dark:border-slate-700 p-3 text-sm focus:ring-primary focus:border-primary"
                  placeholder="Type your response here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  autoFocus
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 flex justify-end gap-3">
              <button
                onClick={closeReplyModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitReply}
                disabled={submittingReply || !replyText.trim()}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 shadow-sm"
              >
                {submittingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminReviews;
