package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.EkycVerifyRequest;
import com.ecommerce.platform.dto.response.ApiResponse;
import com.ecommerce.platform.dto.response.ChatResponse;
import com.ecommerce.platform.dto.response.EkycVerifyResponse;
import com.ecommerce.platform.service.EkycService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/ekyc")
@RequiredArgsConstructor
public class EkycController {

    private final EkycService ekycService;

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<EkycVerifyResponse>> verify(@ModelAttribute EkycVerifyRequest request) {

        EkycVerifyResponse ekycResponse = ekycService.verify(request);

        return ResponseEntity.ok(
                ApiResponse.<EkycVerifyResponse>builder()
                        .success(true)
                        .code(200)
                        .message("Ekyc verification completed")
                        .data(ekycResponse)
                        .build()
        );
    }
}