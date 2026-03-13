package com.ecommerce.platform.ai.service.serviceimpl;


import com.ecommerce.platform.ai.service.EmbeddingService;
import com.ecommerce.platform.dto.request.ChatRequest;
import com.ecommerce.platform.dto.request.ProductSuggestionRequest;
import com.ecommerce.platform.dto.response.ChatResponse;
import com.ecommerce.platform.dto.request.IntentResult;
import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Core RAG Chat Service for Ecommerce Platform
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatClient.Builder chatClientBuilder;
    private final IntentClassifierService intentClassifierService;
    private final EmbeddingService embeddingService;
    private final ProductRepository productRepository;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;



    private static final String SYSTEM_PROMPT = """
        Bạn là AI tư vấn bán hàng cho nền tảng ecommerce.
        
        Nhiệm vụ:
        - Gợi ý sản phẩm phù hợp
        - Trả lời về giá, tồn kho, đánh giá
        - So sánh sản phẩm nếu cần
        
        QUY TẮC:
        - Không bịa thông tin
        - Chỉ dùng dữ liệu trong context
        - Nếu không có thông tin → nói rõ
        
        Trả lời lịch sự, tự nhiên, tiếng Việt.
        """;

    @Transactional
    public ChatResponse chat(ChatRequest request) {
        long start = System.currentTimeMillis();

        try {
            // 1. Intent
            IntentResult intent = intentClassifierService.classify(request.getMessage());
            log.info("Intent: {}", intent.getIntent());

            // Lấy sản phẩm liên quan
            List<Product> products = retrieveProducts(intent);
            // Chuyển đổi thành suggestions với link
            List<ProductSuggestionRequest> suggestions = products.stream()
                    .map(this::toProductSuggestion)
                    .collect(Collectors.toList());

            // Context cho LLM
            String context = retrieveContext(intent, products);


            // Generate response
            String response = generateResponse(request.getMessage(), context);

            long time = System.currentTimeMillis() - start;

            return ChatResponse.success(response, suggestions, time);

        } catch (Exception e) {
            log.error("Chat error", e);
            return ChatResponse.error(e.getMessage());
        }
    }

    private ProductSuggestionRequest toProductSuggestion(Product p) {
        return ProductSuggestionRequest.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .rating(p.getAverageRating())
                .totalReviews(p.getTotalReviews())
                .stockQuantity(p.getStockQuantity())
                .imageUrl(p.getThumbnail() != null ? p.getThumbnail().toString() : null)
                .detailUrl(frontendBaseUrl + "/api/products/" + p.getId())
                .build();
    }



    // ================= CONTEXT RETRIEVAL =================

    private String retrieveContext(IntentResult intent, List<Product> products) {

        StringBuilder context = new StringBuilder();

        switch (intent.getIntent()) {

            case PRODUCT_SEARCH -> {

                List<Document> semantic = embeddingService.searchSimilar(intent.getRawQuery());

                context.append("=== SẢN PHẨM ===\n");

                if (!products.isEmpty()) {
                    context.append("\nTừ database:\n");
                    products.forEach(p -> context.append(formatProduct(p)).append("\n"));
                }

                if (!semantic.isEmpty()) {
                    context.append("\nGợi ý liên quan:\n");
                    semantic.forEach(doc ->
                            context.append(doc.getText()).append("\n---\n"));
                }
            }

            case STOCK_CHECK -> {

                context.append("=== TỒN KHO ===\n");

                products.forEach(p -> {

                    String priceText = p.getDiscountPrice() != null
                            ? String.format("%s → %s", p.getPrice(), p.getDiscountPrice())
                            : p.getPrice().toString();

                    String stockText = p.getStockQuantity() > 0
                            ? "Còn " + p.getStockQuantity()
                            : "HẾT HÀNG ❌";

                    context.append(String.format(
                            "- %s: %s | Giá: %s VNĐ | Đã bán: %d\n",
                            p.getName(),
                            stockText,
                            priceText,
                            p.getSoldCount()
                    ));
                });
            }

            case BULK_ORDER -> {

                context.append("=== MUA SỐ LƯỢNG LỚN ===\n");
                context.append("- Liên hệ để nhận giá tốt hơn khi mua nhiều.\n");

                if (intent.getQuantity() != null) {

                    List<Product> available =
                            productRepository.findByStockQuantityGreaterThanEqual(intent.getQuantity());

                    context.append("\nSản phẩm đủ số lượng:\n");

                    available.forEach(p ->
                            context.append(formatProduct(p)).append("\n"));
                }
            }

            case REVIEW_QUERY -> {

                context.append("=== ĐÁNH GIÁ ===\n");

                products.forEach(p ->
                        context.append(String.format(
                                "- %s: %.1f⭐ (%d reviews)\n",
                                p.getName(),
                                p.getAverageRating(),
                                p.getTotalReviews()
                        )));
            }

            case PRICE_COMPARE -> {

                context.append("=== SO SÁNH GIÁ ===\n");

                products.forEach(p ->
                        context.append(formatProduct(p)).append("\n"));
            }

            case DISCOUNT_POLICY -> {

                context.append("=== KHUYẾN MÃI ===\n");
                context.append("- Giá giảm hiển thị trực tiếp trên sản phẩm.\n");
                context.append("- Có thể có flash sale hoặc voucher theo thời điểm.\n");
            }

            case GENERAL_CHAT -> {

                List<Document> docs =
                        embeddingService.searchSimilar(intent.getRawQuery());

                docs.forEach(d ->
                        context.append(d.getText()).append("\n---\n"));
            }
        }

        return context.toString();
    }

    // ================= PRODUCT RETRIEVAL =================

    private List<Product> retrieveProducts(IntentResult intent) {

        // keyword + price handling
        if (intent.getKeyword() != null) {
            if (intent.getMinPrice() != null && intent.getMaxPrice() != null) {
                return productRepository.searchByKeywordAndPriceRange(intent.getKeyword(), intent.getMinPrice(), intent.getMaxPrice())
                        .stream().limit(10).collect(Collectors.toList());
            }

            if (intent.getMaxPrice() != null) {
                return productRepository.searchByKeywordAndMaxPrice(intent.getKeyword(), intent.getMaxPrice())
                        .stream().limit(10).collect(Collectors.toList());
            }

            // fallback to keyword-only search
            return productRepository.searchByKeyword(intent.getKeyword())
                    .stream().limit(10).collect(Collectors.toList());
        }

        // price filter without keyword
        if (intent.getMaxPrice() != null && intent.getMinPrice() != null) {
            return productRepository.findByEffectivePriceBetween(intent.getMinPrice(), intent.getMaxPrice())
                    .stream().limit(10).collect(Collectors.toList());
        }

        if (intent.getMaxPrice() != null) {
            return productRepository.findByEffectivePriceLessThanEqual(intent.getMaxPrice())
                    .stream().limit(10).collect(Collectors.toList());
        }

        // rating filter
        if (intent.getRating() != null) {
            return productRepository.findByAverageRatingGreaterThanEqual(intent.getRating())
                    .stream().limit(10).collect(Collectors.toList());
        }

        return productRepository.findAll()
                .stream()
                .limit(10)
                .collect(Collectors.toList());
    }

    private String formatProduct(Product p) {
        String price = p.getDiscountPrice() != null
                ? String.format("%s → %s", p.getPrice(), p.getDiscountPrice())
                : p.getPrice().toString();

        String stock = p.getStockQuantity() > 0
                ? "Còn " + p.getStockQuantity()
                : "HẾT HÀNG ";

        return String.format(
                "• %s | Giá: %s VNĐ |  %.1f (%d) | %s | Đã bán: %d",
                p.getName(),
                price,
                p.getAverageRating(),
                p.getTotalReviews(),
                stock,
                p.getSoldCount()
        );
    }

    // ================= LLM =================

    private String generateResponse(String question, String context) {
        ChatClient chatClient = chatClientBuilder.build();

        String prompt = String.format("""
                %s
                
                ===== CONTEXT =====
                %s
                
                ===== CÂU HỎI =====
                %s
                
                Trả lời dựa trên context.
                """, SYSTEM_PROMPT, context, question);

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }


}

