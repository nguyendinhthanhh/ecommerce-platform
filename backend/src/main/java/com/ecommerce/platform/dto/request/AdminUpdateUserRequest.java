package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request DTO for admin updating user
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUpdateUserRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Pattern(
            regexp = "^$|^(03|05|07|08|09)\\d{8}$",
            message = "Invalid Vietnamese phone number"
    )
    private String phone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 255, message = "Avatar URL must not exceed 255 characters")
    private String avatar;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(CUSTOMER|STAFF|ADMIN)$", message = "Role must be CUSTOMER, STAFF or ADMIN")
    private String role;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|INACTIVE|BANNED)$", message = "Status must be ACTIVE, INACTIVE or BANNED")
    private String status;
}
