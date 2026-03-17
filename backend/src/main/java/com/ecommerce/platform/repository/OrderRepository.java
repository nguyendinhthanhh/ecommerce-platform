package com.ecommerce.platform.repository;

import com.ecommerce.platform.dto.request.OrderStatusReport;
import com.ecommerce.platform.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    List<Order> findByCustomerIdAndStatus(Long customerId, Order.OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") Order.OrderStatus status);

    // User statistics queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer.id = :customerId")
    Long countByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.customer.id = :customerId AND o.status = 'DELIVERED'")
    Long sumTotalAmountByCustomerId(@Param("customerId") Long customerId);

    @Query("""
                SELECT new com.ecommerce.platform.dto.request.OrderStatusReport(
                    o.status,
                    COUNT(o)
                )
                FROM Order o
                WHERE o.createdAt BETWEEN :from AND :to
                  AND o.status IN :statuses
                GROUP BY o.status
            """)
    List<OrderStatusReport> countOrdersByStatusIn(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("statuses") List<Order.OrderStatus> statuses
    );

    long count();

    long countByCreatedAtBetween(
            LocalDateTime from,
            LocalDateTime to
    );

    @Query("""
                SELECT o FROM Order o
                WHERE YEAR(o.createdAt) = :year
                  AND MONTH(o.createdAt) = :month
                ORDER BY o.createdAt DESC
            """)
    List<Order> findOrdersByMonth(
            @Param("year") int year,
            @Param("month") int month
    );

    @Query("""
                SELECT o FROM Order o
                WHERE YEAR(o.createdAt) = :year
                ORDER BY o.createdAt DESC
            """)
    List<Order> findOrdersByYear(
            @Param("year") int year
    );


    @Query("SELECT o FROM Order o WHERE YEAR(o.createdAt) = :year " +
            "AND (:month IS NULL OR MONTH(o.createdAt) = :month) " +
            "AND (:status IS NULL OR o.status = :status)")
    List<Order> findOrdersForExport(
            @Param("year") int year,
            @Param("month") Integer month,
            @Param("status") Order.OrderStatus status
    );

    @Query("SELECT SUM(o.totalAmount) FROM Order o " +
            "WHERE (:year IS NULL OR YEAR(o.createdAt) = :year) " +
            "AND (:month IS NULL OR MONTH(o.createdAt) = :month) " +
            "AND o.payment.status = com.ecommerce.platform.entity.Payment.PaymentStatus.COMPLETED")
    BigDecimal calculateTotalRevenue(Integer year, Integer month);

    @Query("SELECT p.status, COUNT(p) FROM Payment p " +
            "WHERE (:year IS NULL OR YEAR(p.createdAt) = :year) " +
            "AND (:month IS NULL OR MONTH(p.createdAt) = :month) " +
            "GROUP BY p.status")
    List<Object[]> countPaymentStatusByDate(Integer year, Integer month);

    @Query("SELECT MONTH(o.createdAt), SUM(o.totalAmount) FROM Order o " +
            "WHERE YEAR(o.createdAt) = :year " +
            "AND o.payment.status = com.ecommerce.platform.entity.Payment.PaymentStatus.COMPLETED " +
            "GROUP BY MONTH(o.createdAt) " +
            "ORDER BY MONTH(o.createdAt)")
    List<Object[]> getMonthlyRevenueByYear(@Param("year") int year);

    @Query("SELECT MONTH(o.createdAt), SUM(o.totalAmount) FROM Order o " +
            "WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate " +
            "AND o.payment.status = com.ecommerce.platform.entity.Payment.PaymentStatus.COMPLETED " +
            "GROUP BY MONTH(o.createdAt) ORDER BY MONTH(o.createdAt)")
    List<Object[]> getMonthlyRevenueByRange(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o " +
            "WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate " +
            "AND o.payment.status = com.ecommerce.platform.entity.Payment.PaymentStatus.COMPLETED")
    BigDecimal calculateRevenueByRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT p.status, COUNT(p) 
        FROM Order o JOIN o.payment p 
        WHERE o.createdAt BETWEEN :startDate AND :endDate 
        GROUP BY p.status
    """)
    List<Object[]> countPaymentStatusRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Thêm query tính tổng doanh thu theo khoảng thời gian
    @Query("""
        SELECT SUM(o.totalAmount) 
        FROM Order o 
        WHERE o.createdAt BETWEEN :startDate AND :endDate 
          AND o.payment.status = com.ecommerce.platform.entity.Payment.PaymentStatus.COMPLETED
    """)
    BigDecimal calculateTotalRevenueRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

}
