package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {
    Optional<Shop> findBySellerId(Long sellerId);
    List<Shop> findByStatus(Shop.ShopStatus status);
    boolean existsBySellerId(Long sellerId);
}
