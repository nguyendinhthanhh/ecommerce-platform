package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories", indexes = {
        @Index(name = "idx_category_parent", columnList = "parent_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String slug; // SEO-friendly URL

    private String description;

    private String image;

    @Column(name = "banner_url")
    private String bannerUrl; // Category banner for landing pages

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent")
    private List<Category> children;

    @OneToMany(mappedBy = "category")
    private List<Product> products;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "is_menu")
    private Boolean isMenu; // Show in navigation menu

    @Column(name = "is_filterable")
    private Boolean isFilterable; // Use as product filter

    @Column(name = "level")
    private Integer level; // Depth in hierarchy (0 = root, 1 = child, etc.)

    @Column(name = "position")
    private Integer position; // Display order within same level

    @Column(name = "meta_title")
    private String metaTitle; // SEO meta title

    @Column(name = "meta_description", length = 500)
    private String metaDescription; // SEO meta description

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (isActive == null)
            isActive = true;
        if (isMenu == null)
            isMenu = true;
        if (isFilterable == null)
            isFilterable = false;
        if (level == null)
            level = 0;
        if (position == null)
            position = 0;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        // Auto-generate slug if not provided
        if (slug == null && name != null) {
            slug = generateSlug(name);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
