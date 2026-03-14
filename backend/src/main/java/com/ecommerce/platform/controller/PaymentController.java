package com.ecommerce.platform.controller;

import com.ecommerce.platform.service.serviceimpl.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/payment")
@Tag(name = "Payment", description = "Payment management APIs")
public class PaymentController {
    @Autowired
    PaymentService paymentService;

    // SỬA LỖI: Thêm param 'method' để phân biệt VNPAY/MOMO
    @PostMapping("/create_url")
    public ResponseEntity<?> createUrl(@RequestParam String orderCode, @RequestParam String method) {
        try {
            // Gọi hàm mới có 2 tham số
            String url = paymentService.createPaymentUrl(orderCode, method);
            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", url);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // VNPay Callback (Giữ nguyên logic của bạn)
    @GetMapping("/vn-pay-callback")
    public ResponseEntity<?> vnpayCallback(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            params.put(paramName, request.getParameter(paramName));
        }

        if (paymentService.checkSignature(params)) {
            String responseCode = request.getParameter("vnp_ResponseCode");
            String txnRef = request.getParameter("vnp_TxnRef");
            boolean success = paymentService.processCallback(txnRef, responseCode);

            return redirectResult(txnRef, success);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Chữ ký VNPay không hợp lệ!");
    }

    // THÊM MỚI: MoMo Callback (Dựa trên return-url trong yaml của bạn)
    @GetMapping("/momo-callback")
    public ResponseEntity<?> momoCallback(@RequestParam Map<String, String> allParams) {
        String resultCode = allParams.get("resultCode");
        String txnRef = allParams.get("orderId");
        boolean success = paymentService.processCallback(txnRef, "0".equals(resultCode) ? "00" : "99");

        return redirectResult(txnRef, success);
    }

    // Hàm phụ để redirect về Frontend
    private ResponseEntity<?> redirectResult(String txnRef, boolean success) {
        String orderCode = txnRef.contains("_") ? txnRef.split("_")[0] : txnRef;
        String statusStr = success ? "success" : "failed";
        String frontendUrl = "http://localhost:5173/payment-result?orderCode=" + orderCode + "&status=" + statusStr;

        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", frontendUrl)
                .build();
    }
}