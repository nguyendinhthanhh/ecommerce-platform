package com.ecommerce.platform.controller;


import com.ecommerce.platform.ai.service.serviceimpl.ChatService;
import com.ecommerce.platform.dto.request.ChatRequest;
import com.ecommerce.platform.dto.request.ChatResponse;
import com.ecommerce.platform.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Chatbot", description = "AI Chatbot API for e-commerce support")
public class ChatbotController {

    private final ChatService chatService;

    @PostMapping("/chat")
    @Operation(summary = "Send message to chatbot",
            description = "Process user query with AI intent classification and routing")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @Valid @RequestBody ChatRequest request) {

        try {


            ChatResponse chatResponse = chatService.chat(request);

            return ResponseEntity.ok(
                    ApiResponse.<ChatResponse>builder()
                            .code(200)
                            .message("Chatbot response received")
                            .data(chatResponse)
                            .build()
            );

        } catch (Exception e) {
            log.error("Error processing chat request", e);

            return ResponseEntity.internalServerError()
                    .body(
                            ApiResponse.<ChatResponse>builder()
                                    .code(500)
                                    .message("Đã xảy ra lỗi khi xử lý tin nhắn. Vui lòng thử lại.")
                                    .build()
                    );
        }
    }
}