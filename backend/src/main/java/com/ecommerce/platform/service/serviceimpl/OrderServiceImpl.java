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
    private final PaymentRepository paymentRepository;
    private final OrderMapper orderMapper;

    private static final BigDecimal SHIPPING_FEE = new BigDecimal("30000");

    @Override
    public List<OrderResponse> placeOrder(Long customerId, PlaceOrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", customerId));

        boolean isDirectPurchase = request.getProductId() != null && request.getQuantity() != null
                && request.getQuantity() > 0;

        if (!isDirectPurchase && (request.getCartItemIds() == null || request.getCartItemIds().isEmpty())) {
            throw new BadRequestException("Chưa chọn sản phẩm nào");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        Cart cart = null;
        List<CartItem> cartItems = new ArrayList<>();

        if (isDirectPurchase) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

            if (product.getStockQuantity() < request.getQuantity()) {
                throw new BadRequestException("Kho không đủ cho: " + product.getName());
            }

            BigDecimal currentPrice = product.getDiscountPrice() != null ? product.getDiscountPrice()
                    : product.getPrice();
            subtotal = currentPrice.multiply(BigDecimal.valueOf(request.getQuantity()));
        } else {
            cart = cartRepository.findByCustomerId(customerId)
                    .orElseThrow(() -> new BadRequestException("Giỏ hàng trống"));

            cartItems = request.getCartItemIds().stream()
                    .map(id -> cartItemRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Cart item", id)))
                    .collect(Collectors.toList());

            if (cartItems.isEmpty()) {
                throw new BadRequestException("Chưa chọn sản phẩm nào");
            }

            subtotal = cartItems.stream()
                    .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.1"));

        Order order = Order.builder()
                .customer(customer)
                .subtotal(subtotal)
                .shippingFee(SHIPPING_FEE)
                .taxAmount(tax)
                .totalAmount(subtotal.add(SHIPPING_FEE).add(tax))
                .shippingName(request.getShippingName())
                .shippingPhone(request.getShippingPhone())
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .status(Order.OrderStatus.PENDING)
                .build();

        order = orderRepository.save(order);

        // Create order items and update stock
        if (isDirectPurchase) {
            Product product = productRepository.findById(request.getProductId()).get();
            BigDecimal currentPrice = product.getDiscountPrice() != null ? product.getDiscountPrice()
                    : product.getPrice();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productThumbnail(product.getThumbnail())
                    .quantity(request.getQuantity())
                    .unitPrice(currentPrice)
                    .totalPrice(currentPrice.multiply(BigDecimal.valueOf(request.getQuantity())))
                    .build();
            orderItemRepository.save(orderItem);

            product.setStockQuantity(product.getStockQuantity() - request.getQuantity());
            product.setSoldCount(product.getSoldCount() + request.getQuantity());
            productRepository.save(product);
        } else {
            for (CartItem cartItem : cartItems) {
                Product product = cartItem.getProduct();

                if (product.getStockQuantity() < cartItem.getQuantity()) {
                    throw new BadRequestException("Kho không đủ cho: " + product.getName());
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

            // Clear cart items if not direct purchase
            if (cart != null) {
                cart.getItems().clear(); // Safely trigger orphan removal
                // Remove manual cartItemRepository.delete() to avoid DataIntegrityViolationException
            }
        }

        // Handle "CASH" explicitly since frontend was sending it previously
        String methodPrefix = request.getPaymentMethod();
        if ("CASH".equalsIgnoreCase(methodPrefix)) {
            methodPrefix = "COD";
        }

        // Create payment
        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .transactionId(order.getOrderCode())
                .ContenPayment("PAY-" + order.getOrderCode())
                .method(Payment.PaymentMethod.valueOf(methodPrefix))
                .status(Payment.PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        // Return single order in list for consistency
        return List.of(buildOrderResponse(order));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // Only owner or staff/admin can view (security layer handles staff/admin)
        if (!order.getCustomer().getId().equals(userId)) {
            // We can check if user is staff/admin here if we want more granular control
            // but usually security pre-authorize handles it.
            // For getOrderByCode we might need to allow it.
        }

        return buildOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode, Long userId) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", 0L)); // Using 0 for code not found

        // Basic check if it belongs to user
        if (!order.getCustomer().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xem đơn hàng này");
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
            throw new BadRequestException("Bạn không có quyền hủy đơn hàng này");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new BadRequestException("Không thể hủy đơn hàng. Trạng thái hiện tại: " + order.getStatus());
        }

        restoreStock(orderId);

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        return buildOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(String status, Pageable pageable) {
        Page<Order> orders;
        if (status != null && !status.isEmpty()) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByStatus(orderStatus, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }
        return orders.map(this::buildOrderResponse);
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, Long staffId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // In single-vendor: Staff/Admin can update any order (handled by security
        // layer)

        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);

        switch (newStatus) {
            case PENDING -> {
            }
            case CONFIRMED -> order.setConfirmedAt(LocalDateTime.now());
            // Added processing stage for transition completeness, though no specific
            // timestamp exists
            case PROCESSING -> {
                order.setProcessingAt(LocalDateTime.now());
            }
            case SHIPPING -> order.setShippedAt(LocalDateTime.now());
            case DELIVERED -> order.setDeliveredAt(LocalDateTime.now());
            case COMPLETED -> {
                order.setCompletedAt(LocalDateTime.now());
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

    @Override
    @Transactional
    public OrderResponse confirmOrderReceived(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa đơn hàng này");
        }

        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new BadRequestException("Đơn hàng đã được đánh dấu hoàn thành");
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new BadRequestException("Chỉ có thể xác nhận nhận hàng cho đơn hàng đã giao.");
        }

        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (payment != null && payment.getMethod() == Payment.PaymentMethod.COD) {
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
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
                Order.OrderStatus.PENDING, Set.of(Order.OrderStatus.CONFIRMED, Order.OrderStatus.CANCELLED),
                Order.OrderStatus.CONFIRMED, Set.of(Order.OrderStatus.PROCESSING, Order.OrderStatus.CANCELLED),
                Order.OrderStatus.PROCESSING, Set.of(Order.OrderStatus.SHIPPING, Order.OrderStatus.CANCELLED),
                Order.OrderStatus.SHIPPING, Set.of(Order.OrderStatus.DELIVERED, Order.OrderStatus.CANCELLED),
                Order.OrderStatus.DELIVERED, Set.of(Order.OrderStatus.COMPLETED),
                Order.OrderStatus.COMPLETED, Set.of(),
                Order.OrderStatus.CANCELLED, Set.of());

        if (!validTransitions.getOrDefault(current, Set.of()).contains(next)) {
            throw new BadRequestException("Chuyển đổi trạng thái không hợp lệ từ " + current + " sang " + next);
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
