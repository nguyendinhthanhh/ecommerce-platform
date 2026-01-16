package com.ecommerce.platform.mapper;

import com.ecommerce.platform.dto.response.ProductResponse;
import com.ecommerce.platform.entity.Product;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "shopId", source = "shop.id")
    @Mapping(target = "shopName", source = "shop.name")
    @Mapping(target = "status", expression = "java(product.getStatus().name())")
    ProductResponse toResponse(Product product);

    List<ProductResponse> toResponseList(List<Product> products);
}
