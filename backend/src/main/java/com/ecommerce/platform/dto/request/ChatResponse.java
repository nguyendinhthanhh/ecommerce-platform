package com.ecommerce.platform.dto.request;


import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ChatResponse {

    private String reply;
    private Long responseTimeMs;
    private Instant timestamp;


    public static ChatResponse success(String reply, long timeMs) {
        return ChatResponse.builder()
                .reply(reply)
                .responseTimeMs(timeMs)
                .timestamp(Instant.now())
                .build();
    }

    public static ChatResponse error(String message) {
        return ChatResponse.builder()
                .reply("Lỗi: " + message)
                .responseTimeMs(0L)
                .timestamp(Instant.now())
                .build();
    }
}