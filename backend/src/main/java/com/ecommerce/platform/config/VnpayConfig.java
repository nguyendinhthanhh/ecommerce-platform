package com.ecommerce.platform.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.text.SimpleDateFormat;
import java.util.*;

@Configuration
@Data
public class VnpayConfig {
    @Value("${payment.vnPay.url}")
    private String vnp_PayUrl;
    @Value("${payment.vnPay.returnUrl}")
    private String vnp_ReturnUrl;
    @Value("${payment.vnPay.tmnCode}")
    private String vnp_TmnCode;
    @Value("${payment.vnPay.secretKey}")
    private String secretKey;
    @Value("${payment.vnPay.version}")
    private String vnp_Version;
    @Value("${payment.vnPay.command}")
    private String vnp_Command;
    @Value("${payment.vnPay.orderType}")
    private String orderType;

    public Map<String, String> getVNPayConfig() {
        // tạo id cho giao dịch lấy số s từ 1970 và luôn tăng nên nó sẽ không trùng
        String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
        Map<String, String> vnParamsMap = new HashMap<>();
        vnParamsMap.put("vnp_Version", vnp_Version);
        vnParamsMap.put("vnp_Command", vnp_Command);
        vnParamsMap.put("vnp_TmnCode", vnp_TmnCode);
        vnParamsMap.put("vnp_CurrCode", "VND");
        vnParamsMap.put("vnp_TxnRef", vnp_TxnRef);

        vnParamsMap.put("vnp_OrderType", orderType);
        vnParamsMap.put("vnp_Locale", "vn");
        vnParamsMap.put("vnp_ReturnUrl", vnp_ReturnUrl);
        // lấy mũi giờ việt nam
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = sdf.format(calendar.getTime());
        vnParamsMap.put("vnp_CreateDate", vnpCreateDate);
        calendar.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = sdf.format(calendar.getTime());
        vnParamsMap.put("vnp_ExpireDate", vnp_ExpireDate);
        return vnParamsMap;
    }
}
