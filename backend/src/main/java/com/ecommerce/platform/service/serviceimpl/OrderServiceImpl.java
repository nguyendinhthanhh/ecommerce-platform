package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.request.PlaceOrderRequest;
import com.ecommerce.platform.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.platform.dto.response.OrderResponse;
import com.ecommerce.platform.entity.*;
import com.ecommerce.platform.exception.*;
import com.ecommerce.platform.mapper.OrderMapper;
import com.ecommerce.platform.repository.*;
import com.ecommerce.platform.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PaymentRepository paymentRepository;
    private final OrderMapper orderMapper;

    private static final BigDecimal SHIPPING_FEE = new BigDecimal("30000");

    @Override
    public List<OrderResponse> placeOrder(Long customerId, PlaceOrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", customerId));

        cartRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        List<CartItem> cartItems = request.getCartItemIds().stream()
                .map(id -> cartItemRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Cart item", id)))
                .collect(Collectors.toList());

        if (cartItems.isEmpty()) {
            throw new BadRequestException("No items selected");
        }

        Map<Long, List<CartItem>> itemsByShop = cartItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getShop().getId()));

        List<Order> orders = new ArrayList<>();

        for (Map.Entry<Long, List<CartItem>> entry : itemsByShop.entrySet()) {
            Long shopId = entry.getKey();
            List<CartItem> shopItems = entry.getValue();

            Shop shop = shopRepository.findById(shopId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shop", shopId));

            BigDecimal subtotal = shopItems.stream()
                    .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Order order = Order.builder()
                    .customer(customer)
                    .shop(shop)
                    .subtotal(subtotal)
                    .shippingFee(SHIPPING_FEE)
                    .totalAmount(subtotal.add(SHIPPING_FEE))
                    .shippingName(request.getShippingName())
                    .shippingPhone(request.getShippingPhone())
                    .shippingAddress(request.getShippingAddress())
                    .note(request.getNote())
                    .status(Order.OrderStatus.PLACED)
                    .build();

            order = orderRepository.save(order);

            for (CartItem cartItem : shopItems) {
                Product product = cartItem.getProduct();

                if (product.getStockQuantity() < cartItem.getQuantity()) {
                    throw new BadRequestException("Insufficient stock for: " + product.getName());
                }

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .productName(product.getName())
                        .productThumbnail(product.getThumbnail())
                        .quantity(cartItem.getQuantity())
                        .unitPrice(cartItem.getUnitPrice())
                        .totalPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                        .build();
                orderItemRepository.save(orderItem);

                product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
                product.setSoldCount(product.getSoldCount() + cartItem.getQuantity());
                productRepository.save(product);
            }

            Payment payment = Payment.builder()
                    .order(order)
                    .amount(order.getTotalAmount())
                    .method(Payment.PaymentMethod.valueOf(request.getPaymentMethod()))
                    .status(Payment.PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);

            orders.add(order);
        }

        cartItems.forEach(cartItemRepository::delete);

        return orders.stream().map(this::buildOrderResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        boolean isCustomer = order.getCustomer().getId().equals(userId);
        boolean isSeller = order.getShop().getSeller().getId().equals(userId);

        if (!isCustomer && !isSeller) {
            throw new BadRequestException("You don't have permission to view this order");
        }

        return buildOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getCustomerOrders(Long customerId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByCustomerId(customerId, pageable);
        return orders.map(this::buildOrderResponse);
    }

    @Override
    public OrderResponse cancelOrder(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You don't have permission to cancel this order");
        }

        if (order.getStatus() != Order.OrderStatus.PLACED) {
            throw new BadRequestException("Cannot cancel order. Current status: " + order.getStatus());
        }

        restoreStock(orderId);

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        return buildOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getShopOrders(Long shopId, String status, Pageable pageable) {
        Page<Order> orders;
        if (status != null && !status.isEmpty()) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByShopIdAndStatus(shopId, orderStatus, pageable);
        } else {
            orders = orderRepository.findByShopId(shopId, pageable);
        }
        return orders.map(this::buildOrderResponse);
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, Long sellerId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getShop().getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("You don't have permission to update this order");
        }

        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);

        switch (newStatus) {
            case CONFIRMED -> order.setConfirmedAt(LocalDateTime.now());
            case SHIPPED -> order.setShippedAt(LocalDateTime.now());
            case DELIVERED -> {
                order.setDeliveredAt(LocalDateTime.now());
                Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
                if (payment != null && payment.getMethod() == Payment.PaymentMethod.COD) {
                    payment.setStatus(Payment.PaymentStatus.COMPLETED);
                    payment.setPaidAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                }
            }
            case CANCELLED -> {
                order.setCancelledAt(LocalDateTime.now());
                restoreStock(orderId);
            }
        }

        orderRepository.save(order);
        return buildOrderResponse(order);
    }

    private void restoreStock(Long orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            product.setSoldCount(product.getSoldCount() - item.getQuantity());
            productRepository.save(product);
        }
    }

    private void validateStatusTransition(Order.OrderStatus current, Order.OrderStatus next) {
        Map<Order.OrderStatus, Set<Order.OrderStatus>> validTransitions = Map.of(
                Order.OrderStatus.PLACED, Set.of(Order.OrderStatus.CONFIRMED, Order.OrderStatus.CANCELLED),
                Order.OrderStatus.CONFIRMED, Set.of(Order.OrderStatus.SHIPPED, Order.OrderStatus.CANCELLED),
                Order.OrderStatus.SHIPPED, Set.of(Order.OrderStatus.DELIVERED),
                Order.OrderStatus.DELIVERED, Set.of(),
                Order.OrderStatus.CANCELLED, Set.of()
        );

        if (!validTransitions.getOrDefault(current, Set.of()).contains(next)) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + next);
        }
    }

    private OrderResponse buildOrderResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);

        OrderResponse response = orderMapper.toResponse(order);
        response.setItems(orderMapper.toOrderItemResponseList(items));
        if (payment != null) {
            response.setPayment(orderMapper.toPaymentInfo(payment));
        }

        return response;
    }
}
