package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrderRequest {
    
    @NotEmpty(message = "Cart item IDs are required")
    private List<Long> cartItemIds;
    
    @NotBlank(message = "Shipping name is required")
    private String shippingName;
    
    @NotBlank(message = "Shipping phone is required")
    private String shippingPhone;
    
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
    
    private String note;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // COD, VNPAY, MOMO
}
