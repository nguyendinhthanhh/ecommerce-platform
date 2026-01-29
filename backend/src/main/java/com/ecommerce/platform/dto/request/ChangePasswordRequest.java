package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request DTO for changing password
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
             message = "Password must contain at least one uppercase, one lowercase and one digit")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}

