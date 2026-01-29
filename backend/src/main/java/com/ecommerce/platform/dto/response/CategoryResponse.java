package com.ecommerce.platform.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;

    private String name;

    private String description;

    private String image;

    private Long parentId;

    private String parentName;

    private Boolean isActive;

    private List<CategoryResponse> children;

    private Integer productCount;
}

