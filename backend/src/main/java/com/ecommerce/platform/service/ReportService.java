package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.OrderStatusReport;
import com.ecommerce.platform.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReportService {

    List<OrderStatusReport> getOrderStatusReport(
            LocalDate from,
            LocalDate to,
            List<Order.OrderStatus> statuses
    );

    long countOrders(LocalDate from, LocalDate to);

    byte[] exportOrders(Integer year, Integer month, Order.OrderStatus status);

    BigDecimal getTotalRevenue(LocalDate from, LocalDate to);

    Map<String, Long> getPaymentStats(LocalDate from, LocalDate to);

    Map<Integer, BigDecimal> getMonthlyRevenueReport(int year);

    Map<String, Object> getBestSeller();

    Map<String, Object> getLowStockDetail(Integer threshold);
}
