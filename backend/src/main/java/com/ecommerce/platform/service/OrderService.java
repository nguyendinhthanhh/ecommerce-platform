package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.PlaceOrderRequest;
import com.ecommerce.platform.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.platform.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OrderService {
    
    // Customer - Place Order
    List<OrderResponse> placeOrder(Long customerId, PlaceOrderRequest request);
    
    // Customer - Track Order
    OrderResponse getOrderById(Long orderId, Long userId);
    
    Page<OrderResponse> getCustomerOrders(Long customerId, Pageable pageable);
    
    OrderResponse cancelOrder(Long orderId, Long customerId);
    
    // Seller - Manage Orders
    Page<OrderResponse> getShopOrders(Long shopId, String status, Pageable pageable);
    
    OrderResponse updateOrderStatus(Long orderId, Long sellerId, UpdateOrderStatusRequest request);
}
