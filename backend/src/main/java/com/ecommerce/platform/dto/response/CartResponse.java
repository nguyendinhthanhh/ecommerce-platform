package com.ecommerce.platform.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private Long id;
    private Long customerId;
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
    private Integer totalItems;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productThumbnail;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private Integer stockQuantity;
    }
}
