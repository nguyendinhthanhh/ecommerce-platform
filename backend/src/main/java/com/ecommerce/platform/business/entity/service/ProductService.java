package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    
    // Browse Products - Customer
    Page<ProductResponse> getAllProducts(Pageable pageable);
    
    Page<ProductResponse> searchProducts(String keyword, Pageable pageable);
    
    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);
    
    ProductResponse getProductById(Long id);
    
    // Get top selling and newest products
    Page<ProductResponse> getTopSellingProducts(Pageable pageable);
    
    Page<ProductResponse> getNewestProducts(Pageable pageable);
}
