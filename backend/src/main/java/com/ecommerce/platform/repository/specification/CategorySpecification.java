package com.ecommerce.platform.repository.specification;

import com.ecommerce.platform.dto.request.CategoryFilterRequest;
import com.ecommerce.platform.entity.Category;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class CategorySpecification {

    public static Specification<Category> filter(CategoryFilterRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by keyword (name or description)
            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), keyword);
                Predicate descPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), keyword);
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }

            // Filter by isActive
            if (request.getIsActive() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), request.getIsActive()));
            }

            // Filter by parentId
            if (request.getParentId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("parent").get("id"), request.getParentId()));
            }

            // Filter root categories only (no parent)
            if (Boolean.TRUE.equals(request.getRootOnly())) {
                predicates.add(criteriaBuilder.isNull(root.get("parent")));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

