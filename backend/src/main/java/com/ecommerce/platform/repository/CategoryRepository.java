package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {
    List<Category> findByParentIsNull();
    List<Category> findByParentId(Long parentId);
    List<Category> findByIsActiveTrue();
    boolean existsBySlug(String slug);
    Optional<Category> findBySlug(String slug);
    Optional<Category> findByNameIgnoreCase(String name);
    List<Category> findByNameContainingIgnoreCase(String fragment);

    // Single query to match exact or containing (case-insensitive) to reduce repeated DB calls
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) = LOWER(:q) OR LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Category> findByNameEqualsOrContainingIgnoreCase(@Param("q") String q);

    // Fetch children for multiple parent ids in a single call
    List<Category> findByParentIdIn(List<Long> parentIds);
}
