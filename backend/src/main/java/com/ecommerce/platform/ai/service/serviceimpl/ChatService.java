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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;

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

    private static final java.util.List<String> PHONE_TOKENS = java.util.Arrays.asList("điện thoại", "dien thoai", "phone", "smartphone",
            "mobile", "iphone", "samsung", "apple", "oppo", "xiaomi", "vivo", "realme");

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

            // Generate response: use templated backend responses for factual product
            // intents
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
        if (intent == null || intent.getIntent() == null)
            return false;
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
        if (intent == null || intent.getIntent() == null)
            return "";

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
                int limit = Math.min(10, products.size());
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
                    String stockText = p.getStockQuantity() != null && p.getStockQuantity() > 0
                            ? ("Còn " + p.getStockQuantity())
                            : "HẾT HÀNG";
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
                    if (available.isEmpty())
                        return "Không có sản phẩm đủ số lượng yêu cầu.";
                    StringBuilder sb = new StringBuilder();
                    sb.append(String.format("Các sản phẩm đủ số lượng %d mà bạn yêu cầu:\n", qty));
                    available.stream().limit(5).forEach(
                            p -> sb.append(String.format("- %s | Tồn: %d\n", p.getName(), p.getStockQuantity())));
                    sb.append("Vui lòng liên hệ bộ phận bán hàng để nhận báo giá tốt hơn.");
                    return sb.toString();
                }
                return "Bạn muốn mua bao nhiêu sản phẩm?";
            }

            case REVIEW_QUERY -> {
                if (products == null || products.isEmpty())
                    return "Không tìm thấy sản phẩm để xem đánh giá.";
                StringBuilder sb = new StringBuilder();
                for (Product p : products) {
                    sb.append(String.format("- %s: %.1f⭐ (%d đánh giá)\n", p.getName(), p.getAverageRating(),
                            p.getTotalReviews()));
                }
                return sb.toString();
            }

            case PRODUCTS_COUNT -> {
                // Total active products
                long total = productRepository.countByStatus(Product.ProductStatus.ACTIVE);

                // Per-category counts
                List<Object[]> counts = productRepository.countActiveProductsPerCategory();

                // Sort categories by count desc
                counts.sort((a, b) -> Long.compare(((Number) b[1]).longValue(), ((Number) a[1]).longValue()));

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
                    semantic.forEach(doc -> context.append(doc.getText()).append("\n---\n"));
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
                            p.getSoldCount()));
                });
            }

            case BULK_ORDER -> {

                context.append("=== MUA SỐ LƯỢNG LỚN ===\n");
                context.append("- Liên hệ để nhận giá tốt hơn khi mua nhiều.\n");

                if (intent.getQuantity() != null) {

                    List<Product> available = productRepository
                            .findByStockQuantityGreaterThanEqual(intent.getQuantity());

                    context.append("\nSản phẩm đủ số lượng:\n");

                    available.forEach(p -> context.append(formatProduct(p)).append("\n"));
                }
            }

            case REVIEW_QUERY -> {

                context.append("=== ĐÁNH GIÁ ===\n");

                products.forEach(p -> context.append(String.format(
                        "- %s: %.1f⭐ (%d reviews)\n",
                        p.getName(),
                        p.getAverageRating(),
                        p.getTotalReviews())));
            }

            case PRICE_COMPARE -> {

                context.append("=== SO SÁNH GIÁ ===\n");

                products.forEach(p -> context.append(formatProduct(p)).append("\n"));
            }

            case DISCOUNT_POLICY -> {

                context.append("=== KHUYẾN MÃI ===\n");
                context.append("- Giá giảm hiển thị trực tiếp trên sản phẩm.\n");
                context.append("- Có thể có flash sale hoặc voucher theo thời điểm.\n");
            }

            case GENERAL_CHAT -> {

                List<Document> docs = embeddingService.searchSimilar(intent.getRawQuery());

                docs.forEach(d -> context.append(d.getText()).append("\n---\n"));
            }
        }

        return context.toString();
    }

    // ================= PRODUCT RETRIEVAL =================

    private java.util.List<Product> retrieveProducts(IntentResult intent) {
        String raw = intent.getRawQuery() == null ? "" : intent.getRawQuery().toLowerCase();

        // ─── Direct Brand Catch (Priority) ──────────────────────────────
        // If query mentions "có không" or is a general brand question, show all models
        boolean isExtremum = raw.contains("đắt nhất") || raw.contains("rẻ nhất") || raw.contains("cao nhất") || raw.contains("thấp nhất");
        boolean isGeneralListing = (raw.contains("có") && !isExtremum) || raw.contains("liệt kê") || raw.contains("danh sách") || raw.contains("tất cả");

        String brandToSearch = null;
        if (raw.contains("iphone")) brandToSearch = "iphone";
        else if (raw.contains("samsung")) brandToSearch = "samsung";
        else if (raw.contains("xiaomi")) brandToSearch = "xiaomi";
        else if (raw.contains("macbook")) brandToSearch = "macbook";
        else if (raw.contains("apple")) brandToSearch = "apple";

        if (brandToSearch != null && (isGeneralListing || !isExtremum)) {
            // Priority: Search by Category ID (Recursive) for the detected brand
            java.util.List<Product> brandProducts = searchStrictlyOrderedByPrice(null, brandToSearch,
                    intent.getMinPrice(), intent.getMaxPrice(), 10, true);
            if (!brandProducts.isEmpty()) return brandProducts;
        }

        // Handle explicit cheapest/most-expensive intents
        if (intent.getIntent() == IntentResult.IntentType.CHEAPEST_PRODUCT) {
            String kw = intent.getKeyword();
            String cat = intent.getCategory();
            if ((kw != null && !kw.isBlank()) || (cat != null && !cat.isBlank())) {
                java.util.List<Product> products = searchStrictlyOrderedByPrice(kw, cat, intent.getMinPrice(),
                        intent.getMaxPrice(), 1, true);
                if (!products.isEmpty())
                    return products;
            }
            // fallback: global cheapest
            Page<Product> page = productRepository.findCheapestProducts(PageRequest.of(0, 1));
            return page.getContent();
        }

        if (intent.getIntent() == IntentResult.IntentType.MOST_EXPENSIVE_PRODUCT) {
            String kw = intent.getKeyword();
            String cat = intent.getCategory();
            if ((kw != null && !kw.isBlank()) || (cat != null && !cat.isBlank())) {
                List<Product> products = searchStrictlyOrderedByPrice(kw, cat, intent.getMinPrice(),
                        intent.getMaxPrice(), 1, false);
                if (!products.isEmpty())
                    return products;
            }
            Page<Product> page = productRepository.findMostExpensiveProducts(PageRequest.of(0, 1));
            return page.getContent();
        }

        String keyword = intent.getKeyword();
        String categoryName = intent.getCategory();

        // Direct Brand Catch: If AI misses extraction, check raw query for major brands
        if (categoryName == null || categoryName.isBlank()) {
            if (raw.contains("iphone") || raw.contains("i phone")) {
                categoryName = "iphone";
                keyword = null; // Clear keyword to show all models
            } else if (raw.contains("samsung") || raw.contains("sam sung")) {
                categoryName = "samsung";
                keyword = null;
            } else if (raw.contains("xiaomi")) {
                categoryName = "xiaomi";
                keyword = null;
            } else if (raw.contains("apple")) {
                categoryName = "apple";
                keyword = null;
            } else if (raw.contains("macbook") || raw.contains("mac book")) {
                categoryName = "macbook";
                keyword = null;
            } else if (raw.contains("oppo")) {
                categoryName = "oppo";
                keyword = null;
            } else if (raw.contains("vivo")) {
                categoryName = "vivo";
                keyword = null;
            } else if (raw.contains("realme")) {
                categoryName = "realme";
                keyword = null;
            }
        }

        // Special fallback: if still no category but raw mentions "điện thoại", treat it as a broad group
        if (categoryName == null || categoryName.isBlank()) {
            if (raw.contains("điện thoại")) {
                categoryName = "điện thoại";
                keyword = null;
            }
        }

        // Apply strict search using category AND keyword AND price filters
        if ((categoryName != null && !categoryName.isBlank()) || (keyword != null && !keyword.isBlank())) {
            List<Product> products = searchStrictlyOrderedByPrice(keyword, categoryName, intent.getMinPrice(),
                    intent.getMaxPrice(), 20, true);
            if (!products.isEmpty())
                return products;

            // If strict search failed but we have a query, try semantic recovery for
            // suggestions
            List<Document> sim = embeddingService.searchSimilar(intent.getRawQuery());
            if (!sim.isEmpty()) {
                List<Long> ids = sim.stream()
                        .map(d -> ((Number) d.getMetadata().get("productId")).longValue())
                        .collect(Collectors.toList());
                return productRepository.findAllById(ids); // findAllById is fine but we should use a graph variant if possible. 
                // However, retrieveProducts returning suggestions is the goal.
            }
            return Collections.emptyList(); // Better to return nothing than wrong brand
        }

        // fallback price-only handling when no keyword or category
        if (intent.getMaxPrice() != null && intent.getMinPrice() != null) {
            return productRepository.findByEffectivePriceBetween(intent.getMinPrice(), intent.getMaxPrice())
                    .stream().limit(10).collect(Collectors.toList());
        }

        if (intent.getMinPrice() != null) {
            return productRepository.findByEffectivePriceGreaterThanEqual(intent.getMinPrice())
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

        return Collections.emptyList(); // Removed random products fallback
    }

    private List<Product> searchStrictlyOrderedByPrice(String keyword, String categoryName, BigDecimal minPrice,
                                                       BigDecimal maxPrice, int limit, boolean asc) {
        String k = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        boolean hasMin = minPrice != null;
        boolean hasMax = maxPrice != null;
        boolean hasBoth = hasMin && hasMax;

        org.springframework.data.domain.Sort sortDir = asc
                ? org.springframework.data.jpa.domain.JpaSort.unsafe(org.springframework.data.domain.Sort.Direction.ASC,
                "COALESCE(p.discountPrice, p.price)")
                : org.springframework.data.jpa.domain.JpaSort.unsafe(
                org.springframework.data.domain.Sort.Direction.DESC, "COALESCE(p.discountPrice, p.price)");
        PageRequest pageRequest = PageRequest.of(0, limit, sortDir);

        // ─── Resolve category name → list of category IDs ───────────────
        Set<Long> categoryIdsSet = new HashSet<>();
        if (categoryName != null && !categoryName.isBlank()) {
            String cat = categoryName.trim().toLowerCase();

            // Brand alias/variation mapping
            if (cat.contains("sam sung") || cat.equals("ss")) cat = "samsung";
            if (cat.contains("i phone")) cat = "iphone";
            if (cat.contains("mac book")) cat = "macbook";

            List<Category> matched = categoryRepository.findByNameEqualsOrContainingIgnoreCase(cat);

            // Double check by slug/normalized name if direct lookup fails
            if (matched.isEmpty()) {
                String normalized = cat.replaceAll("\\s+", "");
                matched = categoryRepository.findByNameEqualsOrContainingIgnoreCase(normalized);
            }

            for (Category c : matched) {
                collectAllCategoryIdsRecursive(c, categoryIdsSet);
            }
        }

        List<Long> categoryIds = new ArrayList<>(categoryIdsSet);


        // ─── Pick the right concrete query for every price combination ─────
        if (!categoryIds.isEmpty()) {
            if (k != null) {
                if (hasBoth) {
                    return productRepository
                            .findByCategoryIdsAndKeywordAndPriceRange(categoryIds, k, minPrice, maxPrice, pageRequest)
                            .getContent();
                } else if (hasMin) {
                    return productRepository
                            .findByCategoryIdsAndKeywordAndMinPrice(categoryIds, k, minPrice, pageRequest)
                            .getContent();
                } else if (hasMax) {
                    return productRepository
                            .findByCategoryIdsAndKeywordAndMaxPrice(categoryIds, k, maxPrice, pageRequest)
                            .getContent();
                } else {
                    return productRepository.findByCategoryIdsAndKeyword(categoryIds, k, pageRequest).getContent();
                }
            } else {
                if (hasBoth) {
                    return productRepository
                            .findByCategoryIdsAndPriceRange(categoryIds, minPrice, maxPrice, pageRequest)
                            .getContent();
                } else if (hasMin) {
                    return productRepository
                            .findByCategoryIdsAndMinPrice(categoryIds, minPrice, pageRequest)
                            .getContent();
                } else if (hasMax) {
                    return productRepository
                            .findByCategoryIdsAndMaxPrice(categoryIds, maxPrice, pageRequest)
                            .getContent();
                } else {
                    return productRepository.findByCategoryIds(categoryIds, pageRequest).getContent();
                }
            }
        } else if (k != null) {
            if (hasBoth) {
                return productRepository.findByKeywordAndPriceRange(k, minPrice, maxPrice, pageRequest).getContent();
            } else if (hasMin) {
                return productRepository.findByKeywordAndMinPrice(k, minPrice, pageRequest).getContent();
            } else if (hasMax) {
                return productRepository.findByKeywordAndMaxPrice(k, maxPrice, pageRequest).getContent();
            } else {
                return productRepository.findByKeyword(k, pageRequest).getContent();
            }
        }

        // Nothing to filter on – return empty (caller will do global fallback)
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
                p.getSoldCount());
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

    private void collectAllCategoryIdsRecursive(Category root, Set<Long> result) {
        if (root == null || result == null)
            return;
        result.add(root.getId());
        if (root.getChildren() != null) {
            for (Category child : root.getChildren()) {
                collectAllCategoryIdsRecursive(child, result);
            }
        }
    }
}
