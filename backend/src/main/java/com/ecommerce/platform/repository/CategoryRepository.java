package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
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
}
