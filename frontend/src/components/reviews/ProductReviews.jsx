import React, { useState, useEffect, useCallback } from "react";
import reviewService from "../../services/reviewService";
import { toast } from "react-hot-toast";
import authService from "../../services/authService";
import { Link } from "react-router-dom";

const ProductReviews = ({ productId }) => {
    const user = authService.getUser();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 5,
        totalElements: 0,
        totalPages: 0,
    });
    const [stats, setStats] = useState(null);

    // Eligibility State
    const [eligibility, setEligibility] = useState({
        canReview: false,
        orderId: null,
        message: "",
    });

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]); // Array of strings (urls) - simplified for now, ideally file upload
    const [submitting, setSubmitting] = useState(false);

    // Reporting State
    const [reportModal, setReportModal] = useState({ isOpen: false, reviewId: null });
    const [reportReason, setReportReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    // Edit State
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");
    const [updating, setUpdating] = useState(false);

    // Delete State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, reviewId: null });
    const [deleting, setDeleting] = useState(false);

    // Predefined report reasons
    const reportReasons = [
        "Spam or misleading",
        "Offensive language",
        "Fake review",
        "Inappropriate content",
        "Other (specify below)"
    ];

    const loadReviews = useCallback(async () => {
        try {
            setLoading(true);
            const data = await reviewService.getReviewsByProduct(
                productId,
                pagination.page,
                pagination.size
            );
            setReviews(data.content);
            setPagination((prev) => ({
                ...prev,
                totalElements: data.totalElements,
                totalPages: data.totalPages,
            }));
        } catch (error) {
            console.error("Failed to load reviews", error);
        } finally {
            setLoading(false);
        }
    }, [productId, pagination.page, pagination.size]);

    const checkEligibility = useCallback(async () => {
        // Always check eligibility, even for guests (API will return canReview=false)
        try {
            const data = await reviewService.checkEligibility(productId);
            setEligibility(data);
        } catch (error) {
            // If not authenticated, set default guest state
            if (error.response?.status === 401) {
                setEligibility({
                    canReview: false,
                    orderId: null,
                    message: "Please login to review this product",
                });
            } else {
                console.error("Failed to check eligibility", error);
            }
        }
    }, [productId]);

    useEffect(() => {
        loadReviews();
        checkEligibility(); // Check for both logged in and guest users
    }, [loadReviews, checkEligibility]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error("Please write a comment");
            return;
        }

        // In a real app, you'd upload images first and get URLs.
        // For now, we'll assume no image upload or just text URLs if input provided.

        try {
            setSubmitting(true);
            await reviewService.createReview({
                productId: Number(productId),
                orderId: eligibility.orderId,
                rating,
                comment,
                images: []
            });
            toast.success("Review submitted successfully!");
            setShowForm(false);
            setComment("");
            setRating(5);
            loadReviews(); // Refresh list
            checkEligibility(); // Re-check (should be false now)
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReport = async () => {
        const finalReason = reportReason === "Other (specify below)" 
            ? customReason.trim() 
            : reportReason;
            
        if (!finalReason) {
            toast.error("Please provide a reason");
            return;
        }
        
        try {
            await reviewService.reportReview(reportModal.reviewId, finalReason);
            toast.success("Review reported. Thank you.");
            setReportModal({ isOpen: false, reviewId: null });
            setReportReason("");
            setCustomReason("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to report review");
        }
    };

    const handleEditReview = (review) => {
        setEditingReview(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        if (!editComment.trim()) {
            toast.error("Please write a comment");
            return;
        }

        try {
            setUpdating(true);
            await reviewService.updateReview(editingReview, {
                rating: editRating,
                comment: editComment
            });
            toast.success("Review updated successfully!");
            setEditingReview(null);
            loadReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update review");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteReview = async () => {
        try {
            setDeleting(true);
            await reviewService.deleteReview(deleteModal.reviewId);
            toast.success("Review deleted successfully!");
            setDeleteModal({ isOpen: false, reviewId: null });
            loadReviews();
            checkEligibility(); // Re-check eligibility after delete
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete review");
        } finally {
            setDeleting(false);
        }
    };

    const renderStars = (count) => (
        <div className="flex text-yellow-400 text-base gap-0.5">
            {[...Array(5)].map((_, i) => (
                <span key={i} className={`${i < count ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {i < count ? '★' : '☆'}
                </span>
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header & Write Review Button */}
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Customer Reviews ({pagination.totalElements})</h3>

                {eligibility.canReview ? (
                    !showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Write a Review
                        </button>
                    )
                ) : (
                    !user ? (
                        <Link to="/login" className="text-blue-600 hover:underline text-sm">Log in to write a review</Link>
                    ) : (
                        // Optional: Show message why they can't review?
                        <span className="text-gray-500 text-sm italic">{eligibility.message}</span>
                    )
                )}
            </div>

            {/* Write Review Form */}
            {showForm && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <h4 className="font-bold text-lg mb-4">Write your review</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-3xl transition-all hover:scale-110 ${
                                            rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                                        }`}
                                    >
                                        {rating >= star ? '★' : '☆'}
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-600 self-center font-medium">
                                    {rating} {rating === 1 ? 'star' : 'stars'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                            <textarea
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows="4"
                                placeholder="What did you like or dislike?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    // Skeleton
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))
                ) : reviews.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No reviews yet. Be the first to review!
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                            {editingReview === review.id ? (
                                // Edit Form
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                    <h4 className="font-bold text-lg mb-4">Edit your review</h4>
                                    <form onSubmit={handleUpdateReview} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        type="button"
                                                        key={star}
                                                        onClick={() => setEditRating(star)}
                                                        className={`text-3xl transition-all hover:scale-110 ${
                                                            editRating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                                                        }`}
                                                    >
                                                        {editRating >= star ? '★' : '☆'}
                                                    </button>
                                                ))}
                                                <span className="ml-2 text-sm text-gray-600 self-center font-medium">
                                                    {editRating} {editRating === 1 ? 'star' : 'stars'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                                            <textarea
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                rows="4"
                                                value={editComment}
                                                onChange={(e) => setEditComment(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="flex gap-3 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setEditingReview(null)}
                                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={updating}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                                            >
                                                {updating ? "Updating..." : "Update Review"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                // Display Review
                                <>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <img
                                                src={review.customer?.avatar || "https://ui-avatars.com/api/?name=" + (review.customer?.fullName || "User")}
                                                alt={review.customer?.fullName}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                            />
                                            <div>
                                                <h5 className="font-bold text-gray-900">{review.customer?.fullName}</h5>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {renderStars(review.rating)}
                                                    <span className="text-xs text-gray-500">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {/* Edit & Delete for own reviews */}
                                            {user && user.id === review.customer?.id && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditReview(review)}
                                                        className="text-gray-400 hover:text-blue-600 transition"
                                                        title="Edit review"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, reviewId: review.id })}
                                                        className="text-gray-400 hover:text-red-600 transition"
                                                        title="Delete review"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </>
                                            )}
                                            
                                            {/* Report for other reviews */}
                                            {user && user.id !== review.customer?.id && (
                                                <button
                                                    onClick={() => setReportModal({ isOpen: true, reviewId: review.id })}
                                                    className="text-gray-400 hover:text-red-500 transition"
                                                    title="Report this review"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">flag</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 text-gray-700 leading-relaxed pl-14">
                                        <p>{review.comment}</p>
                                    </div>

                                    {/* Admin Reply */}
                                    {review.reply && (
                                        <div className="mt-4 ml-14 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                                            <p className="text-xs font-bold text-gray-900 mb-1">Response from Shop</p>
                                            <p className="text-sm text-gray-600">{review.reply}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        disabled={pagination.page === 0}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-gray-600">
                        Page {pagination.page + 1} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.page >= pagination.totalPages - 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Report Modal */}
            {reportModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md m-4 shadow-xl animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-600">flag</span>
                            Report Review
                        </h3>
                        
                        <div className="space-y-3 mb-4">
                            <p className="text-sm text-gray-600">Why are you reporting this review?</p>
                            {reportReasons.map((reason) => (
                                <label key={reason} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason}
                                        checked={reportReason === reason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-700">{reason}</span>
                                </label>
                            ))}
                        </div>

                        {reportReason === "Other (specify below)" && (
                            <textarea
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 mb-4"
                                rows="3"
                                placeholder="Please specify the reason..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                            ></textarea>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setReportModal({ isOpen: false, reviewId: null });
                                    setReportReason("");
                                    setCustomReason("");
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={!reportReason || (reportReason === "Other (specify below)" && !customReason.trim())}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm m-4 shadow-xl animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-600">warning</span>
                            Delete Review
                        </h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this review? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, reviewId: null })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteReview}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
