package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "categories")
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
    
    private String description;
    
    private String image;
    
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parent;
    
    @OneToMany(mappedBy = "parent")
    private List<Category> children;
    
    @OneToMany(mappedBy = "category")
    private List<Product> products;
    
    private Boolean isActive;
    
    @PrePersist
    protected void onCreate() {
        if (isActive == null) isActive = true;
    }
}
