package com.ecommerce.platform.repository.specification;

import com.ecommerce.platform.dto.request.UserFilterRequest;
import com.ecommerce.platform.entity.User;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> withFilter(UserFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only exclude INACTIVE if:
            // 1. includeDeleted is false/null AND
            // 2. No specific status filter is provided (let user filter by any status including INACTIVE)
            boolean hasStatusFilter = StringUtils.hasText(filter.getStatus());
            boolean includeDeleted = filter.getIncludeDeleted() != null && filter.getIncludeDeleted();

            if (!includeDeleted && !hasStatusFilter) {
                predicates.add(cb.notEqual(root.get("status"), User.UserStatus.INACTIVE));
            }

            if (StringUtils.hasText(filter.getKeyword())) {
                String keyword = "%" + filter.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("email")), keyword),
                    cb.like(cb.lower(root.get("fullName")), keyword),
                    cb.like(cb.lower(root.get("phone")), keyword)
                ));
            }

            if (StringUtils.hasText(filter.getRole())) {
                try {
                    predicates.add(cb.equal(root.get("role"), User.Role.valueOf(filter.getRole().toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            if (hasStatusFilter) {
                try {
                    predicates.add(cb.equal(root.get("status"), User.UserStatus.valueOf(filter.getStatus().toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            if (StringUtils.hasText(filter.getDateFrom())) {
                LocalDateTime fromDate = LocalDate.parse(filter.getDateFrom(), formatter).atStartOfDay();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (StringUtils.hasText(filter.getDateTo())) {
                LocalDateTime toDate = LocalDate.parse(filter.getDateTo(), formatter).atTime(23, 59, 59);
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
