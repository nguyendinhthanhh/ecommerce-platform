package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.CreateProductRequest;
import com.ecommerce.platform.dto.request.UpdateProductRequest;
import com.ecommerce.platform.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    
    // Public APIs
    Page<ProductResponse> getAllProducts(Pageable pageable);
    Page<ProductResponse> searchProducts(String keyword, Pageable pageable);
    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);
    ProductResponse getProductById(Long id);
    List<ProductResponse> getTopSellingProducts(int limit);
    List<ProductResponse> getNewestProducts(int limit);

    // Staff/Admin APIs
    Page<ProductResponse> getAllProductsForManagement(Pageable pageable);
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(Long id, UpdateProductRequest request);
    void deleteProduct(Long id);
}
