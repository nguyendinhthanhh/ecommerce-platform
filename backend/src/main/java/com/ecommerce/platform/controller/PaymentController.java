package com.ecommerce.platform.controller;

import com.ecommerce.platform.entity.Order;
import com.ecommerce.platform.entity.Payment;
import com.ecommerce.platform.repository.PaymentRepository;
import com.ecommerce.platform.service.serviceimpl.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("api/payment")
@Tag(name = "Payment", description = "Payment management APIs")
public class PaymentController {
    @Autowired
    PaymentService paymentService;
    @Autowired
    PaymentRepository paymentRepository;

    @PostMapping("/vn_pay")
    public ResponseEntity<?> vnpay(@RequestParam String orderCode) {
        return paymentRepository.findByTransactionId(orderCode)
                .map(payment -> {
                    String url = paymentService.paymentUrl(payment);
                    // Trả về JSON chứa URL
                    Map<String, String> response = new HashMap<>();
                    response.put("paymentUrl", url);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/vn-pay-callback")
    public ResponseEntity<?> Callback(HttpServletRequest request) {
        // 1. Kiểm tra chữ ký bảo mật từ VNPay
        if (paymentService.checkPayment()) {
            String responseCode = request.getParameter("vnp_ResponseCode");
            String txnRef = request.getParameter("vnp_TxnRef"); // Đây là orderCode

            // 2. Nếu thanh toán thành công (Mã 00)
            if ("00".equals(responseCode)) {
                Payment payment = paymentRepository.findByTransactionId(txnRef)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn: " + txnRef));

                // Cập nhật trạng thái Payment
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                payment.setPaidAt(LocalDateTime.now());

                // Cập nhật trạng thái Order liên kết sang PLACED (chờ nhân viên xác nhận)
                Order order = payment.getOrder();
                order.setStatus(Order.OrderStatus.PLACED);
                // order.setConfirmedAt(LocalDateTime.now()); // Không set confirmed ở đây

                paymentRepository.save(payment);

                // Redirect về frontend
                String frontendUrl = "http://localhost:5173/payment-result?orderCode=" + txnRef + "&status=success";
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", frontendUrl)
                        .build();
            } else {
                // Thanh toán không thành công
                String frontendUrl = "http://localhost:5173/payment-result?orderCode=" + txnRef
                        + "&status=failed&message=" + responseCode;
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", frontendUrl)
                        .build();
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Chữ ký VNPay không hợp lệ hoặc dữ liệu bị giả mạo!");
    }
}
