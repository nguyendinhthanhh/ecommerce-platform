package com.ecommerce.platform.mapper;

import com.ecommerce.platform.dto.response.CartResponse;
import com.ecommerce.platform.dto.response.CartResponse.CartItemResponse;
import com.ecommerce.platform.entity.Cart;
import com.ecommerce.platform.entity.CartItem;
import org.mapstruct.*;
import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "totalItems", ignore = true)
    CartResponse toResponse(Cart cart);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productThumbnail", source = "product.thumbnail")
    @Mapping(target = "stockQuantity", source = "product.stockQuantity")
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(item))")
    CartItemResponse toCartItemResponse(CartItem item);

    List<CartItemResponse> toCartItemResponseList(List<CartItem> items);

    default BigDecimal calculateSubtotal(CartItem item) {
        if (item.getUnitPrice() == null || item.getQuantity() == null) {
            return BigDecimal.ZERO;
        }
        return item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }
}
