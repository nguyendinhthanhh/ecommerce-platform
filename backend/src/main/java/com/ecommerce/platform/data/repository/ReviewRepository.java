package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    Page<Review> findByProductId(Long productId, Pageable pageable);
    
    Page<Review> findByCustomerId(Long customerId, Pageable pageable);
    
    Optional<Review> findByCustomerIdAndProductIdAndOrderId(Long customerId, Long productId, Long orderId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.status = 'ACTIVE'")
    Double calculateAverageRating(@Param("productId") Long productId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.status = 'ACTIVE'")
    Integer countActiveReviewsByProductId(@Param("productId") Long productId);
    
    Page<Review> findByStatus(Review.ReviewStatus status, Pageable pageable);
}
