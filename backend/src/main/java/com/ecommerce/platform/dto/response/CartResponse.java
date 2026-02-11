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

}
