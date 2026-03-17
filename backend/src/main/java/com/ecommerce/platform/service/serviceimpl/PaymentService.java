package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.config.VnpayConfig;
import com.ecommerce.platform.entity.Order;
import com.ecommerce.platform.entity.Payment;
import com.ecommerce.platform.repository.PaymentRepository;
import com.ecommerce.platform.util.VnpayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PaymentService {
    @Autowired
    VnpayConfig vnpayConfig;
    @Autowired
    VnpayUtil vnpayUtil;
    @Autowired
    HttpServletRequest request;
    @Autowired
    PaymentRepository paymentRepository;

    @Transactional
    public String createPaymentUrl(String orderCode) {
        // Support finding by orderCode safely with a lock
        Payment payment = paymentRepository.findByOrder_OrderCodeWithLock(orderCode)
                .orElseGet(() -> paymentRepository.findByTransactionIdWithLock(orderCode)
                        .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderCode)));

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Đơn hàng này đã được thanh toán.");
        }
        if (payment.getStatus() == Payment.PaymentStatus.PROCESSING) {
            throw new IllegalStateException(
                    "ConflictPaymentProcessing: Đang xử lý thanh toán cho đơn hàng này. Vui lòng kiểm tra email hoặc lịch sử đơn hàng của bạn.");
        }

        // Tạo mã giao dịch duy nhất cho VNPay bằng cách nối thêm timestamp
        String uniqueTxnRef = payment.getOrder().getOrderCode() + "_" + System.currentTimeMillis();
        payment.setTransactionId(uniqueTxnRef);
        payment.setStatus(Payment.PaymentStatus.PROCESSING);
        paymentRepository.save(payment);

        return paymentUrl(payment);
    }

    private String paymentUrl(Payment payment) {
        Map<String, String> params = vnpayConfig.getVNPayConfig();

        // Đổ mã đơn hàng duy nhất vào tham số gửi sang VNPAY
        params.put("vnp_TxnRef", payment.getTransactionId());

        // Tính toán số tiền (Ví dụ: 1.130.000 -> 113.000.000)
        BigDecimal money = payment.getAmount().multiply(BigDecimal.valueOf(100));
        params.put("vnp_Amount", String.valueOf(money.longValue()));

        params.put("vnp_IpAddr", request.getRemoteAddr());
        params.put("vnp_OrderInfo", "Thanh toan don hang: " + payment.getOrder().getOrderCode());

        String query = vnpayUtil.dataToappendUrl(params);
        String hasdata = vnpayUtil.hmacSHA512(vnpayConfig.getSecretKey(), query);

        return vnpayConfig.getVnp_PayUrl() + query + "&vnp_SecureHash=" + hasdata;
    }

    public Boolean checkSignature(Map<String, String> params) {
        String secureHash = params.remove("vnp_SecureHash");
        String query = vnpayUtil.dataToappendUrl(params);
        String expectedHash = vnpayUtil.hmacSHA512(vnpayConfig.getSecretKey(), query);
        return expectedHash.equals(secureHash);
    }

    @Transactional
    public boolean processCallback(String txnRef, String responseCode) {
        Payment payment = paymentRepository.findByTransactionIdWithLock(txnRef)
                .orElse(null);

        if (payment == null) {
            return false; // Not found
        }

        // Nếu đã hoàn tất trước đó thì bỏ qua (Idempotent)
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            return "00".equals(responseCode);
        }

        if ("00".equals(responseCode)) {
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());

            Order order = payment.getOrder();
            order.setStatus(Order.OrderStatus.PENDING);
            paymentRepository.save(payment);
            return true;
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return false;
        }
    }
}