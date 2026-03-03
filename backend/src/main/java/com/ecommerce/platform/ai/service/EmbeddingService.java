package com.ecommerce.platform.ai.service;

import com.ecommerce.platform.entity.Product;
import org.springframework.ai.document.Document;

import java.util.List;

public interface EmbeddingService {
    void embedProduct(Product product);
    void embedAllProducts();
    List<Document> searchSimilar(String query);
}
