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
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j // Cần thiết để sử dụng log.info
public class PaymentService {
    @Autowired
    VnpayConfig vnpayConfig;
    @Autowired
    VnpayUtil vnpayUtil;
    @Autowired
    HttpServletRequest request;
    @Autowired
    PaymentRepository paymentRepository;
    @Autowired
    MomoConfig momoConfig;
    @Autowired
    RestTemplate restTemplate; // Phải Autowired cái này

    @Transactional
    public String createPaymentUrl(String orderCode, String method) {
        Payment payment = paymentRepository.findByOrder_OrderCodeWithLock(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán cho đơn hàng: " + orderCode));

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Đơn hàng này đã được thanh toán.");
        }

        // Tạo mã giao dịch duy nhất
        String uniqueTxnRef = payment.getOrder().getOrderCode() + "_" + System.currentTimeMillis();
        payment.setTransactionId(uniqueTxnRef);
        payment.setStatus(Payment.PaymentStatus.PROCESSING);
        paymentRepository.save(payment);

        if ("MOMO".equalsIgnoreCase(method)) {
            return createMomoUrl(payment);
        }
        return createVnpayUrl(payment);
    }

    private String createMomoUrl(Payment payment) {
        String orderId = payment.getTransactionId();
        String requestId = UUID.randomUUID().toString();
        String extraData = "";
        long amount = payment.getAmount().longValue();
        String orderInfo = "Thanh toan don hang: " + payment.getOrder().getOrderCode();

        // 1. Tạo chuỗi Raw Signature (Thứ tự alphabet cực kỳ quan trọng với MoMo)
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

        log.info("Momo Raw Signature: {}", rawSignature);
        String signature = vnpayUtil.hmacSHA256(momoConfig.getSecretKey(), rawSignature);

        // 2. Tạo Body Request
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("partnerCode", momoConfig.getPartnerCode());
        requestBody.put("accessKey", momoConfig.getAccessKey());
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("orderId", orderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", momoConfig.getRedirectUrl());
        requestBody.put("ipnUrl", momoConfig.getIpnUrl());
        requestBody.put("extraData", extraData);
        requestBody.put("requestType", momoConfig.getRequestType());
        requestBody.put("signature", signature);
        requestBody.put("lang", "vi");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    momoConfig.getEndPoint() + "/create", entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("payUrl")) {
                return response.getBody().get("payUrl").toString();
            } else {
                throw new RuntimeException("MoMo error: " + response.getBody().get("message"));
            }
        } catch (Exception e) {
            log.error("Lỗi kết nối MoMo: ", e);
            throw new RuntimeException("Không thể kết nối đến MoMo: " + e.getMessage());
        }
    }

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
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) return "00".equals(responseCode);

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