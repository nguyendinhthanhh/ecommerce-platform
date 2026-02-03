package com.ecommerce.platform.dto.request;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RevenueReport {
    private String label;
    private BigDecimal revenue;
}
