package com.ecommerce.platform.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Detailed user response - used for viewing profile, user detail
 * Contains more information than basic UserResponse
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDetailResponse {

    // Basic info
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String avatar;

    // Role & Status
    private String role;
    private String status;

    // Statistics (for customers)
    private Long totalOrders;
    private Long totalReviews;
    private Long totalSpent;

    // Audit info
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;

    // Created/Updated by (for admin view)
    private Long createdBy;
    private String createdByName;
    private Long updatedBy;
    private String updatedByName;

    // Account age
    private Long accountAgeDays;

    // Activity status
    private Boolean isOnline;
    private String lastActivityStatus; // "Active now", "Last seen 5 minutes ago", etc.
}

