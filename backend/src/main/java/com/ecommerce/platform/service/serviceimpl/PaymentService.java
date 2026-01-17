package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.config.VnpayConfig;
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

        BigDecimal money = payment.getAmount().multiply(BigDecimal.valueOf(100));

        String value = String.valueOf(money);
        String val[] = value.split("\\.");
        if (val.length == 2) {
            value =  val[0];
        }
        System.out.println(value);
        params.put("vnp_Amount", value);
        params.put("vnp_IpAddr", request.getRemoteAddr());
        params.put("vnp_OrderInfo",  payment.getContenPayment());
        String query = vnpayUtil.dataToappendUrl(params);
        String hasdata = vnpayUtil.hmacSHA512(vnpayConfig.getSecretKey(), query);

        String payurl = vnpayConfig.getVnp_PayUrl() + query + "&vnp_SecureHash=" + hasdata;

        return payurl;
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