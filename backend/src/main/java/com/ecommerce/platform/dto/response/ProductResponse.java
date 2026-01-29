package com.ecommerce.platform.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer stockQuantity;
    private String thumbnail;
    private List<String> images;
    private Long categoryId;
    private String categoryName;
    private String status;
    private Double averageRating;
    private Integer totalReviews;
    private Integer soldCount;
}
