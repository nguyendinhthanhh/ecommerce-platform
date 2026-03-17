package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.config.MomoConfig;
import com.ecommerce.platform.config.VnpayConfig;
import com.ecommerce.platform.entity.Order;
import com.ecommerce.platform.entity.Payment;
import com.ecommerce.platform.repository.PaymentRepository;
import com.ecommerce.platform.util.VnpayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class PaymentService {
    @Autowired VnpayConfig vnpayConfig;
    @Autowired MomoConfig momoConfig;
    @Autowired VnpayUtil vnpayUtil;
    @Autowired HttpServletRequest request;
    @Autowired PaymentRepository paymentRepository;
    @Autowired RestTemplate restTemplate;

    /**
     * Hàm chính: Tạo URL thanh toán dựa trên phương thức (VNPAY hoặc MOMO)
     */
    @Transactional
    public String createPaymentUrl(String orderCode, String method) {
        // 1. Tìm bản ghi Payment
        Payment payment = paymentRepository.findByOrder_OrderCodeWithLock(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán cho đơn hàng: " + orderCode));

        // 2. Kiểm tra trạng thái
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Đơn hàng này đã được thanh toán.");
        }

        // 3. Tạo TransactionId duy nhất (Tránh trùng lặp khi thanh toán lại)
        String uniqueTxnRef = payment.getOrder().getOrderCode() + "_" + System.currentTimeMillis();
        payment.setTransactionId(uniqueTxnRef);
        payment.setStatus(Payment.PaymentStatus.PROCESSING);
        paymentRepository.save(payment);

        // 4. Điều hướng theo phương thức thanh toán
        if ("MOMO".equalsIgnoreCase(method)) {
            return createMomoUrl(payment);
        }
        return createVnpayUrl(payment);
    }

    // ======================== LOGIC MOMO ========================

    private String createMomoUrl(Payment payment) {
        String orderId = payment.getTransactionId();
        String requestId = UUID.randomUUID().toString();
        long amount = payment.getAmount().longValue();
        String orderInfo = "Thanh toan don hang: " + payment.getOrder().getOrderCode();
        String extraData = "";

        // Tạo chuỗi ký tự theo thứ tự Alphabet (Bắt buộc đối với MoMo)
        String rawSignature = "accessKey=" + momoConfig.getAccessKey() +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + momoConfig.getIpnUrl() +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + momoConfig.getPartnerCode() +
                "&redirectUrl=" + momoConfig.getRedirectUrl() +
                "&requestId=" + requestId +
                "&requestType=" + momoConfig.getRequestType();

        String signature = vnpayUtil.hmacSHA256(momoConfig.getSecretKey(), rawSignature);

        // Tạo Body gửi lên MoMo API
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", momoConfig.getPartnerCode());
        body.put("accessKey", momoConfig.getAccessKey());
        body.put("requestId", requestId);
        body.put("amount", amount);
        body.put("orderId", orderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", momoConfig.getRedirectUrl());
        body.put("ipnUrl", momoConfig.getIpnUrl());
        body.put("extraData", extraData);
        body.put("requestType", momoConfig.getRequestType());
        body.put("signature", signature);
        body.put("lang", "vi");

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    momoConfig.getEndPoint() + "/create", body, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("payUrl")) {
                return response.getBody().get("payUrl").toString();
            }
            throw new RuntimeException("MoMo trả về lỗi: " + response.getBody().get("message"));
        } catch (Exception e) {
            log.error("Lỗi MoMo: ", e);
            throw new RuntimeException("Không thể tạo liên kết MoMo.");
        }
    }

    // ======================== LOGIC VNPAY ========================

    private String createVnpayUrl(Payment payment) {
        Map<String, String> params = vnpayConfig.getVNPayConfig();
        params.put("vnp_TxnRef", payment.getTransactionId());

        BigDecimal money = payment.getAmount().multiply(BigDecimal.valueOf(100));
        params.put("vnp_Amount", String.valueOf(money.longValue()));
        params.put("vnp_IpAddr", request.getRemoteAddr());
        params.put("vnp_OrderInfo", "Thanh toan don hang: " + payment.getOrder().getOrderCode());

        String query = vnpayUtil.dataToappendUrl(params);
        String hasdata = vnpayUtil.hmacSHA512(vnpayConfig.getSecretKey(), query);

        return vnpayConfig.getVnp_PayUrl() + query + "&vnp_SecureHash=" + hasdata;
    }

    // ======================== CALLBACK & SIGNATURE ========================

    public Boolean checkSignature(Map<String, String> params) {
        String secureHash = params.remove("vnp_SecureHash");
        String query = vnpayUtil.dataToappendUrl(params);
        String expectedHash = vnpayUtil.hmacSHA512(vnpayConfig.getSecretKey(), query);
        return expectedHash.equals(secureHash);
    }

    @Transactional
    public boolean processCallback(String txnRef, String responseCode) {
        Payment payment = paymentRepository.findByTransactionIdWithLock(txnRef).orElse(null);
        if (payment == null) return false;

        // Idempotent: Nếu đã thành công trước đó thì trả về true luôn
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            return true;
        }

        // Kiểm tra mã thành công (00 của VNPay hoặc 0 của MoMo)
        if ("00".equals(responseCode) || "0".equals(responseCode)) {
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());

            Order order = payment.getOrder();
            order.setStatus(Order.OrderStatus.PENDING); // Đơn hàng chuyển sang chờ xử lý

            paymentRepository.save(payment);
            return true;
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return false;
        }
    }
}