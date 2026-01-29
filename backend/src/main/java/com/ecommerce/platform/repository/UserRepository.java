package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmailAndStatusNot(String email, User.UserStatus status);

    Optional<User> findByIdAndStatusNot(Long id, User.UserStatus status);

    boolean existsByEmailAndStatusNot(String email, User.UserStatus status);

    List<User> findByRoleAndStatusNot(User.Role role, User.UserStatus status);

    List<User> findByStatusAndStatusNot(User.UserStatus status, User.UserStatus excludeStatus);

    Page<User> findByStatus(User.UserStatus status, Pageable pageable);

    Page<User> findByRoleAndStatusNot(User.Role role, User.UserStatus status, Pageable pageable);

    Page<User> findByStatusAndStatusNot(User.UserStatus status, User.UserStatus excludeStatus, Pageable pageable);

    Page<User> findByStatusNot(User.UserStatus status, Pageable pageable);

    List<User> findByIdInAndStatusNot(List<Long> ids, User.UserStatus status);

    long countByStatusNot(User.UserStatus status);

    long countByStatus(User.UserStatus status);

    long countByRoleAndStatusNot(User.Role role, User.UserStatus status);

    long countByCreatedAtAfterAndStatusNot(LocalDateTime date, User.UserStatus status);

    long countByLastLoginAtAfterAndStatusNot(LocalDateTime date, User.UserStatus status);

    @Query("SELECT u FROM User u WHERE u.status <> 'INACTIVE' AND " +
           "(LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.status = :status, u.updatedAt = CURRENT_TIMESTAMP, u.updatedBy = :updatedBy WHERE u.id IN :ids AND u.status <> 'INACTIVE'")
    int bulkUpdateStatus(@Param("ids") List<Long> ids, @Param("status") User.UserStatus status, @Param("updatedBy") Long updatedBy);

    @Modifying
    @Query("UPDATE User u SET u.status = 'INACTIVE', u.updatedAt = CURRENT_TIMESTAMP, u.updatedBy = :updatedBy WHERE u.id IN :ids")
    int bulkSoftDelete(@Param("ids") List<Long> ids, @Param("updatedBy") Long updatedBy);
}
