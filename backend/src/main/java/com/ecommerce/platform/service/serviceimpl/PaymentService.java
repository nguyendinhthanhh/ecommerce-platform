package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.config.VnpayConfig;
import com.ecommerce.platform.dto.response.OrderResponse;
import com.ecommerce.platform.entity.Payment;
import   com.ecommerce.platform.util.VnpayUtil;
import com.ecommerce.platform.config.VnpayConfig;
import com.ecommerce.platform.entity.Payment;
import com.ecommerce.platform.util.VnpayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class PaymentService {
    @Autowired
    VnpayConfig vnpayConfig;
    @Autowired
    VnpayUtil vnpayUtil;
    @Autowired
    HttpServletRequest request;


    public String paymentUrl(Payment payment) {
        Map<String, String> params = vnpayConfig.getVNPayConfig();

        // Đổ mã đơn hàng ORD... vào tham số gửi sang VNPAY
        params.put("vnp_TxnRef", payment.getTransactionId());

        // Tính toán số tiền (Ví dụ: 1.130.000 -> 113.000.000)
        BigDecimal money = payment.getAmount().multiply(BigDecimal.valueOf(100));
        params.put("vnp_Amount", String.valueOf(money.longValue()));

        params.put("vnp_IpAddr", request.getRemoteAddr());
        // Lấy nội dung thanh toán từ đối tượng payment
        params.put("vnp_OrderInfo", "Thanh toan don hang: " + payment.getTransactionId());

        String query = vnpayUtil.dataToappendUrl(params);
        String hasdata = vnpayUtil.hmacSHA512(vnpayConfig.getSecretKey(), query);

        return vnpayConfig.getVnp_PayUrl() + query + "&vnp_SecureHash=" + hasdata;
    }

    public Boolean checkPayment() {


        Map<String, String> params = new HashMap<>();
        List<String> paymentUrls = Collections.list(request.getParameterNames());
        for (String paymentUrl : paymentUrls) {
            if (paymentUrl.startsWith("vnp_")) {
                params.put(paymentUrl, request.getParameter(paymentUrl));
            }
        }
        String hasdata = params.remove("vnp_SecureHash");
        String query = vnpayUtil.dataToappendUrl(params);
        String hasdataRequest = vnpayUtil.hmacSHA512(vnpayConfig.getSecretKey(), query);

        System.out.println(hasdata);
        System.out.println(hasdataRequest);
        if (hasdataRequest.equals(hasdata)) {
            return true;
        }
        return false;


    }


}