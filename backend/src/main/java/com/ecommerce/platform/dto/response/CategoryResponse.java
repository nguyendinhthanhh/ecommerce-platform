package com.ecommerce.platform.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;

    private String name;
    
    private String slug;

    private String description;

    private String image;
    
    private String bannerUrl;

    private Long parentId;

    private String parentName;

    private Boolean isActive;
    
    private Boolean isMenu;
    
    private Boolean isFilterable;
    
    private Integer level;
    
    private Integer position;
    
    private String metaTitle;
    
    private String metaDescription;

    private List<CategoryResponse> children;

    private Integer productCount;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
