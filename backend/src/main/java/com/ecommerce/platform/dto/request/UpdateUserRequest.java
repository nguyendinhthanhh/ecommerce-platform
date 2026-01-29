package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;

    private String address;

    private String avatar;

    private String role; // CUSTOMER, STAFF, ADMIN

    private String status; // ACTIVE, INACTIVE, BANNED
}
