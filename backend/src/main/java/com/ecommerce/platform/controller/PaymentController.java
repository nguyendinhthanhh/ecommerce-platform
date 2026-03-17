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

    @PostMapping("/vn_pay")
    public ResponseEntity<?> vnpay(@RequestParam String orderCode) {
        try {
            String url = paymentService.createPaymentUrl(orderCode);
            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", url);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/vn-pay-callback")
    public ResponseEntity<?> Callback(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            if (paramName.startsWith("vnp_")) {
                params.put(paramName, request.getParameter(paramName));
            }
        }

        if (paymentService.checkSignature(params)) {
            String responseCode = request.getParameter("vnp_ResponseCode");
            String txnRef = request.getParameter("vnp_TxnRef");

            boolean success = paymentService.processCallback(txnRef, responseCode);

            // Lấy orderCode ban đầu từ txnRef (mẫu: ORD123_1700...) nếu cần thiết
            String orderCode = txnRef.contains("_") ? txnRef.split("_")[0] : txnRef;

            String statusStr = success ? "success" : "failed";
            String frontendUrl = "http://localhost:5173/payment-result?orderCode=" + orderCode + "&status=" + statusStr;

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendUrl)
                    .build();
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Chữ ký VNPay không hợp lệ hoặc dữ liệu bị giả mạo!");
    }
}
