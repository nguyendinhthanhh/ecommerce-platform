package com.ecommerce.platform.dto.response;

import lombok.*;
import java.util.List;

/**
 * Response DTO for bulk operations result
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkActionResponse {

    private int totalRequested;
    private int successCount;
    private int failedCount;
    private List<Long> failedIds;
    private String message;
}

