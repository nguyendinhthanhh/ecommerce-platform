package com.ecommerce.platform.dto.request;

import com.ecommerce.platform.entity.Order;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderStatusReport {
    private Order.OrderStatus status;
    private Long total;
}
