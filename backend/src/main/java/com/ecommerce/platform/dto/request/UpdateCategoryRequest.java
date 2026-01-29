package com.ecommerce.platform.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCategoryRequest {

    private String name;

    private String description;

    private String image;

    private Long parentId;

    private Boolean isActive;
}

