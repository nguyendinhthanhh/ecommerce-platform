package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderCode(String orderCode);
    
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);
    
    Page<Order> findByShopId(Long shopId, Pageable pageable);
    
    Page<Order> findByShopIdAndStatus(Long shopId, Order.OrderStatus status, Pageable pageable);
    
    List<Order> findByCustomerIdAndStatus(Long customerId, Order.OrderStatus status);
    
    @Query("SELECT o FROM Order o WHERE o.shop.id = :shopId AND o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByShopIdAndDateRange(@Param("shopId") Long shopId, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.shop.id = :shopId AND o.status = :status")
    Long countByShopIdAndStatus(@Param("shopId") Long shopId, @Param("status") Order.OrderStatus status);
}
