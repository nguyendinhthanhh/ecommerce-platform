package com.ecommerce.platform.ai.service.serviceimpl;

import com.ecommerce.platform.dto.request.IntentResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntentClassifierService {

    private final ChatClient.Builder chatClientBuilder;
    private final ObjectMapper objectMapper;

    private static final String INTENT_PROMPT = """
            Bạn là AI phân loại intent cho hệ thống thương mại điện tử.
            Phân tích câu hỏi của người dùng và trả về JSON với cấu trúc sau:

            {
              "intent": "PRODUCT_SEARCH | STOCK_CHECK | BULK_ORDER | PRICE_COMPARE | REVIEW_QUERY | DISCOUNT_POLICY | GENERAL_CHAT | CHEAPEST_PRODUCT | MOST_EXPENSIVE_PRODUCT | PRODUCTS_COUNT",
              "maxPrice": số tiền tối đa (VNĐ),
              "minPrice": số tiền tối thiểu (VNĐ),
              "category": tên thương hiệu hoặc danh mục sản phẩm (ví dụ: "Samsung", "Apple", "iPhone", "laptop"),
              "keyword": từ khóa chi tiết sản phẩm (tên cụ thể, màu sắc, model, v.v.),
              "quantity": số lượng,
              "rating": số sao
            }

            Phân biệt "category" và "keyword":
            - "category": là thương hiệu (Samsung, Apple, LG...) hoặc danh mục rộng (điện thoại, laptop, tai nghe).
            - "keyword": là chi tiết cụ thể hơn như tên model, màu sắc (Galaxy S24, 512GB), KHÔNG bao gồm tên thương hiệu hay danh mục.
            - Nếu người dùng chỉ hỏi "điện thoại Samsung" thì category = "Samsung", keyword = "điện thoại".
            - Nếu người dùng hỏi "Samsung Galaxy S24" thì category = "Samsung", keyword = "Galaxy S24".

            Hướng dẫn trích xuất "keyword":
            - Nếu người dùng mô tả sản phẩm (ví dụ: "điện thoại chụp ảnh đẹp"), hãy rút gọn thành từ khóa chính xác như "điện thoại chụp ảnh".
            - Nhận diện danh mục sản phẩm (ví dụ: "laptop", "tai nghe", "chuột", "bàn phím", "điện thoại", "đồng hồ").
            - Loại bỏ các từ thừa như "tôi muốn tìm", "cho tôi hỏi", "bạn có".

            Quy tắc xác định intent:
            - PRODUCT_SEARCH: tìm kiếm hoặc gợi ý sản phẩm, lọc theo giá, danh mục hoặc thương hiệu
            - STOCK_CHECK: hỏi sản phẩm còn hàng hay không
            - BULK_ORDER: mua số lượng lớn
            - PRICE_COMPARE: so sánh giá giữa các sản phẩm
            - REVIEW_QUERY: hỏi về đánh giá, số sao
            - DISCOUNT_POLICY: hỏi về khuyến mãi, giảm giá
            - PRODUCT_SEARCH: tìm kiếm sản phẩm, liệt kê danh sách sản phẩm, hoặc khi người dùng hỏi chung chung (ví dụ: "có iphone nào không", "liệt kê tất cả samsung")
            - STOCK_CHECK: chỉ dùng khi người dùng hỏi cụ thể về tình trạng còn hàng hoặc số lượng trong kho (ví dụ: "còn hàng không", "số lượng bao nhiêu")
            - GENERAL_CHAT: các câu hỏi chào hỏi hoặc không liên quan trực tiếp đến tra cứu sản phẩm

            Quy tắc trích xuất giá:
            - Nếu người dùng nói "dưới 10 triệu" → maxPrice = 10000000
            - Nếu người dùng nói "trên 5 triệu" → minPrice = 5000000
            - Nếu người dùng nói "từ 5 đến 10 triệu" → minPrice = 5000000 và maxPrice = 10000000

            Quy tắc quan trọng:
            - maxPrice và minPrice phải là số nguyên VNĐ (không có dấu phẩy, dấu chấm, hoặc chữ như "triệu").
            - Nếu không có giá thì đặt giá trị là null.
            - Nếu không xác định được category thì đặt là null.

            Ví dụ đúng:
            {
              "intent": "MOST_EXPENSIVE_PRODUCT",
              "maxPrice": null,
              "minPrice": null,
              "category": "Samsung",
              "keyword": "điện thoại",
              "quantity": null,
              "rating": null
            }

            Chỉ trả về JSON hợp lệ. Không viết thêm giải thích hoặc văn bản khác.

            Câu hỏi của người dùng: %s
            """;

    public IntentResult classify(String userMessage) {
        log.info("Classifying intent: {}", userMessage);

        try {
            // Quick heuristics
            String lower = userMessage == null ? "" : userMessage.toLowerCase();

            // cheapest / most expensive
            if (lower.contains("rẻ nhất") || lower.contains("giá thấp nhất") || lower.contains("giá rẻ nhất")) {
                String[] extracted = extractKeywordAndCategoryForExtremum(lower, "rẻ nhất");
                return IntentResult.builder()
                        .intent(IntentResult.IntentType.CHEAPEST_PRODUCT)
                        .rawQuery(userMessage)
                        .keyword(extracted[0])
                        .category(extracted[1])
                        .build();
            }

            if (lower.contains("đắt nhất") || lower.contains("giá cao nhất") || lower.contains("giá đắt nhất")) {
                String[] extracted = extractKeywordAndCategoryForExtremum(lower, "đắt nhất");
                return IntentResult.builder()
                        .intent(IntentResult.IntentType.MOST_EXPENSIVE_PRODUCT)
                        .rawQuery(userMessage)
                        .keyword(extracted[0])
                        .category(extracted[1])
                        .build();
            }

            // products count / statistics
            if (lower.contains("có bao nhiêu sản phẩm") || lower.contains("tổng cộng bao nhiêu sản phẩm")
                    || lower.contains("trong cửa hàng có bao nhiêu") || lower.matches(".*\bbao nhiêu\b.*sản phẩm.*")) {
                return IntentResult.builder()
                        .intent(IntentResult.IntentType.PRODUCTS_COUNT)
                        .rawQuery(userMessage)
                        .build();
            }

            ChatClient chatClient = chatClientBuilder.build();

            String response = chatClient.prompt()
                    .user(String.format(INTENT_PROMPT, userMessage))
                    .call()
                    .content();

            return parse(response, userMessage);

        } catch (Exception e) {
            log.error("Intent classification failed", e);
            return fallback(userMessage);
        }
    }

    // Known brands (exact match). When detected, category = brand, keyword = null.
    private static final java.util.List<String> KNOWN_BRANDS = java.util.Arrays.asList(
            "samsung", "apple", "iphone", "xiaomi", "oppo", "vivo", "realme", "nokia", "lg",
            "sony", "dell", "hp", "lenovo", "asus", "acer", "msi", "macbook", "huawei",
            "beats", "bose", "jbl", "logitech", "razer", "corsair");

    // Generic parent-category words - not meaningful as keyword when brand is
    // present
    private static final java.util.List<String> GENERIC_CATEGORY_WORDS = java.util.Arrays.asList(
            "điện thoại", "laptop", "máy tính", "tai nghe", "đồng hồ",
            "bàn phím", "chuột", "màn hình", "sạc", "ốp lưng", "loa", "thiết bị");

    // Capitalise first letter to match DB category names (e.g. samsung -> Samsung)
    private static String capitalise(String s) {
        if (s == null || s.isEmpty())
            return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    /**
     * Extracts [keyword, category] from a query before the extremum token.
     * When a brand is detected, category = brand (capitalised), keyword = null.
     * Remaining non-brand text is only returned as keyword if it is NOT a generic
     * category word.
     * Returns String[2]: index 0 = keyword (nullable), index 1 = category
     * (nullable)
     */
    private String[] extractKeywordAndCategoryForExtremum(String lower, String token) {
        int idx = lower.indexOf(token);
        String before = idx > 0 ? lower.substring(0, idx).trim() : lower.trim();
        before = before.replaceAll("\\b(nào|cái|có|giá|bạn|cho tôi|ơi|hỏi|muốn)\\b", " ").trim();
        before = before.replaceAll("\\s{2,}", " ").trim();

        String detectedBrand = null;
        for (String brand : KNOWN_BRANDS) {
            if (before.contains(brand)) {
                detectedBrand = capitalise(brand); // Samsung, Apple...
                before = before.replace(brand, "").trim();
                break;
            }
        }

        // If a brand was found, we set keyword = null to avoid over-filtering.
        // For example, "Samsung điện thoại" -> category="Samsung", keyword=null.
        // This ensures the query doesn't fail if the product name doesn't contain the word "điện thoại".
        String keyword = null;
        if (detectedBrand != null) {
            keyword = null;
        } else if (!before.isEmpty()) {
            keyword = before.trim();
        }

        return new String[] { keyword, detectedBrand };
    }

    private String extractKeywordForExtremum(String lower, String token) {
        return extractKeywordAndCategoryForExtremum(lower, token)[0];
    }

    private IntentResult parse(String response, String query) {
        try {
            String clean = cleanJson(response);
            JsonNode node = objectMapper.readTree(clean);

            IntentResult.IntentResultBuilder builder = IntentResult.builder()
                    .rawQuery(query);

            String intent = node.has("intent") ? node.get("intent").asText() : "GENERAL_CHAT";
            IntentResult.IntentType intentType = IntentResult.IntentType.valueOf(intent);
            builder.intent(intentType);

            BigDecimal max = parsePriceNode(node, "maxPrice");
            if (max != null) {
                builder.maxPrice(max);
            }

            BigDecimal min = parsePriceNode(node, "minPrice");
            if (min != null) {
                builder.minPrice(min);
            }

            if (node.has("keyword") && !node.get("keyword").isNull()) {
                builder.keyword(node.get("keyword").asText());
            }

            if (node.has("category") && !node.get("category").isNull()) {
                String cat = node.get("category").asText().trim();
                if (!cat.isEmpty() && !cat.equalsIgnoreCase("null")) {
                    builder.category(cat);
                    // If we have a category, we should avoid redundant keywords like "điện thoại"
                    // set keyword to null to allow broader name matching
                    builder.keyword(null);
                }
            }

            if (node.has("quantity") && !node.get("quantity").isNull()) {
                builder.quantity(node.get("quantity").asInt());
            }

            if (node.has("rating") && !node.get("rating").isNull()) {
                builder.rating(node.get("rating").asDouble());
            }

            IntentResult result = builder.build();

            if (result.getIntent() == IntentResult.IntentType.GENERAL_CHAT) {
                boolean hasPriceFilter = result.getMaxPrice() != null || result.getMinPrice() != null;
                boolean hasKeyword = result.getKeyword() != null && !result.getKeyword().isBlank();
                boolean hasQtyOrRating = result.getQuantity() != null || result.getRating() != null;
                if (hasPriceFilter || hasKeyword || hasQtyOrRating) {
                    result.setIntent(IntentResult.IntentType.PRODUCT_SEARCH);
                }
            }

            return result;

        } catch (Exception e) {
            log.error("Parse error: {}", response, e);
            return fallback(query);
        }
    }

    private BigDecimal parsePriceNode(JsonNode node, String field) {
        try {
            if (!node.has(field) || node.get(field).isNull())
                return null;
            JsonNode n = node.get(field);
            if (n.isNumber()) {
                return new BigDecimal(n.asText());
            }
            String s = n.asText().trim().toLowerCase();
            if (s.isEmpty() || s.equals("null"))
                return null;

            if (s.contains("triệu") || s.contains("tr")) {
                String num = s.replaceAll("[^0-9.,]", "").replace(',', '.');
                if (num.isEmpty())
                    return null;
                if (num.contains(".")) {
                    num = num.substring(0, num.indexOf('.'));
                }
                BigDecimal v = new BigDecimal(num);
                return v.multiply(new BigDecimal(1_000_000));
            }

            String digits = s.replaceAll("[^0-9]", "");
            if (digits.isEmpty())
                return null;
            return new BigDecimal(digits);

        } catch (Exception e) {
            log.warn("Failed to parse price field {} from node {}", field, node.get(field).toString());
            return null;
        }
    }

    private String cleanJson(String response) {
        String clean = response.trim();
        clean = clean.replace("```json", "")
                .replace("```", "")
                .trim();
        return clean;
    }

    private IntentResult fallback(String query) {
        return IntentResult.builder()
                .intent(IntentResult.IntentType.GENERAL_CHAT)
                .rawQuery(query)
                .build();
    }
}
