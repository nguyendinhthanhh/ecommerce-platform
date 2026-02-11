package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.request.CreateReviewRequest;
import com.ecommerce.platform.dto.request.UpdateReviewRequest;
import com.ecommerce.platform.dto.request.UpdateReviewStatusRequest;
import com.ecommerce.platform.dto.response.ReviewResponse;
import com.ecommerce.platform.dto.response.ReviewStatisticsResponse;
import com.ecommerce.platform.entity.Order;
import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.entity.Review;
import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.repository.OrderRepository;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.repository.ReviewRepository;
import com.ecommerce.platform.repository.UserRepository;
import com.ecommerce.platform.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse createReview(Long customerId, CreateReviewRequest request) {

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", customerId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("This order does not belong to you");
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new BadRequestException("You can only review products from delivered orders");
        }

        boolean productInOrder = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(request.getProductId()));
        if (!productInOrder) {
            throw new BadRequestException("This product was not in your order");
        }

        if (reviewRepository
                .findByCustomerIdAndProductIdAndOrderId(customerId, request.getProductId(), request.getOrderId())
                .isPresent()) {
            throw new BadRequestException("You have already reviewed this product for this order");
        }

        Review review = Review.builder()
                .product(product)
                .customer(customer)
                .order(order)
                .rating(request.getRating())
                .comment(request.getComment())
                .images(request.getImages())
                .status(Review.ReviewStatus.ACTIVE)
                .build();

        review = reviewRepository.save(review);
        return mapToResponse(review);
    }

    @Override
    public ReviewResponse updateReview(Long reviewId, Long customerId, UpdateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You can only update your own reviews");
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }
        if (request.getImages() != null) {
            review.setImages(request.getImages());
        }

        review = reviewRepository.save(review);
        return mapToResponse(review);
    }

    @Override
    public void deleteReview(Long reviewId, Long customerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getCustomerReviews(Long customerId, Pageable pageable) {
        return reviewRepository.findByCustomerId(customerId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReviewProduct(Long customerId, Long productId, Long orderId) {

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || !order.getCustomer().getId().equals(customerId)) {
            return false;
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            return false;
        }

        boolean productInOrder = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(productId));
        if (!productInOrder) {
            return false;
        }

        return reviewRepository.findByCustomerIdAndProductIdAndOrderId(customerId, productId, orderId).isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {

        return reviewRepository.findByProductIdAndStatus(productId, Review.ReviewStatus.ACTIVE, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewStatisticsResponse getProductReviewStatistics(Long productId) {
        Double averageRating = reviewRepository.calculateAverageRating(productId);
        Integer totalReviews = reviewRepository.countActiveReviewsByProductId(productId);

        Map<Integer, Integer> ratingDistribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            Integer count = reviewRepository.countByProductIdAndRatingAndStatus(productId, i,
                    Review.ReviewStatus.ACTIVE);
            ratingDistribution.put(i, count != null ? count : 0);
        }

        return ReviewStatisticsResponse.builder()
                .productId(productId)
                .averageRating(averageRating != null ? averageRating : 0.0)
                .totalReviews(totalReviews != null ? totalReviews : 0)
                .ratingDistribution(ratingDistribution)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviews(
            String status,
            Integer rating,
            Boolean isReplied,
            java.time.LocalDate dateFrom,
            java.time.LocalDate dateTo,
            Long productId,
            Long categoryId,
            Boolean isReported,
            String search,
            Pageable pageable) {

        Review.ReviewStatus reviewStatus = null;
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                reviewStatus = Review.ReviewStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status or handle as null
            }
        }

        java.time.LocalDateTime startDateTime = dateFrom != null ? dateFrom.atStartOfDay() : null;
        java.time.LocalDateTime endDateTime = dateTo != null ? dateTo.atTime(23, 59, 59) : null;

        org.springframework.data.jpa.domain.Specification<Review> spec = com.ecommerce.platform.repository.specification.ReviewSpecification
                .filterReviews(
                        reviewStatus,
                        rating,
                        isReplied,
                        startDateTime,
                        endDateTime,
                        productId,
                        categoryId,
                        isReported,
                        search);

        return reviewRepository.findAll(spec, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public ReviewResponse updateReviewStatus(Long reviewId, UpdateReviewStatusRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        review.setStatus(Review.ReviewStatus.valueOf(request.getStatus().toUpperCase()));
        review = reviewRepository.save(review);
        return mapToResponse(review);
    }

    @Override
    public void adminDeleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
        reviewRepository.delete(review);
    }

    @Override
    public ReviewResponse replyToReview(Long reviewId, com.ecommerce.platform.dto.request.ReplyReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        review.setReply(request.getReply());
        review.setRepliedAt(java.time.LocalDateTime.now());
        review = reviewRepository.save(review);

        return mapToResponse(review);
    }

    @Override
    public void reportReview(Long reviewId, com.ecommerce.platform.dto.request.ReportReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        review.setIsReported(true);
        review.setReportReason(request.getReportReason());
        reviewRepository.save(review);
    }

    @Override
    public void dismissReport(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        review.setIsReported(false);
        review.setReportReason(null);
        reviewRepository.save(review);
    }

    @Override
    @Transactional(readOnly = true)
    public com.ecommerce.platform.dto.response.ReviewEligibilityResponse checkReviewEligibility(Long customerId,
            Long productId) {
        // Find all delivered orders for this customer
        java.util.List<Order> orders = orderRepository.findByCustomerIdAndStatus(customerId,
                Order.OrderStatus.DELIVERED);

        // Find an order that contains the product and hasn't been reviewed yet
        for (Order order : orders) {
            boolean hasProduct = order.getItems().stream()
                    .anyMatch(item -> item.getProduct().getId().equals(productId));

            if (hasProduct) {
                boolean alreadyReviewed = reviewRepository
                        .findByCustomerIdAndProductIdAndOrderId(customerId, productId, order.getId())
                        .isPresent();

                if (!alreadyReviewed) {
                    return com.ecommerce.platform.dto.response.ReviewEligibilityResponse.builder()
                            .canReview(true)
                            .orderId(order.getId())
                            .message("You can review this product")
                            .build();
                }
            }
        }

        return com.ecommerce.platform.dto.response.ReviewEligibilityResponse.builder()
                .canReview(false)
                .message("You need to purchase this product to review it, or you have already reviewed it.")
                .build();
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .productThumbnail(review.getProduct().getThumbnail())
                .orderId(review.getOrder() != null ? review.getOrder().getId() : null)
                .orderCode(review.getOrder() != null ? review.getOrder().getOrderCode() : null)
                .customer(ReviewResponse.CustomerInfo.builder()
                        .id(review.getCustomer().getId())
                        .fullName(review.getCustomer().getFullName())
                        .avatar(review.getCustomer().getAvatar())
                        .build())
                .rating(review.getRating())
                .comment(review.getComment())
                .images(review.getImages())
                .status(review.getStatus().name())
                .createdAt(review.getCreatedAt())
                .reply(review.getReply())
                .repliedAt(review.getRepliedAt())
                .isReported(review.getIsReported())
                .reportReason(review.getReportReason())
                .build();
    }
}
