package com.ecommerce.platform.repository;

import com.ecommerce.platform.entity.EkycResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EkycRepository extends JpaRepository<EkycResultEntity, Long> {
}
