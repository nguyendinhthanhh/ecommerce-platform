package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Pattern(regexp = "^$|^(\\+84|0)[0-9]{9,10}$", message = "Invalid phone number format")
    private String phone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 255, message = "Avatar URL must not exceed 255 characters")
    private String avatar;

    private String role;

    @Pattern(regexp = "^(ACTIVE|INACTIVE|BANNED)$", message = "Status must be ACTIVE, INACTIVE or BANNED")
    private String status;
}
