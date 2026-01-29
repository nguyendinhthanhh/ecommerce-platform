package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Shop entity - DEPRECATED for Single-Vendor System
 * Kept for backward compatibility with existing database
 * In single-vendor system, there is only one implicit shop (the company itself)
 */
@Entity
@Table(name = "shops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String logo;
    
    private String address;
    
    private String phone;
    
    @Enumerated(EnumType.STRING)
    private ShopStatus status;

    @OneToOne
    @JoinColumn(name = "seller_id")
    private User seller;
    
    // Removed: @OneToMany(mappedBy = "shop") - Products no longer belong to shops
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ShopStatus.PENDING;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ShopStatus {
        ACTIVE, INACTIVE, PENDING
    }
}
