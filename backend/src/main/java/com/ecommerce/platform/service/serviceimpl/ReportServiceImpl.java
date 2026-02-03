package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.request.OrderStatusReport;
import com.ecommerce.platform.dto.request.OrderTimeReport;
import com.ecommerce.platform.dto.request.RevenueReport;
import com.ecommerce.platform.entity.Order;
import com.ecommerce.platform.repository.OrderRepository;
import com.ecommerce.platform.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;

    @Override
    public List<RevenueReport> getRevenueByDay(LocalDate from, LocalDate to) {

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.MAX);

        return orderRepository.revenueByDay(start, end)
                .stream()
                .map(obj -> RevenueReport.builder()
                        .label(obj[0].toString())
                        .revenue((BigDecimal) obj[1])
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderStatusReport> getOrderStatusReport(
            LocalDate from,
            LocalDate to,
            List<Order.OrderStatus> statuses
    ) {
        LocalDateTime fromTime = from.atStartOfDay();
        LocalDateTime toTime = to.atTime(23, 59, 59);

        List<Order.OrderStatus> statusList =
                (statuses == null || statuses.isEmpty())
                        ? List.of(Order.OrderStatus.values())
                        : statuses;

        List<OrderStatusReport> rawData =
                orderRepository.countOrdersByStatusIn(
                        fromTime,
                        toTime,
                        statusList
                );

        Map<Order.OrderStatus, Long> map = rawData.stream()
                .collect(Collectors.toMap(
                        OrderStatusReport::getStatus,
                        OrderStatusReport::getTotal
                ));

        List<OrderStatusReport> result = new ArrayList<>();
        for (Order.OrderStatus status : statusList) {
            result.add(
                    new OrderStatusReport(
                            status,
                            map.getOrDefault(status, 0L)
                    )
            );
        }

        return result;
    }

    @Override
    public long countOrders(LocalDate from, LocalDate to) {

        if (from == null && to == null) {
            return orderRepository.count();
        }

        LocalDateTime fromTime = from != null
                ? from.atStartOfDay()
                : LocalDateTime.MIN;

        LocalDateTime toTime = to != null
                ? to.atTime(LocalTime.MAX)
                : LocalDateTime.now();

        return orderRepository.countByCreatedAtBetween(fromTime, toTime);
    }

    @Override
    public byte[] exportOrders(Integer year, Integer month) {

        List<Order> orders = (month != null)
                ? orderRepository.findOrdersByMonth(year, month)
                : orderRepository.findOrdersByYear(year);

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Orders");

            // Header
            Row header = sheet.createRow(0);
            String[] columns = {
                    "Order Code", "Customer",
                    "Phone", "Status",
                    "Subtotal", "Shipping Fee",
                    "Total Amount", "Created At",
                    "Shipping Name", "Shipping Phone", "Address"
            };

            for (int i = 0; i < columns.length; i++) {
                header.createCell(i).setCellValue(columns[i]);
            }

            int rowIdx = 1;
            for (Order o : orders) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(o.getOrderCode());
                row.createCell(1).setCellValue(o.getCustomer().getFullName());
                row.createCell(2).setCellValue(o.getCustomer().getPhone());
                row.createCell(3).setCellValue(o.getStatus().name());
                row.createCell(4).setCellValue(o.getSubtotal().doubleValue());
                row.createCell(5).setCellValue(o.getShippingFee().doubleValue());
                row.createCell(6).setCellValue(o.getTotalAmount().doubleValue());
                row.createCell(7).setCellValue(o.getCreatedAt().toString());
                row.createCell(8).setCellValue(o.getShippingName());
                row.createCell(9).setCellValue(o.getShippingPhone());
                row.createCell(10).setCellValue(o.getShippingAddress());
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Export excel failed", e);
        }
    }

}
