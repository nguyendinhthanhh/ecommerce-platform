package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.CategoryFilterRequest;
import com.ecommerce.platform.dto.request.CreateCategoryRequest;
import com.ecommerce.platform.dto.request.UpdateCategoryRequest;
import com.ecommerce.platform.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CreateCategoryRequest request);

    CategoryResponse updateCategory(Long id, UpdateCategoryRequest request);

    void deleteCategory(Long id);

    CategoryResponse getCategoryById(Long id);

    List<CategoryResponse> getAllCategories(CategoryFilterRequest filter);

    List<CategoryResponse> getCategoriesWithHierarchy();
}
