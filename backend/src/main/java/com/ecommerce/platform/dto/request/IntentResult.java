package com.ecommerce.platform.dto.request;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class IntentResult {

    private IntentType intent;
    private String rawQuery;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String keyword;
    private Integer quantity;
    private Double rating;

    public enum IntentType {
        PRODUCT_SEARCH,
        STOCK_CHECK,
        BULK_ORDER,
        PRICE_COMPARE,
        REVIEW_QUERY,
        DISCOUNT_POLICY,
        GENERAL_CHAT
    }
}