package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.PlaceOrderRequest;
import com.ecommerce.platform.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.platform.dto.response.ApiResponse;
import com.ecommerce.platform.dto.response.OrderResponse;
import com.ecommerce.platform.dto.response.PageResponse;
import com.ecommerce.platform.security.UserPrincipal;
import com.ecommerce.platform.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "APIs for order management")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Place order", description = "Create new order from cart items (Customer)")
    @PostMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> placeOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PlaceOrderRequest request) {
        List<OrderResponse> orders = orderService.placeOrder(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", orders));
    }

    @Operation(summary = "Get order detail", description = "Get order details by ID")
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderById(orderId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @Operation(summary = "Get my orders", description = "Get paginated list of customer's orders")
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> orders = orderService.getCustomerOrders(principal.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(orders)));
    }

    @Operation(summary = "Cancel order", description = "Cancel order (only PLACED status)")
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId) {
        OrderResponse order = orderService.cancelOrder(orderId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", order));
    }

    @Operation(summary = "Get all orders", description = "Get paginated list of all orders (Staff/Admin only)")
    @GetMapping("/management")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @Parameter(description = "Filter by status") @RequestParam(required = false) String status,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> orders = orderService.getAllOrders(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(orders)));
    }

    @Operation(summary = "Update order status", description = "Update order status: PLACED → CONFIRMED → SHIPPED → DELIVERED (Staff/Admin only)")
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse order = orderService.updateOrderStatus(orderId, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }
}
