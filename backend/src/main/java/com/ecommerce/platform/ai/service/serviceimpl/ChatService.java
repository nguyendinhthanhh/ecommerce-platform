package com.ecommerce.platform.ai.service.serviceimpl;


import com.ecommerce.platform.ai.service.EmbeddingService;
import com.ecommerce.platform.dto.request.ChatRequest;
import com.ecommerce.platform.dto.request.ProductSuggestionRequest;
import com.ecommerce.platform.dto.response.ChatResponse;
import com.ecommerce.platform.dto.request.IntentResult;
import com.ecommerce.platform.entity.Category;
import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.repository.CategoryRepository;
import com.ecommerce.platform.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.*;
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
    private final CategoryRepository categoryRepository;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    private static final List<String> PHONE_TOKENS = Arrays.asList("điện thoại", "dien thoai", "phone", "smartphone", "mobile");

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

            // Context cho LLM (kept for non-factual intents)
            String context = retrieveContext(intent, products);

            // Generate response: use templated backend responses for factual product intents
            String response;
            if (shouldUseTemplate(intent)) {
                response = buildTemplateResponse(intent, request.getMessage(), products);
            } else {
                response = generateResponse(request.getMessage(), context);
            }

            long time = System.currentTimeMillis() - start;

            return ChatResponse.success(response, suggestions, time);

        } catch (Exception e) {
            log.error("Chat error", e);
            return ChatResponse.error(e.getMessage());
        }
    }

    private boolean shouldUseTemplate(IntentResult intent) {
        if (intent == null || intent.getIntent() == null) return false;
        switch (intent.getIntent()) {
            case PRODUCT_SEARCH:
            case CHEAPEST_PRODUCT:
            case MOST_EXPENSIVE_PRODUCT:
            case STOCK_CHECK:
            case PRICE_COMPARE:
            case BULK_ORDER:
            case REVIEW_QUERY:
                case PRODUCTS_COUNT:
                return true;
            default:
                return false;
        }
    }

    private String buildTemplateResponse(IntentResult intent, String userMessage, List<Product> products) {
        if (intent == null || intent.getIntent() == null) return "";

        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        nf.setMaximumFractionDigits(0);

        switch (intent.getIntent()) {
            case CHEAPEST_PRODUCT -> {
                if (products == null || products.isEmpty()) {
                    return "Rất tiếc, tôi không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.";
                }
                Product p = products.get(0);
                BigDecimal effective = effectivePrice(p);
                String priceText = nf.format(effective) + " VNĐ";
                String orig = p.getDiscountPrice() != null ? (nf.format(p.getPrice()) + " VNĐ") : null;
                String stock = p.getStockQuantity() != null ? String.valueOf(p.getStockQuantity()) : "không rõ";
                return String.format("Sản phẩm có giá rẻ nhất hiện tại là %s với giá %s%s.Còn %s sản phẩm trong kho.",
                        p.getName(), priceText, orig != null ? " (giá gốc " + orig + ")" : "", stock);
            }

            case MOST_EXPENSIVE_PRODUCT -> {
                if (products == null || products.isEmpty()) {
                    return "Rất tiếc, tôi không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.";
                }
                Product p = products.get(0);
                BigDecimal effective = effectivePrice(p);
                String priceText = nf.format(effective) + " VNĐ";
                String stock = p.getStockQuantity() != null ? String.valueOf(p.getStockQuantity()) : "không rõ";
                return String.format("Sản phẩm đắt nhất hiện tại là %s với giá %s.Còn %s sản phẩm còn trong kho.",
                        p.getName(), priceText, stock);
            }

            case PRODUCT_SEARCH -> {
                if (products == null || products.isEmpty()) {
                    return "Rất tiếc, tôi không tìm thấy sản phẩm nào phù hợp với yêu cầu của bạn.";
                }
                StringBuilder sb = new StringBuilder();
                sb.append("Dưới đây là một số sản phẩm phù hợp tôi tìm được:\n");
                int limit = Math.min(3, products.size());
                for (int i = 0; i < limit; i++) {
                    Product p = products.get(i);
                    BigDecimal effective = effectivePrice(p);
                    sb.append(String.format("%d. %s — %s VNĐ%s\n",
                            i + 1,
                            p.getName(),
                            nf.format(effective),
                            p.getDiscountPrice() != null ? " (giá gốc " + nf.format(p.getPrice()) + " VNĐ)" : ""));
                }
                if (products.size() > limit)
                    sb.append(String.format("Và %d sản phẩm khác...\n", products.size() - limit));
                sb.append("Bạn muốn xem chi tiết sản phẩm nào trong danh sách trên?");
                return sb.toString();
            }

            case STOCK_CHECK -> {
                if (products == null || products.isEmpty()) {
                    return "Không tìm thấy sản phẩm để kiểm tra tồn kho.";
                }
                StringBuilder sb = new StringBuilder();
                for (Product p : products) {
                    String stockText = p.getStockQuantity() != null && p.getStockQuantity() > 0 ? ("Còn " + p.getStockQuantity()) : "HẾT HÀNG";
                    BigDecimal effective = effectivePrice(p);
                    sb.append(String.format("- %s: %s | Giá: %s VNĐ\n", p.getName(), stockText, nf.format(effective)));
                }
                return sb.toString();
            }

            case PRICE_COMPARE -> {
                if (products == null || products.size() < 2) {
                    return "Vui lòng cung cấp ít nhất 2 sản phẩm để tôi so sánh giá.";
                }
                StringBuilder sb = new StringBuilder();
                products.sort(Comparator.comparing(this::effectivePrice));
                sb.append("So sánh giá (từ rẻ → đắt):\n");
                for (Product p : products) {
                    sb.append(String.format("- %s: %s VNĐ\n", p.getName(), nf.format(effectivePrice(p))));
                }
                return sb.toString();
            }

            case BULK_ORDER -> {
                if (intent.getQuantity() != null) {
                    int qty = intent.getQuantity();
                    List<Product> available = productRepository.findByStockQuantityGreaterThanEqual(qty);
                    if (available.isEmpty()) return "Không có sản phẩm đủ số lượng yêu cầu.";
                    StringBuilder sb = new StringBuilder();
                    sb.append(String.format("Các sản phẩm đủ số lượng %d mà bạn yêu cầu:\n", qty));
                    available.stream().limit(5).forEach(p -> sb.append(String.format("- %s | Tồn: %d\n", p.getName(), p.getStockQuantity())));
                    sb.append("Vui lòng liên hệ bộ phận bán hàng để nhận báo giá tốt hơn.");
                    return sb.toString();
                }
                return "Bạn muốn mua bao nhiêu sản phẩm?";
            }

            case REVIEW_QUERY -> {
                if (products == null || products.isEmpty()) return "Không tìm thấy sản phẩm để xem đánh giá.";
                StringBuilder sb = new StringBuilder();
                for (Product p : products) {
                    sb.append(String.format("- %s: %.1f⭐ (%d đánh giá)\n", p.getName(), p.getAverageRating(), p.getTotalReviews()));
                }
                return sb.toString();
            }

            case PRODUCTS_COUNT -> {
                // Total active products
                long total = productRepository.countByStatus(Product.ProductStatus.ACTIVE);

                // Per-category counts
                List<Object[]> counts = productRepository.countActiveProductsPerCategory();

                // Sort categories by count desc
                counts.sort((a, b) -> Long.compare(((Number)b[1]).longValue(), ((Number)a[1]).longValue()));

                StringBuilder sb = new StringBuilder();
                sb.append(String.format("Hiện tại cửa hàng có %d sản phẩm đang được bán:\n\n", total));

                for (Object[] row : counts) {
                    String catName = row[0] != null ? row[0].toString() : "Khác";
                    long c = ((Number) row[1]).longValue();
                    sb.append(String.format("• %s: %d\n", catName, c));
                }

                return sb.toString();
            }

            default -> {
                return "";
            }
        }
    }

    private BigDecimal effectivePrice(Product p) {
        return p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
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

        // Handle explicit cheapest/most-expensive intents first
        if (intent.getIntent() == IntentResult.IntentType.CHEAPEST_PRODUCT) {
            // If keyword present, attempt category-limited search ordered by price
            String kw = intent.getKeyword();
            if (kw != null && !kw.isBlank()) {
                List<Product> products = searchByKeywordOrCategoryOrderedByPrice(kw, intent.getMinPrice(), intent.getMaxPrice(), 1);
                if (!products.isEmpty()) return products;
            }
            // fallback: global cheapest
            Page<Product> page = productRepository.findCheapestProducts(PageRequest.of(0, 1));
            return page.getContent();
        }

        if (intent.getIntent() == IntentResult.IntentType.MOST_EXPENSIVE_PRODUCT) {
            String kw = intent.getKeyword();
            if (kw != null && !kw.isBlank()) {
                List<Product> products = searchByKeywordOrCategoryOrderedByPrice(kw, intent.getMinPrice(), intent.getMaxPrice(), 1);
                if (!products.isEmpty()) return products;
            }
            Page<Product> page = productRepository.findMostExpensiveProducts(PageRequest.of(0, 1));
            return page.getContent();
        }

        // prefer explicit keyword from intent; fall back to raw query
        String keyword = intent.getKeyword();
        String raw = intent.getRawQuery() == null ? "" : intent.getRawQuery().toLowerCase();

        if (keyword == null || keyword.isBlank()) {
            // look for phone tokens in raw query to map to category
            for (String token : PHONE_TOKENS) {
                if (raw.contains(token)) {
                    keyword = token;
                    break;
                }
            }
        }

        // If we have a keyword, try category-aware search
        if (keyword != null && !keyword.isBlank()) {
            List<Product> byCat = searchByKeywordOrCategoryOrderedByPrice(keyword, intent.getMinPrice(), intent.getMaxPrice(), 10);
            if (!byCat.isEmpty()) return byCat;

            // fallback to keyword-only searches
            String k = keyword.trim();
            if (intent.getMinPrice() != null && intent.getMaxPrice() != null) {
                return productRepository.searchByKeywordAndPriceRange(k, intent.getMinPrice(), intent.getMaxPrice())
                        .stream().limit(10).collect(Collectors.toList());
            }

            if (intent.getMaxPrice() != null) {
                return productRepository.searchByKeywordAndMaxPrice(k, intent.getMaxPrice())
                        .stream().limit(10).collect(Collectors.toList());
            }

            return productRepository.searchByKeyword(k)
                    .stream().limit(10).collect(Collectors.toList());
        }

        // price-only handling when no keyword/category
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

    // Helper: search by keyword OR matching categories (including children) and order by relevance then price; apply min/max and limit
    private List<Product> searchByKeywordOrCategoryOrderedByPrice(String keyword, BigDecimal minPrice, BigDecimal maxPrice, int limit) {
        String k = keyword.trim();

        // 1) Find category matches (single DB call) using equals-or-containing
        List<Category> matched = categoryRepository.findByNameEqualsOrContainingIgnoreCase(k);

        // If none, try tokenizing the keyword and searching fragments
        if (matched.isEmpty()) {
            String[] parts = k.split("\\s+");
            for (String part : parts) {
                if (part == null || part.isBlank()) continue;
                matched = categoryRepository.findByNameEqualsOrContainingIgnoreCase(part);
                if (!matched.isEmpty()) break;
            }
        }

        Set<Long> categoryIds = new HashSet<>();
        List<Long> parentIds = matched.stream().map(Category::getId).collect(Collectors.toList());
        categoryIds.addAll(parentIds);

        if (!parentIds.isEmpty()) {
            // fetch children in a single call
            List<Category> children = categoryRepository.findByParentIdIn(parentIds);
            for (Category c : children) categoryIds.add(c.getId());
        }

        // If we found categories, query by those category ids + keyword relevance, ordering already includes price
        if (!categoryIds.isEmpty()) {
            Page<Product> page = productRepository.searchProductsByKeywordOrCategoryIds(k, new ArrayList<>(categoryIds), PageRequest.of(0, limit));
            List<Product> products = page.getContent();

            // apply explicit price filters if present
            if (minPrice != null || maxPrice != null) {
                products = products.stream().filter(p -> {
                    BigDecimal effective = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
                    if (minPrice != null && effective.compareTo(minPrice) < 0) return false;
                    if (maxPrice != null && effective.compareTo(maxPrice) > 0) return false;
                    return true;
                }).limit(limit).collect(Collectors.toList());
            }

            return products.stream().limit(limit).collect(Collectors.toList());
        }

        return Collections.emptyList();
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
