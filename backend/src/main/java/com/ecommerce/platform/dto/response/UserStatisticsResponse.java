package com.ecommerce.platform.dto.response;

import lombok.*;

/**
 * Response DTO for user statistics (Admin dashboard)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatisticsResponse {

    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long bannedUsers;

    private long totalCustomers;
    private long totalSellers;
    private long totalAdmins;

    private long newUsersToday;
    private long newUsersThisWeek;
    private long newUsersThisMonth;

    private long usersLoggedInToday;
}

