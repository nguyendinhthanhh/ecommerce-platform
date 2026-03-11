package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    @NotBlank(message = "Status is required")
    private String status; // CONFIRMED, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED
}
