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
            Bạn là AI phân loại intent cho hệ thống ecommerce.
            Phân tích câu hỏi và trả về JSON:

            {
              "intent": "PRODUCT_SEARCH | STOCK_CHECK | BULK_ORDER | PRICE_COMPARE | REVIEW_QUERY | DISCOUNT_POLICY | GENERAL_CHAT",
              "maxPrice": số tiền tối đa (VNĐ),
              "minPrice": số tiền tối thiểu (VNĐ),
              "keyword": từ khóa sản phẩm (bao gồm thương hiệu, danh mục, tên sản phẩm hoặc tính năng),
              "quantity": số lượng (nếu có),
              "rating": số sao mong muốn (nếu có)
            }

            Mẹo trích xuất "keyword" thông minh:
            - Nếu người dùng mô tả (vd: "điện thoại chụp ảnh đẹp"), rút gọn thành các từ khóa chính xác như "điện thoại chụp ảnh".
            - Nhận diện danh mục (vd: "laptop", "tai nghe", "chuột", "bàn phím").
            - Bỏ các từ thừa như "tôi muốn tìm", "cho tôi hỏi".

            Quy tắc:
            - PRODUCT_SEARCH: tìm sản phẩm, gợi ý, lọc theo giá/danh mục
            - STOCK_CHECK: còn hàng không, tồn kho
            - BULK_ORDER: mua số lượng lớn
            - PRICE_COMPARE: so sánh giá
            - REVIEW_QUERY: hỏi đánh giá, rating
            - DISCOUNT_POLICY: khuyến mãi
            - GENERAL_CHAT: còn lại

            Chỉ trả JSON. Không sinh text bổ sung.

            Câu hỏi: %s
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
            builder.intent(IntentResult.IntentType.valueOf(intent));

            // price filters
            if (node.has("maxPrice") && !node.get("maxPrice").isNull()) {
                builder.maxPrice(new BigDecimal(node.get("maxPrice").asText()));
            }

            if (node.has("minPrice") && !node.get("minPrice").isNull()) {
                builder.minPrice(new BigDecimal(node.get("minPrice").asText()));
            }

            // keyword
            if (node.has("keyword")) {
                builder.keyword(node.get("keyword").asText());
            }

            // quantity
            if (node.has("quantity")) {
                builder.quantity(node.get("quantity").asInt());
            }

            // rating filter
            if (node.has("rating")) {
                builder.rating(node.get("rating").asDouble());
            }

            return builder.build();

        } catch (Exception e) {
            log.error("Parse error: {}", response, e);
            return fallback(query);
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