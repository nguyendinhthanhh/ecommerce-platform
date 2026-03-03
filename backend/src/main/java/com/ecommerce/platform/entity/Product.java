package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;
    
    private BigDecimal discountPrice;
    
    @Column(nullable = false)
    private Integer stockQuantity;
    
    private String thumbnail;
    
    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images;
    
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<Review> reviews;
    
    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    private Double averageRating;
    
    private Integer totalReviews;
    
    private Integer soldCount;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ProductStatus.PENDING;
        if (averageRating == null) averageRating = 0.0;
        if (totalReviews == null) totalReviews = 0;
        if (soldCount == null) soldCount = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ProductStatus {
        ACTIVE, INACTIVE, PENDING, REJECTED
    }

    public String toEmbeddingText() {
        return String.format("""
        Sản phẩm %s thuộc danh mục %s.
        Mô tả: %s.
        Giá hiện tại %s VNĐ%s.
        Sản phẩm đã bán %d lần, đánh giá trung bình %.1f sao từ %d lượt đánh giá.
        Tồn kho còn %d sản phẩm. Trạng thái: %s.
        """,
                name,
                category != null ? category.getName() : "không rõ danh mục",
                description != null ? description : "không có mô tả",
                price,
                discountPrice != null ? ", đang giảm còn " + discountPrice + " VNĐ" : "",
                soldCount,
                averageRating,
                totalReviews,
                stockQuantity,
                status
        );
    }
}
