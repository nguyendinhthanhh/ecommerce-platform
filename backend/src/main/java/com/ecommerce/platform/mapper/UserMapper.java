package com.ecommerce.platform.mapper;

import com.ecommerce.platform.dto.request.AdminUpdateUserRequest;
import com.ecommerce.platform.dto.request.CreateUserRequest;
import com.ecommerce.platform.dto.request.RegisterRequest;
import com.ecommerce.platform.dto.request.UpdateProfileRequest;
import com.ecommerce.platform.dto.response.BulkActionResponse;
import com.ecommerce.platform.dto.response.UserDetailResponse;
import com.ecommerce.platform.dto.response.UserResponse;
import com.ecommerce.platform.dto.response.UserStatisticsResponse;
import com.ecommerce.platform.entity.User;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "avatar", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "lastLoginIp", ignore = true)
    User toEntity(RegisterRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "lastLoginIp", ignore = true)
    User toEntity(CreateUserRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "lastLoginIp", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromProfileRequest(UpdateProfileRequest request, @MappingTarget User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "lastLoginIp", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "status", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromAdminRequest(AdminUpdateUserRequest request, @MappingTarget User user);

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(target = "status", expression = "java(user.getStatus().name())")
    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(target = "status", expression = "java(user.getStatus().name())")
    @Mapping(target = "totalOrders", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    @Mapping(target = "totalSpent", ignore = true)
    @Mapping(target = "createdByName", ignore = true)
    @Mapping(target = "updatedByName", ignore = true)
    @Mapping(target = "accountAgeDays", ignore = true)
    @Mapping(target = "isOnline", ignore = true)
    @Mapping(target = "lastActivityStatus", ignore = true)
    UserDetailResponse toDetailResponse(User user);

    default UserStatisticsResponse toStatisticsResponse(
            long totalUsers, long activeUsers, long inactiveUsers, long bannedUsers,
            long totalCustomers, long totalSellers, long totalAdmins,
            long newUsersToday, long newUsersThisWeek, long newUsersThisMonth,
            long usersLoggedInToday) {
        return UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .bannedUsers(bannedUsers)
                .totalCustomers(totalCustomers)
                .totalSellers(totalSellers)
                .totalAdmins(totalAdmins)
                .newUsersToday(newUsersToday)
                .newUsersThisWeek(newUsersThisWeek)
                .newUsersThisMonth(newUsersThisMonth)
                .usersLoggedInToday(usersLoggedInToday)
                .build();
    }

    default BulkActionResponse toBulkActionResponse(
            int totalRequested, int successCount, int failedCount,
            List<Long> failedIds, String action) {
        return BulkActionResponse.builder()
                .totalRequested(totalRequested)
                .successCount(successCount)
                .failedCount(failedCount)
                .failedIds(failedIds)
                .message(String.format("Successfully %s %d users", action.toLowerCase(), successCount))
                .build();
    }
}
