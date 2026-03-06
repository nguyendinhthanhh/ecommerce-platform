package com.ecommerce.platform.dto.response;


import com.ecommerce.platform.dto.request.ProductSuggestionRequest;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ChatResponse {
    private boolean success;
    private String message;
    private List<ProductSuggestionRequest> suggestedProducts;
    private long responseTime;
    private String error;



    public static ChatResponse success(String message, List<ProductSuggestionRequest> products, long time) {
        return ChatResponse.builder()
                .success(true)
                .message(message)
                .suggestedProducts(products)
                .responseTime(time)
                .build();
    }

    public static ChatResponse error(String error) {
        return ChatResponse.builder()
                .success(false)
                .error(error)
                .build();
    }
}