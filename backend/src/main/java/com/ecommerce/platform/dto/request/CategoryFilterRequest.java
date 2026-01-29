package com.ecommerce.platform.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryFilterRequest {

    private String keyword; // search by name or description

    private Boolean isActive;

    private Long parentId;

    private Boolean rootOnly; // only get root categories (no parent)
}

