package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.CreateReviewRequest;
import com.ecommerce.platform.dto.request.UpdateReviewRequest;
import com.ecommerce.platform.dto.request.UpdateReviewStatusRequest;
import com.ecommerce.platform.dto.response.ApiResponse;
import com.ecommerce.platform.dto.response.PageResponse;
import com.ecommerce.platform.dto.response.ReviewResponse;
import com.ecommerce.platform.dto.response.ReviewStatisticsResponse;
import com.ecommerce.platform.security.UserPrincipal;
import com.ecommerce.platform.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "APIs for product reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Get product reviews", description = "Get paginated reviews for a product (public)")
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(
                reviewService.getProductReviews(productId, PageRequest.of(page, size, sort)))));
    }

    @Operation(summary = "Get product review statistics", description = "Get average rating and rating distribution for a product")
    @GetMapping("/product/{productId}/statistics")
    public ResponseEntity<ApiResponse<ReviewStatisticsResponse>> getProductReviewStatistics(
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviewStatistics(productId)));
    }

    @Operation(summary = "Get review by ID", description = "Get a specific review by ID")
    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long reviewId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewById(reviewId)));
    }

    @Operation(summary = "Create review", description = "Create a review for a purchased product")
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse review = reviewService.createReview(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review created successfully", review));
    }

    @Operation(summary = "Update review", description = "Update customer's own review")
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateReviewRequest request) {
        ReviewResponse review = reviewService.updateReview(reviewId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", review));
    }

    @Operation(summary = "Delete review", description = "Delete customer's own review")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        reviewService.deleteReview(reviewId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    @Operation(summary = "Get my reviews", description = "Get current user's reviews")
    @GetMapping("/my-reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(
                reviewService.getCustomerReviews(currentUser.getId(), PageRequest.of(page, size, sort)))));
    }

    @Operation(summary = "Check if can review", description = "Check if user can review a product for an order")
    @GetMapping("/can-review")
    public ResponseEntity<ApiResponse<Boolean>> canReviewProduct(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam Long productId,
            @RequestParam Long orderId) {
        boolean canReview = reviewService.canReviewProduct(currentUser.getId(), productId, orderId);
        return ResponseEntity.ok(ApiResponse.success(canReview));
    }

    @Operation(summary = "Get all reviews for management", description = "Get all reviews with optional status filter (Staff/Admin only)")
    @GetMapping("/management")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getAllReviewsForManagement(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(
                reviewService.getAllReviews(status, PageRequest.of(page, size, sort)))));
    }

    @Operation(summary = "Update review status", description = "Update review status (hide/show) (Staff/Admin only)")
    @PatchMapping("/{reviewId}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReviewStatus(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewStatusRequest request) {
        ReviewResponse review = reviewService.updateReviewStatus(reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("Review status updated successfully", review));
    }

    @Operation(summary = "Admin delete review", description = "Delete any review (Admin only)")
    @DeleteMapping("/admin/{reviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> adminDeleteReview(@PathVariable Long reviewId) {
        reviewService.adminDeleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    @Operation(summary = "Get customer reviews", description = "Get reviews by customer ID (Staff/Admin only)")
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getCustomerReviews(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(
                reviewService.getCustomerReviews(customerId, PageRequest.of(page, size, sort)))));
    }
}
