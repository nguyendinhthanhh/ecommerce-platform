package com.ecommerce.platform.ai.service.serviceimpl;

import com.ecommerce.platform.ai.service.EmbeddingService;
import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingServiceImpl implements EmbeddingService {
    private final VectorStore vectorStore;
    private final ProductRepository productRepository;
    @Value("${ai.vector.threshold}")
    private double threshold;

    @Value("${ai.vector.top-k}")
    private int topK;
    private Document toDocument(Product product) {
        return Document.builder()
                .text(product.toEmbeddingText())
                .metadata(Map.of(
                        "productId", product.getId(),
                        "name", product.getName(),
                        "price", product.getPrice().doubleValue(),
                        "discount", product.getDiscountPrice() != null ? product.getDiscountPrice().doubleValue() : 0.0,
                        "category", product.getCategory() != null
                                ? product.getCategory().getName()
                                : null,
                        "soldCount", product.getSoldCount(),
                        "averageRating", product.getAverageRating(),
                        "totalReviews", product.getTotalReviews(),
                        "stockQuantity", product.getStockQuantity()
                ))
                .build();
    }

    @Override
    @Transactional
    public void embedProduct(Product product) {
        log.info("Embedding product: {}", product.getName());
        Document document = toDocument(product);
        vectorStore.delete(List.of(document.getId()));
        vectorStore.add(List.of(document));
        log.info("Embedding stored for product ID: {}", product.getId());
    }

    @Override
    public void embedAllProducts() {
        log.info("Embedding all products...");
        List<Product> products = productRepository.findAll();

        List<Document> documents = products.stream()
                .map(this::toDocument)
                .toList();

        if (!documents.isEmpty()) {
            vectorStore.add(documents);
            log.info("Generated embeddings for {}", documents.size());
        }
    }

    @Override
    public List<Document> searchSimilar(String query) {
        log.info("Searching for similar products: {}", query);
        return vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(query)
                        .topK(topK)
                        .similarityThreshold(threshold)
                        .build()
        );
    }
}
