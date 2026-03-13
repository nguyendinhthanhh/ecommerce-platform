package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

       @EntityGraph(attributePaths = { "category" })
       @Query("SELECT p FROM Product p WHERE p.status = :status")
       Page<Product> findByStatusWithGraph(@Param("status") Product.ProductStatus status, Pageable pageable);

       @EntityGraph(attributePaths = { "category" })
       @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.status = 'ACTIVE'")
       Page<Product> findByCategoryIdWithGraph(@Param("categoryId") Long categoryId, Pageable pageable);

       @EntityGraph(attributePaths = { "category" })
       @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds AND p.status = 'ACTIVE'")
       Page<Product> findByCategoryIdInWithGraph(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);

       @EntityGraph(attributePaths = { "category" })
       @Query("SELECT p FROM Product p WHERE p.id = :id")
       Optional<Product> findByIdWithGraph(@Param("id") Long id);

       @EntityGraph(attributePaths = { "category" })
       @Query(value = "SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND " +
                     "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                     "ORDER BY CASE " +
                     "WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 1 " +
                     "WHEN LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 2 " +
                     "ELSE 3 END ASC", countQuery = "SELECT count(p) FROM Product p WHERE p.status = 'ACTIVE' AND " +
                                   "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       Page<Product> searchProductsWithGraph(@Param("keyword") String keyword, Pageable pageable);

       @EntityGraph(attributePaths = { "category" })
       @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.soldCount DESC")
       Page<Product> findTopSellingProductsWithGraph(Pageable pageable);

       @EntityGraph(attributePaths = { "category" })
       @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
       Page<Product> findNewestProductsWithGraph(Pageable pageable);

       @EntityGraph(attributePaths = { "category" })
       @Query("SELECT p FROM Product p WHERE " +
                     "(:status IS NULL OR p.status = :status) AND " +
                     "(:categoryId IS NULL OR p.category.id = :categoryId)")
       Page<Product> findForManagement(
                     @Param("status") Product.ProductStatus status,
                     @Param("categoryId") Long categoryId,
                     Pageable pageable);

       @Query(value = "SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND " +
                     "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "p.category.id IN :categoryIds OR " +
                     "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                     "ORDER BY CASE " +
                     "WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 1 " +
                     "WHEN LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 2 " +
                     "WHEN p.category.id IN :categoryIds THEN 3 " +
                     "ELSE 4 END ASC", countQuery = "SELECT count(p) FROM Product p WHERE p.status = 'ACTIVE' AND " +
                                   "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "p.category.id IN :categoryIds OR " +
                                   "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       Page<Product> searchProductsByKeywordOrCategoryIds(@Param("keyword") String keyword,
                     @Param("categoryIds") List<Long> categoryIds, Pageable pageable);

       Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

       @Query(value = "SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND " +
                     "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                     "ORDER BY CASE " +
                     "WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 1 " +
                     "WHEN LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 2 " +
                     "ELSE 3 END ASC", countQuery = "SELECT count(p) FROM Product p WHERE p.status = 'ACTIVE' AND " +
                                   "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                   "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

       @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.soldCount DESC")
       List<Product> findTopSellingProducts(Pageable pageable);

       @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
       List<Product> findNewestProducts(Pageable pageable);

       // ===== AI SEARCH SUPPORT =====

       @Query("""
                         SELECT p FROM Product p
                         WHERE p.status = 'ACTIVE' AND
                         (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                         OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                         OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
                         ORDER BY CASE
                         WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 1
                         WHEN LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 2
                         ELSE 3 END ASC
                     """)
       List<Product> searchByKeyword(@Param("keyword") String keyword);

       List<Product> findByPriceLessThanEqual(java.math.BigDecimal price);

       List<Product> findByAverageRatingGreaterThanEqual(Double rating);

       List<Product> findByStockQuantityGreaterThanEqual(Integer qty);

       // New: consider effective price (discountPrice if present, otherwise price)
       @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND COALESCE(p.discountPrice, p.price) <= :maxPrice ORDER BY COALESCE(p.discountPrice, p.price) ASC")
       List<Product> findByEffectivePriceLessThanEqual(@Param("maxPrice") java.math.BigDecimal maxPrice);

       @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND COALESCE(p.discountPrice, p.price) BETWEEN :minPrice AND :maxPrice ORDER BY COALESCE(p.discountPrice, p.price) ASC")
       List<Product> findByEffectivePriceBetween(@Param("minPrice") java.math.BigDecimal minPrice, @Param("maxPrice") java.math.BigDecimal maxPrice);

       @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND COALESCE(p.discountPrice, p.price) <= :maxPrice ORDER BY CASE WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 1 WHEN LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 2 ELSE 3 END ASC")
       List<Product> searchByKeywordAndMaxPrice(@Param("keyword") String keyword, @Param("maxPrice") java.math.BigDecimal maxPrice);

       @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND COALESCE(p.discountPrice, p.price) BETWEEN :minPrice AND :maxPrice ORDER BY CASE WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 1 WHEN LOWER(p.category.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 2 ELSE 3 END ASC")
       List<Product> searchByKeywordAndPriceRange(@Param("keyword") String keyword, @Param("minPrice") java.math.BigDecimal minPrice, @Param("maxPrice") java.math.BigDecimal maxPrice);
}
