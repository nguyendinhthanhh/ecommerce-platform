package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.request.OrderStatusReport;
import com.ecommerce.platform.entity.Order;
import com.ecommerce.platform.entity.Payment;
import com.ecommerce.platform.entity.Product;
import com.ecommerce.platform.repository.OrderRepository;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // --- Helper Method để tránh lặp logic xử lý ngày tháng ---
    private LocalDateTime getStartDateTime(LocalDate date) {
        return (date != null) ? date.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
    }

    private LocalDateTime getEndDateTime(LocalDate date) {
        return (date != null) ? date.atTime(LocalTime.MAX) : LocalDateTime.now();
    }

    @Override
    public List<OrderStatusReport> getOrderStatusReport(LocalDate from, LocalDate to, List<Order.OrderStatus> statuses) {
        LocalDateTime fromTime = getStartDateTime(from);
        LocalDateTime toTime = getEndDateTime(to);

        List<Order.OrderStatus> statusList = (statuses == null || statuses.isEmpty())
                ? List.of(Order.OrderStatus.values())
                : statuses;

        List<OrderStatusReport> rawData = orderRepository.countOrdersByStatusIn(fromTime, toTime, statusList);

        Map<Order.OrderStatus, Long> map = rawData.stream()
                .collect(Collectors.toMap(OrderStatusReport::getStatus, OrderStatusReport::getTotal));

        return statusList.stream()
                .map(status -> new OrderStatusReport(status, map.getOrDefault(status, 0L)))
                .collect(Collectors.toList());
    }

    @Override
    public long countOrders(LocalDate from, LocalDate to) {
        if (from == null && to == null) return orderRepository.count();
        return orderRepository.countByCreatedAtBetween(getStartDateTime(from), getEndDateTime(to));
    }

    @Override
    public BigDecimal getTotalRevenue(LocalDate from, LocalDate to) {
        BigDecimal revenue = orderRepository.calculateTotalRevenueRange(getStartDateTime(from), getEndDateTime(to));
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    @Override
    public Map<String, Long> getPaymentStats(LocalDate from, LocalDate to) {
        List<Object[]> results = orderRepository.countPaymentStatusRange(getStartDateTime(from), getEndDateTime(to));

        Map<String, Long> stats = new HashMap<>();
        // Khởi tạo tất cả status bằng 0 để dashboard đẹp, không bị lỗi thiếu data
        for (Payment.PaymentStatus status : Payment.PaymentStatus.values()) {
            stats.put(status.name(), 0L);
        }

        if (results != null) {
            for (Object[] row : results) {
                if (row[0] != null) stats.put(row[0].toString(), (Long) row[1]);
            }
        }
        return stats;
    }

    @Override
    public Map<Integer, BigDecimal> getMonthlyRevenueReport(int year) {
        List<Object[]> results = orderRepository.getMonthlyRevenueByYear(year);
        Map<Integer, BigDecimal> monthlyData = new HashMap<>();

        for (int i = 1; i <= 12; i++) {
            monthlyData.put(i, BigDecimal.ZERO);
        }

        if (results != null) {
            for (Object[] row : results) {
                monthlyData.put((Integer) row[0], (BigDecimal) row[1]);
            }
        }
        return monthlyData;
    }

    @Override
    public byte[] exportOrders(Integer year, Integer month, Order.OrderStatus status) {
        List<Order> orders = orderRepository.findOrdersForExport(year, month, status);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Orders Report");

            // Style cho Header
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "Order Code", "Customer", "Phone", "Status",
                    "Subtotal", "Shipping Fee", "Total Amount", "Created At",
                    "Address"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Order o : orders) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(o.getOrderCode());
                row.createCell(1).setCellValue(o.getCustomer() != null ? o.getCustomer().getFullName() : "N/A");
                row.createCell(2).setCellValue(o.getCustomer() != null ? o.getCustomer().getPhone() : "");
                row.createCell(3).setCellValue(o.getStatus().name());
                row.createCell(4).setCellValue(o.getSubtotal() != null ? o.getSubtotal().doubleValue() : 0);
                row.createCell(5).setCellValue(o.getShippingFee() != null ? o.getShippingFee().doubleValue() : 0);
                row.createCell(6).setCellValue(o.getTotalAmount() != null ? o.getTotalAmount().doubleValue() : 0);
                row.createCell(7).setCellValue(o.getCreatedAt().toString());
                row.createCell(8).setCellValue(o.getShippingAddress());
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi xuất file Excel: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getBestSeller() {
        // Lấy top 1 sản phẩm
        List<Product> topProducts = productRepository.findTopBySoldCount(PageRequest.of(0, 1));

        Map<String, Object> data = new HashMap<>();
        if (!topProducts.isEmpty()) {
            Product p = topProducts.getFirst();
            data.put("id", p.getId());
            data.put("name", p.getName());
            data.put("soldCount", p.getSoldCount());
            data.put("thumbnail", p.getThumbnail());
        } else {
            data.put("name", "N/A");
            data.put("soldCount", 0);
        }
        return data;
    }

    @Override
    public Map<String, Object> getLowStockDetail(Integer threshold) {
        // Lấy danh sách sản phẩm sắp hết, sắp xếp từ thấp đến cao
        List<Product> lowStockProducts = productRepository.findByStockQuantityLessThanAndStatusOrderByStockQuantityAsc(
                threshold, Product.ProductStatus.ACTIVE);

        Map<String, Object> result = new HashMap<>();
        result.put("totalCount", lowStockProducts.size());

        if (!lowStockProducts.isEmpty()) {
            Product p = lowStockProducts.get(0); // Lấy thằng thấp nhất
            result.put("name", p.getName());
            result.put("stock", p.getStockQuantity());
        }

        return result;
    }

}