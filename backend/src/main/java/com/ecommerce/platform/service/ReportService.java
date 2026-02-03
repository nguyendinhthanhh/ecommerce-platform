package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.OrderStatusReport;
import com.ecommerce.platform.dto.request.OrderTimeReport;
import com.ecommerce.platform.dto.request.RevenueReport;
import com.ecommerce.platform.entity.Order;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    List<RevenueReport> getRevenueByDay(LocalDate from, LocalDate to);

    List<OrderStatusReport> getOrderStatusReport(
            LocalDate from,
            LocalDate to,
            List<Order.OrderStatus> statuses
    );

    long countOrders(LocalDate from, LocalDate to);

    byte[] exportOrders(Integer year, Integer month);
}
