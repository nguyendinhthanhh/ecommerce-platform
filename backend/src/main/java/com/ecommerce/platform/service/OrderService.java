package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.PlaceOrderRequest;
import com.ecommerce.platform.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.platform.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OrderService {
    
    List<OrderResponse> placeOrder(Long customerId, PlaceOrderRequest request);
    
    OrderResponse getOrderById(Long orderId, Long userId);
    
    Page<OrderResponse> getCustomerOrders(Long customerId, Pageable pageable);
    
    OrderResponse cancelOrder(Long orderId, Long customerId);
    
    Page<OrderResponse> getAllOrders(String status, Pageable pageable);
    
    OrderResponse updateOrderStatus(Long orderId, Long staffId, UpdateOrderStatusRequest request);
}
