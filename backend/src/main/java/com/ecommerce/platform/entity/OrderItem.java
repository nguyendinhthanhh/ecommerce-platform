package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    private String productName;
    private String productThumbnail;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal unitPrice;
    
    @Column(precision = 12, scale = 2)
    private BigDecimal totalPrice;
    
    @PrePersist
    protected void onCreate() {
        if (totalPrice == null && unitPrice != null && quantity != null) {
            totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
}
