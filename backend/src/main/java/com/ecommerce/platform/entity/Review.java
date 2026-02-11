package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @ElementCollection
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    private List<String> images;

    @Column(columnDefinition = "TEXT")
    private String reply;

    private LocalDateTime repliedAt;

    @Enumerated(EnumType.STRING)
    private ReviewStatus status;

    private LocalDateTime createdAt;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private Boolean isReported = false;

    @Column(columnDefinition = "TEXT")
    private String reportReason;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null)
            status = ReviewStatus.ACTIVE;
        if (isReported == null)
            isReported = false;
    }

    public enum ReviewStatus {
        ACTIVE, HIDDEN, PENDING
    }
}
