package com.ecommerce.platform.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Data
public class MomoConfig {
    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.end-point}")
    private String endPoint;

    @Value("${momo.return-url}")
    private String redirectUrl;

    @Value("${momo.request-type}")
    private String requestType;

    @Value("${momo.return-url}")
    private String ipnUrl;
}