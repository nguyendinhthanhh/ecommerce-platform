package com.ecommerce.platform.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderTimeReport {

    private Integer year;
    private Integer month;
    private Long total;
}

