package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.request.*;
import com.ecommerce.platform.dto.response.BulkActionResponse;
import com.ecommerce.platform.dto.response.UserDetailResponse;
import com.ecommerce.platform.dto.response.UserResponse;
import com.ecommerce.platform.dto.response.UserStatisticsResponse;
import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.mapper.UserMapper;
import com.ecommerce.platform.repository.OrderRepository;
import com.ecommerce.platform.repository.ReviewRepository;
import com.ecommerce.platform.repository.UserRepository;
import com.ecommerce.platform.repository.specification.UserSpecification;
import com.ecommerce.platform.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public UserResponse createUser(CreateUserRequest request, Long adminId) {
        validateEmailNotExists(request.getEmail());

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(parseRole(request.getRole()));
        user.setStatus(parseStatus(request.getStatus()));
        user.setCreatedBy(adminId);

        log.info("User created: {} by admin: {}", user.getEmail(), adminId);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userMapper.toResponse(findUserById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserDetailById(Long id) {
        return buildUserDetailResponse(findUserById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        return userMapper.toResponse(findUserByEmail(email));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findByStatusNot(User.UserStatus.INACTIVE, pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsersByRole(String role, Pageable pageable) {
        return userRepository.findByRoleAndStatusNot(parseRole(role), User.UserStatus.INACTIVE, pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsersByStatus(String status, Pageable pageable) {
        // Don't exclude INACTIVE when explicitly filtering by status
        return userRepository.findByStatus(parseStatus(status), pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchByKeyword(keyword, pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> filterUsers(UserFilterRequest filter, Pageable pageable) {
        return userRepository.findAll(UserSpecification.withFilter(filter), pageable).map(userMapper::toResponse);
    }

    @Override
    public UserResponse adminUpdateUser(Long id, AdminUpdateUserRequest request, Long adminId) {
        User user = findUserByIdIncludeInactive(id);

        userMapper.updateFromAdminRequest(request, user);
        user.setRole(parseRole(request.getRole()));
        user.setStatus(parseStatus(request.getStatus()));
        user.setUpdatedBy(adminId);

        log.info("User {} updated by admin: {}", id, adminId);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateUserStatus(Long id, String status, Long adminId) {
        User user = findUserByIdIncludeInactive(id);
        user.setStatus(parseStatus(status));
        user.setUpdatedBy(adminId);

        log.info("User {} status changed to {} by admin: {}", id, status, adminId);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id, Long adminId) {
        User user = findUserById(id);
        // Set to INACTIVE instead of DELETED per new requirement
        user.setStatus(User.UserStatus.INACTIVE);
        user.setUpdatedBy(adminId);
        userRepository.save(user);

        log.info("User {} soft deleted (set to INACTIVE) by admin: {}", id, adminId);
    }

    @Override
    public BulkActionResponse bulkAction(BulkUserActionRequest request, Long adminId) {
        List<Long> userIds = request.getUserIds();
        String action = request.getAction().toUpperCase();

        List<User> users = userRepository.findByIdInAndStatusNot(userIds, User.UserStatus.INACTIVE);
        List<Long> foundIds = users.stream().map(User::getId).toList();
        List<Long> failedIds = new ArrayList<>(userIds);
        failedIds.removeAll(foundIds);

        int successCount = switch (action) {
            case "ACTIVATE" -> userRepository.bulkUpdateStatus(foundIds, User.UserStatus.ACTIVE, adminId);
            case "DEACTIVATE" -> userRepository.bulkUpdateStatus(foundIds, User.UserStatus.INACTIVE, adminId);
            case "BAN" -> userRepository.bulkUpdateStatus(foundIds, User.UserStatus.BANNED, adminId);
            case "DELETE" -> userRepository.bulkSoftDelete(foundIds, adminId);
            default -> throw new BadRequestException("Invalid action: " + action);
        };

        log.info("Bulk action {} performed on {} users by admin: {}", action, successCount, adminId);
        return userMapper.toBulkActionResponse(userIds.size(), successCount, failedIds.size(), failedIds, action);
    }

    @Override
    @Transactional(readOnly = true)
    public UserStatisticsResponse getUserStatistics() {
        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime weekAgo = today.minusDays(7);
        LocalDateTime monthAgo = today.minusDays(30);

        return userMapper.toStatisticsResponse(
                userRepository.countByStatusNot(User.UserStatus.INACTIVE),
                userRepository.countByStatus(User.UserStatus.ACTIVE),
                userRepository.countByStatus(User.UserStatus.INACTIVE),
                userRepository.countByStatus(User.UserStatus.BANNED),
                userRepository.countByRoleAndStatusNot(User.Role.CUSTOMER, User.UserStatus.INACTIVE),
                userRepository.countByRoleAndStatusNot(User.Role.STAFF, User.UserStatus.INACTIVE),
                userRepository.countByRoleAndStatusNot(User.Role.ADMIN, User.UserStatus.INACTIVE),
                userRepository.countByCreatedAtAfterAndStatusNot(today, User.UserStatus.INACTIVE),
                userRepository.countByCreatedAtAfterAndStatusNot(weekAgo, User.UserStatus.INACTIVE),
                userRepository.countByCreatedAtAfterAndStatusNot(monthAgo, User.UserStatus.INACTIVE),
                userRepository.countByLastLoginAtAfterAndStatusNot(today, User.UserStatus.INACTIVE)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getMyProfile(Long userId) {
        return buildUserDetailResponse(findUserById(userId));
    }

    @Override
    public UserDetailResponse updateMyProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserById(userId);

        userMapper.updateFromProfileRequest(request, user);
        user.setUpdatedBy(userId);

        log.info("User {} updated their profile", userId);
        return buildUserDetailResponse(userRepository.save(user));
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUserById(userId);
        validatePasswordChange(request, user.getPassword());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedBy(userId);
        userRepository.save(user);

        log.info("User {} changed their password", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmailAndStatusNot(email, User.UserStatus.INACTIVE);
    }

    @Override
    public void updateLastLogin(Long userId, String ipAddress) {
        userRepository.findByIdAndStatusNot(userId, User.UserStatus.INACTIVE).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginIp(ipAddress);
            userRepository.save(user);
        });
    }

    private User findUserById(Long id) {
        return userRepository.findByIdAndStatusNot(id, User.UserStatus.INACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private User findUserByIdIncludeInactive(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailAndStatusNot(email, User.UserStatus.INACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private void validateEmailNotExists(String email) {
        if (userRepository.existsByEmailAndStatusNot(email, User.UserStatus.INACTIVE)) {
            throw new BadRequestException("Email already exists: " + email);
        }
    }

    private void validatePasswordChange(ChangePasswordRequest request, String currentEncodedPassword) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentEncodedPassword)) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }
        if (passwordEncoder.matches(request.getNewPassword(), currentEncodedPassword)) {
            throw new BadRequestException("New password must be different from current password");
        }
    }

    private UserDetailResponse buildUserDetailResponse(User user) {
        UserDetailResponse response = userMapper.toDetailResponse(user);

        if (user.getCreatedAt() != null) {
            response.setAccountAgeDays(ChronoUnit.DAYS.between(user.getCreatedAt(), LocalDateTime.now()));
        }

        enrichResponseWithRoleStatistics(response, user);
        enrichResponseWithAuditNames(response, user);

        response.setLastActivityStatus(calculateLastActivityStatus(user.getLastLoginAt()));
        response.setIsOnline(isUserOnline(user.getLastLoginAt()));

        return response;
    }

    private void enrichResponseWithRoleStatistics(UserDetailResponse response, User user) {
        if (user.getRole() == User.Role.CUSTOMER) {
            response.setTotalOrders(orderRepository.countByCustomerId(user.getId()));
            response.setTotalReviews(reviewRepository.countByCustomerId(user.getId()));
            response.setTotalSpent(orderRepository.sumTotalAmountByCustomerId(user.getId()));
        }
        // STAFF and ADMIN don't need statistics in single-vendor system
    }

    private void enrichResponseWithAuditNames(UserDetailResponse response, User user) {
        if (user.getCreatedBy() != null) {
            userRepository.findByIdAndStatusNot(user.getCreatedBy(), User.UserStatus.INACTIVE)
                    .ifPresent(creator -> response.setCreatedByName(creator.getFullName()));
        }
        if (user.getUpdatedBy() != null) {
            userRepository.findByIdAndStatusNot(user.getUpdatedBy(), User.UserStatus.INACTIVE)
                    .ifPresent(updater -> response.setUpdatedByName(updater.getFullName()));
        }
    }

    private String calculateLastActivityStatus(LocalDateTime lastLogin) {
        if (lastLogin == null) return "Never logged in";
        long minutes = ChronoUnit.MINUTES.between(lastLogin, LocalDateTime.now());
        if (minutes < 5) return "Active now";
        if (minutes < 60) return "Last seen " + minutes + " minutes ago";
        if (minutes < 1440) return "Last seen " + (minutes / 60) + " hours ago";
        return "Last seen " + (minutes / 1440) + " days ago";
    }

    private Boolean isUserOnline(LocalDateTime lastLogin) {
        return lastLogin != null && ChronoUnit.MINUTES.between(lastLogin, LocalDateTime.now()) < 5;
    }

    private User.Role parseRole(String role) {
        if (role == null || role.isEmpty()) return User.Role.CUSTOMER;
        try {
            return User.Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + role);
        }
    }

    private User.UserStatus parseStatus(String status) {
        if (status == null || status.isEmpty()) return User.UserStatus.ACTIVE;
        try {
            return User.UserStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
    }
}
