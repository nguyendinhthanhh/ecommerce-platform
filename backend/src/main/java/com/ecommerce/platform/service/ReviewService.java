package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.CreateReviewRequest;
import com.ecommerce.platform.dto.request.UpdateReviewRequest;
import com.ecommerce.platform.dto.request.UpdateReviewStatusRequest;
import com.ecommerce.platform.dto.response.ReviewResponse;
import com.ecommerce.platform.dto.response.ReviewStatisticsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {


    ReviewResponse createReview(Long customerId, CreateReviewRequest request);


    ReviewResponse updateReview(Long reviewId, Long customerId, UpdateReviewRequest request);


    void deleteReview(Long reviewId, Long customerId);


    Page<ReviewResponse> getCustomerReviews(Long customerId, Pageable pageable);

    boolean canReviewProduct(Long customerId, Long productId, Long orderId);


    Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable);



    ReviewStatisticsResponse getProductReviewStatistics(Long productId);


    ReviewResponse getReviewById(Long reviewId);


    Page<ReviewResponse> getAllReviews(String status, Pageable pageable);

    ReviewResponse updateReviewStatus(Long reviewId, UpdateReviewStatusRequest request);

    void adminDeleteReview(Long reviewId);
}

