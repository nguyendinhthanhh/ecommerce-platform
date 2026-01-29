package com.ecommerce.platform.dto.request;

import lombok.*;

/**
 * Request DTO for filtering users with dynamic criteria
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFilterRequest {

    private String keyword;        // Search in email, fullName, phone
    private String role;           // CUSTOMER, STAFF, ADMIN
    private String status;         // ACTIVE, INACTIVE, BANNED
    private String dateFrom;       // Created from date (yyyy-MM-dd)
    private String dateTo;         // Created to date (yyyy-MM-dd)
    private Boolean hasOrders;     // Filter users who have placed orders
    private Boolean includeDeleted; // Filter users by deleted status
    private String sortBy;         // Field to sort by
    private String sortDir;        // asc or desc
}
