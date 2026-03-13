package com.ecommerce.platform.ai.service.serviceimpl;

import com.ecommerce.platform.dto.request.IntentResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

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
              "intent": "PRODUCT_SEARCH | STOCK_CHECK | BULK_ORDER | PRICE_COMPARE | REVIEW_QUERY | DISCOUNT_POLICY | GENERAL_CHAT",
              "maxPrice": số tiền tối đa (VNĐ),
              "minPrice": số tiền tối thiểu (VNĐ),
              "keyword": từ khóa sản phẩm,
              "quantity": số lượng,
              "rating": số sao
            }
            
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
            - GENERAL_CHAT: các câu hỏi chung không liên quan trực tiếp đến sản phẩm
            
            Quy tắc trích xuất giá:
            - Nếu người dùng nói "dưới 10 triệu" → maxPrice = 10000000
            - Nếu người dùng nói "trên 5 triệu" → minPrice = 5000000
            - Nếu người dùng nói "từ 5 đến 10 triệu" → minPrice = 5000000 và maxPrice = 10000000
            
            Quy tắc quan trọng:
            - maxPrice và minPrice phải là số nguyên VNĐ (không có dấu phẩy, dấu chấm, hoặc chữ như "triệu").
            - Nếu không có giá thì đặt giá trị là null.
            
            Ví dụ đúng:
            {
              "intent": "PRODUCT_SEARCH",
              "maxPrice": 10000000,
              "minPrice": null,
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

    private IntentResult parse(String response, String query) {
        try {
            String clean = cleanJson(response);
            JsonNode node = objectMapper.readTree(clean);

            IntentResult.IntentResultBuilder builder = IntentResult.builder()
                    .rawQuery(query);

            // intent
            String intent = node.has("intent") ? node.get("intent").asText() : "GENERAL_CHAT";
            IntentResult.IntentType intentType = IntentResult.IntentType.valueOf(intent);
            builder.intent(intentType);

            // price filters
            BigDecimal max = parsePriceNode(node, "maxPrice");
            if (max != null) {
                builder.maxPrice(max);
            }

            BigDecimal min = parsePriceNode(node, "minPrice");
            if (min != null) {
                builder.minPrice(min);
            }

            // keyword
            if (node.has("keyword") && !node.get("keyword").isNull()) {
                builder.keyword(node.get("keyword").asText());
            }

            // quantity
            if (node.has("quantity") && !node.get("quantity").isNull()) {
                builder.quantity(node.get("quantity").asInt());
            }

            // rating filter
            if (node.has("rating") && !node.get("rating").isNull()) {
                builder.rating(node.get("rating").asDouble());
            }

            IntentResult result = builder.build();

            // If LLM returned GENERAL_CHAT but there are clear product search signals, coerce to PRODUCT_SEARCH
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
            if (!node.has(field) || node.get(field).isNull()) return null;
            JsonNode n = node.get(field);
            if (n.isNumber()) {
                return new BigDecimal(n.asText());
            }
            String s = n.asText().trim().toLowerCase();
            if (s.isEmpty() || s.equals("null")) return null;

            // handle phrases like "10 triệu", "10tr", "10.000.000", "10,000,000"
            if (s.contains("triệu") || s.contains("tr")) {
                // extract leading number
                String num = s.replaceAll("[^0-9\\.,]", "").replace(',', '.');
                if (num.isEmpty()) return null;
                // take number before dot if multiple
                if (num.contains(".")) {
                    num = num.substring(0, num.indexOf('.'));
                }
                BigDecimal v = new BigDecimal(num);
                return v.multiply(new BigDecimal(1_000_000));
            }

            // remove any non-digit characters
            String digits = s.replaceAll("[^0-9]", "");
            if (digits.isEmpty()) return null;
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