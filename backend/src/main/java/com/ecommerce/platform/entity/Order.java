package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String orderCode;
    
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
    
    @Column(precision = 12, scale = 2)
    private BigDecimal subtotal;
    
    @Column(precision = 12, scale = 2)
    private BigDecimal shippingFee;
    
    @Column(precision = 12, scale = 2)
    private BigDecimal totalAmount;
    
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    
    private String note;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment;
    
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = OrderStatus.PLACED;
        if (orderCode == null) {
            orderCode = "ORD" + System.currentTimeMillis();
        }
    }
    
    public enum OrderStatus {
        PLACED,
        CONFIRMED,
        SHIPPED,
        DELIVERED,
        CANCELLED,
        RETURNED
    }
}
