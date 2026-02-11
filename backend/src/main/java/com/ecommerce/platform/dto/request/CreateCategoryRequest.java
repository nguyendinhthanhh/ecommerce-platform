package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;

    private String image;

    private Long parentId;

    private Boolean isActive;

    // Enterprise-level fields
    private String slug;

    private String bannerUrl;

    private Boolean isMenu;

    private Boolean isFilterable;

    private Integer position;

    private String metaTitle;

    private String metaDescription;
}

