package com.ecommerce.platform.repository.specification;

import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.entity.Review;
import com.ecommerce.platform.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ReviewSpecification {

    public static Specification<Review> filterReviews(
            Review.ReviewStatus status,
            Integer rating,
            Boolean isReplied,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Long productId,
            Long categoryId,
            Boolean isReported,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Joins to avoid N+1 and for search (using LEFT JOIN)
            Join<Review, Product> productJoin = root.join("product", JoinType.LEFT);
            Join<Product, Object> categoryJoin = productJoin.join("category", JoinType.LEFT);
            Join<Review, User> customerJoin = root.join("customer", JoinType.LEFT);
            // We join order just in case we need it, or rely on lazy loading if not eagerly
            // fetched here.
            // For search/filtering, we don't strictly need to filter by order fields yet,
            // but good to have if needed.

            // 1. Status Filter
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 2. Rating Filter
            if (rating != null) {
                predicates.add(cb.equal(root.get("rating"), rating));
            }

            // 3. Reply Status Filter
            if (isReplied != null) {
                if (isReplied) {
                    predicates.add(cb.isNotNull(root.get("reply")));
                } else {
                    predicates.add(cb.isNull(root.get("reply")));
                }
            }

            // 4. Date Range Filter
            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), dateTo));
            }

            // 5. Product ID Filter
            if (productId != null) {
                predicates.add(cb.equal(root.get("product").get("id"), productId));
            }

            // 6. Category ID Filter
            if (categoryId != null) {
                predicates.add(cb.equal(productJoin.get("category").get("id"), categoryId));
            }

            // 7. Reported Filter
            if (isReported != null) {
                predicates.add(cb.equal(root.get("isReported"), isReported));
            }

            // 8. Search (Complex logic to handle bytea/text mismatch)
            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.toLowerCase() + "%";

                // Handle 'convert_from' for potential bytea columns
                // Using criteriaBuilder function to call PostgreSQL's convert_from(col, 'UTF8')

                // For Product Name
                var productNamePath = productJoin.get("name");
                var productNameStr = cb.function("convert_from", String.class, productNamePath, cb.literal("UTF8"));
                var productNameLower = cb.lower(productNameStr);

                // For Customer Name
                var customerNamePath = customerJoin.get("fullName");
                var customerNameStr = cb.function("convert_from", String.class, customerNamePath, cb.literal("UTF8"));
                var customerNameLower = cb.lower(customerNameStr);

                // For Comment (handle nulls using coalesce)
                var commentPath = root.get("comment");
                var commentStr = cb.function("convert_from", String.class, commentPath, cb.literal("UTF8"));
                // Coalesce is tricky with function return, usually cleaner to check isNotNull
                // OR coalesce.
                // Simple approach: coalesce(convert_from(comment, 'UTF8'), '')
                var commentCoalesce = cb.coalesce(commentStr, "");
                var commentLower = cb.lower(commentCoalesce.as(String.class));

                Predicate searchPredicate = cb.or(
                        cb.like(productNameLower, searchLike),
                        cb.like(customerNameLower, searchLike),
                        cb.like(commentLower, searchLike));
                predicates.add(searchPredicate);
            }

            // Order by logic is handled by Pageable, but we need to ensure distinctive
            // results if specific joins cause dupes.
            // query.distinct(true);
            // Note: distinct can kill performance on large text fields.
            // Since we are reviewing One-To-Many relationships inverse side?
            // Review -> Product (Many-to-One) -> OK.
            // Review -> User (Many-to-One) -> OK.
            // Duplicate rows usually happen if we join One-To-Many (e.g. Review -> Images).
            // We are not joining images here.
            // So distinct might not be strictly necessary, but safe to keep if unsure.

            query.orderBy(cb.desc(root.get("createdAt"))); // Default fallback if pageable sort is empty?
            // Actually Spring Pageable overrides this.

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
