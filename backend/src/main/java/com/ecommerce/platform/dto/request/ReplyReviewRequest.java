package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyReviewRequest {
    @NotBlank(message = "Reply content cannot be empty")
    private String reply;
}
