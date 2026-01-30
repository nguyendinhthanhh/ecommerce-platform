package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.response.ProductResponse;
import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.mapper.ProductMapper;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        Page<Product> products = productRepository.findByStatus(Product.ProductStatus.ACTIVE, pageable);
        return products.map(productMapper::toResponse);
    }

    @Override
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        Page<Product> products = productRepository.searchProducts(keyword, pageable);
        return products.map(productMapper::toResponse);
    }

    @Override
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        Page<Product> products = productRepository.findByCategoryId(categoryId, pageable);
        return products.map(productMapper::toResponse);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return productMapper.toResponse(product);
    }

    @Override
    public Page<ProductResponse> getTopSellingProducts(Pageable pageable) {
        List<Product> products = productRepository.findTopSellingProducts(pageable);
        List<ProductResponse> responses = productMapper.toResponseList(products);
        return new PageImpl<>(responses, pageable, responses.size());
    }

    @Override
    public Page<ProductResponse> getNewestProducts(Pageable pageable) {
        List<Product> products = productRepository.findNewestProducts(pageable);
        List<ProductResponse> responses = productMapper.toResponseList(products);
        return new PageImpl<>(responses, pageable, responses.size());
    }
}
