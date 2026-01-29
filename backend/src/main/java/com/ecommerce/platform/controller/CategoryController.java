package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.CategoryFilterRequest;
import com.ecommerce.platform.dto.request.CreateCategoryRequest;
import com.ecommerce.platform.dto.request.UpdateCategoryRequest;
import com.ecommerce.platform.dto.response.ApiResponse;
import com.ecommerce.platform.dto.response.CategoryResponse;
import com.ecommerce.platform.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Category", description = "Category management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new category", description = "Admin only")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a category", description = "Admin only")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a category", description = "Admin only")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID with children")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get all categories with optional filters",
               description = "Search by keyword (name/description), filter by isActive, parentId, or rootOnly")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Boolean rootOnly) {

        CategoryFilterRequest filter = CategoryFilterRequest.builder()
                .keyword(keyword)
                .isActive(isActive)
                .parentId(parentId)
                .rootOnly(rootOnly)
                .build();

        List<CategoryResponse> response = categoryService.getAllCategories(filter);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/hierarchy")
    @Operation(summary = "Get categories with full hierarchy tree")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesWithHierarchy() {
        List<CategoryResponse> response = categoryService.getCategoriesWithHierarchy();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
