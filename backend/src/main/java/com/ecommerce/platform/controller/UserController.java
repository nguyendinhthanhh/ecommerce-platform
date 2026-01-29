package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.*;
import com.ecommerce.platform.dto.response.*;
import com.ecommerce.platform.security.UserPrincipal;
import com.ecommerce.platform.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Users", description = "APIs for user management (2026 standard)")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Create user", description = "Create a new user (Admin only)")
    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateUserRequest request) {
        UserResponse user = userService.createUser(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", user));
    }

    @Operation(summary = "Get all users", description = "Get paginated list of all users with filters (Admin only)")
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Filter by role (CUSTOMER, STAFF, ADMIN)") @RequestParam(required = false) String role,
            @Parameter(description = "Filter by status (ACTIVE, INACTIVE, BANNED)") @RequestParam(required = false) String status,
            @Parameter(description = "Include deleted/inactive users (default: true for admin)") @RequestParam(defaultValue = "true") Boolean includeDeleted,
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword,
            @Parameter(description = "Created from date (yyyy-MM-dd)") @RequestParam(required = false) String dateFrom,
            @Parameter(description = "Created to date (yyyy-MM-dd)") @RequestParam(required = false) String dateTo) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        UserFilterRequest filter = UserFilterRequest.builder()
                .role(role)
                .status(status)
                .includeDeleted(includeDeleted)
                .keyword(keyword)
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .build();

        Page<UserResponse> users = userService.filterUsers(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(users)));
    }

    @Operation(summary = "Filter users", description = "Advanced filter users with multiple criteria (Admin only)")
    @PostMapping("/admin/users/filter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> filterUsers(
            @RequestBody UserFilterRequest filter,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "createdAt";
        String sortDir = filter.getSortDir() != null ? filter.getSortDir() : "desc";
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<UserResponse> users = userService.filterUsers(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(users)));
    }

    @Operation(summary = "Search users", description = "Search users by keyword (Admin only)")
    @GetMapping("/admin/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> searchUsers(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> users = userService.searchUsers(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(users)));
    }

    @Operation(summary = "Get users by role", description = "Get users filtered by role (Admin only)")
    @GetMapping("/admin/users/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsersByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> users = userService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(users)));
    }

    @Operation(summary = "Get users by status", description = "Get users filtered by status (Admin only)")
    @GetMapping("/admin/users/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsersByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> users = userService.getUsersByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(users)));
    }

    @Operation(summary = "Get user by ID", description = "Get basic user info by ID (Admin only)")
    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @Operation(summary = "Get user detail by ID", description = "Get detailed user info including statistics (Admin only)")
    @GetMapping("/admin/users/{id}/detail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserDetailById(@PathVariable Long id) {
        UserDetailResponse user = userService.getUserDetailById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @Operation(summary = "Get user by email", description = "Get user details by email (Admin only)")
    @GetMapping("/admin/users/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@PathVariable String email) {
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @Operation(summary = "Update user", description = "Update user information (Admin only)")
    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> adminUpdateUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        UserResponse user = userService.adminUpdateUser(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    @Operation(summary = "Update user status", description = "Update user status (Admin only)")
    @PatchMapping("/admin/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam String status) {
        UserResponse user = userService.updateUserStatus(id, status, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("User status updated", user));
    }

    @Operation(summary = "Delete user", description = "Soft delete user (Admin only)")
    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        userService.deleteUser(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @Operation(summary = "Bulk action", description = "Perform bulk action on multiple users (Admin only)")
    @PostMapping("/admin/users/bulk-action")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BulkActionResponse>> bulkAction(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BulkUserActionRequest request) {
        BulkActionResponse result = userService.bulkAction(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    @Operation(summary = "Get user statistics", description = "Get user statistics for dashboard (Admin only)")
    @GetMapping("/admin/users/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getUserStatistics() {
        UserStatisticsResponse stats = userService.getUserStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @Operation(summary = "Get my profile", description = "Get current user's detailed profile including statistics")
    @GetMapping("/users/me")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        UserDetailResponse user = userService.getMyProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @Operation(summary = "Update my profile", description = "Update current user's profile")
    @PutMapping("/users/me")
    public ResponseEntity<ApiResponse<UserDetailResponse>> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDetailResponse user = userService.updateMyProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));
    }

    @Operation(summary = "Change password", description = "Change current user's password")
    @PostMapping("/users/me/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @Operation(summary = "Check email exists", description = "Check if email is already registered")
    @GetMapping("/users/check-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }
}
