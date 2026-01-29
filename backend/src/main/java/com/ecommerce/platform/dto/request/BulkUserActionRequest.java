package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

/**
 * Request DTO for bulk operations on users
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkUserActionRequest {

    @NotEmpty(message = "User IDs are required")
    private List<Long> userIds;

    @NotBlank(message = "Action is required")
    @Pattern(regexp = "^(ACTIVATE|DEACTIVATE|BAN|DELETE)$",
             message = "Action must be ACTIVATE, DEACTIVATE, BAN or DELETE")
    private String action;
}

