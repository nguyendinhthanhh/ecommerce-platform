package com.ecommerce.platform.mapper;

import com.ecommerce.platform.dto.response.OrderResponse;
import com.ecommerce.platform.dto.response.OrderResponse.OrderItemResponse;
import com.ecommerce.platform.dto.response.OrderResponse.PaymentInfo;
import com.ecommerce.platform.entity.Order;
import com.ecommerce.platform.entity.OrderItem;
import com.ecommerce.platform.entity.Payment;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "status", expression = "java(order.getStatus().name())")
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "payment", ignore = true)
    OrderResponse toResponse(Order order);

    @Mapping(target = "productId", source = "product.id")
    OrderItemResponse toOrderItemResponse(OrderItem item);

    List<OrderItemResponse> toOrderItemResponseList(List<OrderItem> items);

    @Mapping(target = "method", expression = "java(payment.getMethod().name())")
    @Mapping(target = "status", expression = "java(payment.getStatus().name())")
    PaymentInfo toPaymentInfo(Payment payment);
}
