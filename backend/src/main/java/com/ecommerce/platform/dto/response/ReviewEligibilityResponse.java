package com.ecommerce.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewEligibilityResponse {
    private boolean canReview;
    private Long orderId;
    private String message;
}
