package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateReviewStatusRequest {

    @NotNull(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|HIDDEN|PENDING)$", message = "Status must be ACTIVE, HIDDEN or PENDING")
    private String status;
}

