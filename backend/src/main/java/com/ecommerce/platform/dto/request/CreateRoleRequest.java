package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoleRequest {
    @NotBlank(message = "Role name is required")
    private String name;

    private String description;

}
