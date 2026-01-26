package com.ecommerce.platform.util;

import org.apache.hc.client5.http.utils.Hex;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class VnpayUtil {
    public static String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Hex.encodeHexString(result);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi mã hóa HMAC SHA512", e);
        }
    }


    public String dataToappendUrl(Map<String, String> params) {
        StringBuilder query = new StringBuilder();

        List<String> filekey = new ArrayList<>(params.keySet());
        Collections.sort(filekey);

        for (String key : filekey) {
            String value = params.get(key);
            if (value != null && value.length() > 0) {

                query.append(key).append("=").append(URLEncoder.encode(params.get(key), StandardCharsets.US_ASCII)).append("&");
            }
        }
        query.deleteCharAt(query.length() - 1);
        return query.toString();

    }
}