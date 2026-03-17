package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.OrderStatusReport;
import com.ecommerce.platform.dto.response.ApiResponse;
import com.ecommerce.platform.entity.Order;
import com.ecommerce.platform.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "APIs for business statistics and dashboard")
public class ReportController {

    private final ReportService reportService;

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/orders/status")
    public ResponseEntity<ApiResponse<List<OrderStatusReport>>> orderStatusReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) List<Order.OrderStatus> statuses
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(reportService.getOrderStatusReport(from, to, statuses))
        );
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/orders/count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> countOrders(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        long count = reportService.countOrders(from, to);
        Map<String, Object> data = new HashMap<>();
        data.put("totalOrders", count);
        return ResponseEntity.ok(ApiResponse.success("Count orders successfully", data));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/orders/revenue")
    @Operation(summary = "Lấy tổng doanh thu theo khoảng thời gian")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        BigDecimal total = reportService.getTotalRevenue(from, to);
        Map<String, Object> data = new HashMap<>();
        data.put("totalRevenue", total);

        return ResponseEntity.ok(ApiResponse.success("Get revenue successfully", data));
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/payments/stats")
    @Operation(summary = "Thống kê trạng thái thanh toán cho Dashboard")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPaymentStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(
                ApiResponse.success("Get payment stats successfully", reportService.getPaymentStats(from, to))
        );
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/orders/revenue/monthly")
    @Operation(summary = "Biểu đồ doanh thu 12 tháng theo năm")
    public ResponseEntity<ApiResponse<Map<Integer, BigDecimal>>> getMonthlyRevenue(
            @RequestParam int year) {

        return ResponseEntity.ok(
                ApiResponse.success("Get monthly revenue successfully", reportService.getMonthlyRevenueReport(year))
        );
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/orders/export")
    public ResponseEntity<byte[]> exportOrders(
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Order.OrderStatus status
    ) {
        byte[] file = reportService.exportOrders(year, month, status);

        String fileName = String.format("orders_report_%d%s.xlsx",
                year,
                (month != null ? "_" + month : ""));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/products/best-seller")
    @Operation(summary = "Lấy sản phẩm bán chạy nhất")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBestSeller() {
        return ResponseEntity.ok(
                ApiResponse.success("Get best seller successfully", reportService.getBestSeller())
        );
    }

    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    @GetMapping("/products/low-stock")
    @Operation(summary = "Lấy thông tin chi tiết sản phẩm sắp hết hàng")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLowStockDetail(
            @RequestParam(defaultValue = "10") Integer threshold) {

        Map<String, Object> lowStockData = reportService.getLowStockDetail(threshold);

        return ResponseEntity.ok(
                ApiResponse.success("Get low stock detail successfully", lowStockData)
        );
    }

}