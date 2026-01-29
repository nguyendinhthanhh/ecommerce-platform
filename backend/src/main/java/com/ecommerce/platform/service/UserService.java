package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.*;
import com.ecommerce.platform.dto.response.BulkActionResponse;
import com.ecommerce.platform.dto.response.UserDetailResponse;
import com.ecommerce.platform.dto.response.UserResponse;
import com.ecommerce.platform.dto.response.UserStatisticsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserResponse createUser(CreateUserRequest request, Long adminId);

    UserResponse getUserById(Long id);

    UserDetailResponse getUserDetailById(Long id);

    UserResponse getUserByEmail(String email);

    Page<UserResponse> getAllUsers(Pageable pageable);

    Page<UserResponse> getUsersByRole(String role, Pageable pageable);

    Page<UserResponse> getUsersByStatus(String status, Pageable pageable);

    Page<UserResponse> searchUsers(String keyword, Pageable pageable);

    Page<UserResponse> filterUsers(UserFilterRequest filter, Pageable pageable);

    UserResponse adminUpdateUser(Long id, AdminUpdateUserRequest request, Long adminId);

    UserResponse updateUserStatus(Long id, String status, Long adminId);

    void deleteUser(Long id, Long adminId);

    BulkActionResponse bulkAction(BulkUserActionRequest request, Long adminId);

    UserStatisticsResponse getUserStatistics();

    UserDetailResponse getMyProfile(Long userId);

    UserDetailResponse updateMyProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    boolean existsByEmail(String email);

    void updateLastLogin(Long userId, String ipAddress);
}
