package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.request.CategoryFilterRequest;
import com.ecommerce.platform.dto.request.CreateCategoryRequest;
import com.ecommerce.platform.dto.request.UpdateCategoryRequest;
import com.ecommerce.platform.dto.response.CategoryResponse;
import com.ecommerce.platform.entity.Category;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.mapper.CategoryMapper;
import com.ecommerce.platform.repository.CategoryRepository;
import com.ecommerce.platform.repository.specification.CategorySpecification;
import com.ecommerce.platform.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        // Validate slug uniqueness if provided
        if (request.getSlug() != null && !request.getSlug().isEmpty()) {
            if (categoryRepository.existsBySlug(request.getSlug())) {
                throw new BadRequestException("Slug already exists: " + request.getSlug());
            }
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .image(request.getImage())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .slug(request.getSlug())
                .bannerUrl(request.getBannerUrl())
                .isMenu(request.getIsMenu() != null ? request.getIsMenu() : true)
                .isFilterable(request.getIsFilterable() != null ? request.getIsFilterable() : true)
                .position(request.getPosition() != null ? request.getPosition() : 0)
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .build();

        // Set parent and calculate level
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parent category not found with id: " + request.getParentId()));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(0);
        }

        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getImage() != null) {
            category.setImage(request.getImage());
        }
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        
        // Update enterprise fields
        if (request.getSlug() != null) {
            // Validate slug uniqueness
            if (!request.getSlug().equals(category.getSlug()) && 
                categoryRepository.existsBySlug(request.getSlug())) {
                throw new BadRequestException("Slug already exists: " + request.getSlug());
            }
            category.setSlug(request.getSlug());
        }
        if (request.getBannerUrl() != null) {
            category.setBannerUrl(request.getBannerUrl());
        }
        if (request.getIsMenu() != null) {
            category.setIsMenu(request.getIsMenu());
        }
        if (request.getIsFilterable() != null) {
            category.setIsFilterable(request.getIsFilterable());
        }
        if (request.getPosition() != null) {
            category.setPosition(request.getPosition());
        }
        if (request.getMetaTitle() != null) {
            category.setMetaTitle(request.getMetaTitle());
        }
        if (request.getMetaDescription() != null) {
            category.setMetaDescription(request.getMetaDescription());
        }
        
        // Update parent and recalculate level
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BadRequestException("Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parent category not found with id: " + request.getParentId()));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
            
            // Update levels of all children recursively
            updateChildrenLevels(category);
        }

        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(updatedCategory);
    }
    
    private void updateChildrenLevels(Category parent) {
        if (parent.getChildren() != null && !parent.getChildren().isEmpty()) {
            for (Category child : parent.getChildren()) {
                child.setLevel(parent.getLevel() + 1);
                categoryRepository.save(child);
                updateChildrenLevels(child);
            }
        }
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Soft delete - set isActive = false
        category.setIsActive(false);

        // Also deactivate all child categories
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            deactivateChildren(category.getChildren());
        }

        categoryRepository.save(category);
    }

    private void deactivateChildren(List<Category> children) {
        for (Category child : children) {
            child.setIsActive(false);
            if (child.getChildren() != null && !child.getChildren().isEmpty()) {
                deactivateChildren(child.getChildren());
            }
            categoryRepository.save(child);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponseWithChildren(category);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getAllCategories(CategoryFilterRequest filter) {
        if (filter == null) {
            filter = new CategoryFilterRequest();
        }

        // Default pagination
        int page = filter.getPage() != null ? filter.getPage() : 0;
        int size = filter.getSize() != null ? filter.getSize() : 10;
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "id";
        String sortDir = filter.getSortDir() != null ? filter.getSortDir() : "desc";

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Category> categoryPage = categoryRepository.findAll(CategorySpecification.filter(filter), pageable);
        return categoryPage.map(categoryMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesWithHierarchy() {
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(categoryMapper::toResponseWithChildren)
                .toList();
    }
}
