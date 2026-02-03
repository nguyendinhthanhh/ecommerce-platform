package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.OrderStatusReport;
import com.ecommerce.platform.dto.request.OrderTimeReport;
import com.ecommerce.platform.dto.request.RevenueReport;
import com.ecommerce.platform.dto.response.ApiResponse;
import com.ecommerce.platform.entity.Order;
import com.ecommerce.platform.service.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "APIs for browsing reports")
public class ReportController {

    private final ReportService reportService;

    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<RevenueReport>>> revenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueByDay(from, to)));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/orders/status")
    public ResponseEntity<ApiResponse<List<OrderStatusReport>>> orderStatusReport(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            @RequestParam(required = false)
            List<Order.OrderStatus> statuses
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        reportService.getOrderStatusReport(from, to, statuses)
                )
        );
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/orders/count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> countOrders(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        long count = reportService.countOrders(from, to);

        Map<String, Object> data = Map.of(
                "from", from,
                "to", to,
                "totalOrders", count
        );

        return ResponseEntity.ok(
                ApiResponse.success("Count orders successfully", data)
        );
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/orders/export")
    public ResponseEntity<byte[]> exportOrders(
            @RequestParam int year,
            @RequestParam(required = false) Integer month
    ) {
        byte[] file = reportService.exportOrders(year, month);

        String fileName = (month != null)
                ? "orders_" + month + "_" + year + ".xlsx"
                : "orders_" + year + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + fileName)
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        )
                )
                .body(file);
    }

}
