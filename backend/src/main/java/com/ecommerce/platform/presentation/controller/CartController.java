package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.AddToCartRequest;
import com.ecommerce.platform.dto.response.ApiResponse;
import com.ecommerce.platform.dto.response.CartResponse;
import com.ecommerce.platform.security.UserPrincipal;
import com.ecommerce.platform.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Shopping Cart", description = "APIs for managing shopping cart")
public class CartController {

    private final CartService cartService;

    @Operation(summary = "Get cart", description = "Get current user's shopping cart")
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartResponse cart = cartService.getCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @Operation(summary = "Add to cart", description = "Add product to shopping cart")
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addToCart(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Product added to cart", cart));
    }

    @Operation(summary = "Update cart item", description = "Update quantity of cart item")
    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        CartResponse cart = cartService.updateCartItem(principal.getId(), itemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @Operation(summary = "Remove from cart", description = "Remove item from shopping cart")
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId) {
        CartResponse cart = cartService.removeFromCart(principal.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @Operation(summary = "Clear cart", description = "Remove all items from shopping cart")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
