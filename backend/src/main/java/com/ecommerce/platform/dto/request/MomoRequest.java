package com.ecommerce.platform.dto.request;

import lombok.Data;

@Data
public class MomoRequest {
    private String partnerCode;
    private String accessKey;
    private String requestId;
    private String orderId;
    private Long amount;
    private String orderInfo;
    private String redirectUrl;
    private String ipnUrl;
    private String requestType;
    private String extraData;
    private String signature;
}

