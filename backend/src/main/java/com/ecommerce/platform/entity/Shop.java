package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

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
    private ShopStatus status; // ACTIVE, INACTIVE, PENDING
    
    @OneToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;
    
    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL)
    private List<Product> products;
    
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
