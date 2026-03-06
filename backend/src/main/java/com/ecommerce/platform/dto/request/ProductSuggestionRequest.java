package com.ecommerce.platform.dto.request;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductSuggestionRequest {
    private Long id;
    private String name;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Double rating;
    private Integer totalReviews;
    private Integer stockQuantity;
    private String imageUrl;
    private String detailUrl;
}
