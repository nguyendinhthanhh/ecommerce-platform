package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.response.ApiResponse;
import com.ecommerce.platform.dto.response.PageResponse;
import com.ecommerce.platform.dto.response.ProductResponse;
import com.ecommerce.platform.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "APIs for browsing products")
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "Get all products", description = "Get paginated list of active products")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAllProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductResponse> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(products)));
    }

    @Operation(summary = "Search products", description = "Search products by keyword with pagination")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> searchProducts(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.searchProducts(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(products)));
    }

    @Operation(summary = "Get products by category", description = "Filter products by category ID with pagination")
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProductsByCategory(
            @PathVariable Long categoryId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(products)));
    }

    @Operation(summary = "Get product detail", description = "Get product details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @Operation(summary = "Get top selling products", description = "Get list of best-selling products with pagination")
    @GetMapping("/top-selling")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getTopSellingProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getTopSellingProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(products)));
    }

    @Operation(summary = "Get newest products", description = "Get list of newest products with pagination")
    @GetMapping("/newest")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getNewestProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getNewestProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(products)));
    }
}
