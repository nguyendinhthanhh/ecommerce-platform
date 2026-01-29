package com.ecommerce.platform.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productThumbnail;
    private Long orderId;
    private String orderCode;
    private CustomerInfo customer;
    private Integer rating;
    private String comment;
    private List<String> images;
    private String status;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerInfo {
        private Long id;
        private String fullName;
        private String avatar;
    }
}

