package com.ecommerce.platform.config;

import com.ecommerce.platform.entity.*;
import com.ecommerce.platform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        long userCount = userRepository.count();
        log.info("Current user count: {}", userCount);

        if (userCount > 0) {
            log.info("Data already seeded, skipping...");
            log.info("If you want to reseed, please truncate the database tables first.");

            // Debug: Kiểm tra xem password encode có hoạt động không
            String testPassword = "admin123";
            String encoded = passwordEncoder.encode(testPassword);
            log.info("Password encoder test - 'admin123' encoded: {}", encoded);
            log.info("Password encoder test - matches: {}", passwordEncoder.matches(testPassword, encoded));

            return;
        }

        log.info("Seeding initial data...");

        // Create Admin
        User admin = User.builder()
                .email("admin@ecommerce.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Admin")
                .role(User.Role.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .build();
        userRepository.save(admin);

        // Create Staff members
        User staff1 = User.builder()
                .email("staff1@ecommerce.com")
                .password(passwordEncoder.encode("staff123"))
                .fullName("Nguyen Van Staff")
                .phone("0901234567")
                .address("123 Staff Street, District 1, HCMC")
                .role(User.Role.STAFF)
                .status(User.UserStatus.ACTIVE)
                .build();
        userRepository.save(staff1);

        User staff2 = User.builder()
                .email("staff2@ecommerce.com")
                .password(passwordEncoder.encode("staff123"))
                .fullName("Tran Thi Staff")
                .phone("0902345678")
                .address("456 Staff Ave, District 3, HCMC")
                .role(User.Role.STAFF)
                .status(User.UserStatus.ACTIVE)
                .build();
        userRepository.save(staff2);

        // Create Customers
        User customer1 = User.builder()
                .email("customer1@ecommerce.com")
                .password(passwordEncoder.encode("customer123"))
                .fullName("Nguyen Van A")
                .phone("0909876543")
                .address("111 Customer St, District 2, HCMC")
                .role(User.Role.CUSTOMER)
                .status(User.UserStatus.ACTIVE)
                .build();
        userRepository.save(customer1);

        User customer2 = User.builder()
                .email("customer2@ecommerce.com")
                .password(passwordEncoder.encode("customer123"))
                .fullName("Tran Thi B")
                .phone("0908765432")
                .address("222 Buyer Ave, District 5, HCMC")
                .role(User.Role.CUSTOMER)
                .status(User.UserStatus.ACTIVE)
                .build();
        userRepository.save(customer2);

        // Create Categories
        Category electronics = Category.builder()
                .name("Electronics")
                .description("Electronic devices, smartphones, laptops, and gadgets")
                .isActive(true)
                .build();
        electronics = categoryRepository.save(electronics);

        Category fashion = Category.builder()
                .name("Fashion")
                .description("Clothing, shoes, and fashion accessories")
                .isActive(true)
                .build();
        fashion = categoryRepository.save(fashion);

        Category home = Category.builder()
                .name("Home & Living")
                .description("Home decor, furniture, and living essentials")
                .isActive(true)
                .build();
        home = categoryRepository.save(home);

        Category sports = Category.builder()
                .name("Sports & Outdoors")
                .description("Sports equipment, outdoor gear, and fitness products")
                .isActive(true)
                .build();
        sports = categoryRepository.save(sports);

        Category beauty = Category.builder()
                .name("Beauty & Health")
                .description("Cosmetics, skincare, and health products")
                .isActive(true)
                .build();
        beauty = categoryRepository.save(beauty);

        // Create Products for Single-Vendor System
        List<Product> products = new ArrayList<>();

        // Electronics Products
        products.add(Product.builder()
                .name("iPhone 15 Pro Max")
                .description("Latest Apple flagship with A17 Pro chip, titanium design, and advanced camera system. 256GB storage.")
                .price(new BigDecimal("29990000"))
                .discountPrice(new BigDecimal("27990000"))
                .stockQuantity(50)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg")
                .category(electronics)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Samsung Galaxy S24 Ultra")
                .description("Premium Android smartphone with AI features, S Pen, and 200MP camera. 512GB storage.")
                .price(new BigDecimal("31990000"))
                .discountPrice(new BigDecimal("29990000"))
                .stockQuantity(40)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/42/320721/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg")
                .category(electronics)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("MacBook Pro 14 M3")
                .description("Professional laptop with M3 Pro chip, 18GB RAM, 512GB SSD. Perfect for creative work.")
                .price(new BigDecimal("49990000"))
                .discountPrice(new BigDecimal("47990000"))
                .stockQuantity(25)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/44/309016/macbook-pro-14-inch-m3-2023-gray-thumb-600x600.jpg")
                .category(electronics)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("AirPods Pro 2")
                .description("Wireless earbuds with active noise cancellation, spatial audio, and USB-C charging.")
                .price(new BigDecimal("6490000"))
                .stockQuantity(100)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/54/289780/tai-nghe-bluetooth-airpods-pro-2-usb-c-charge-apple-mqd83-thumb-600x600.jpg")
                .category(electronics)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        // Fashion Products
        products.add(Product.builder()
                .name("Áo Polo Nam Premium")
                .description("Áo polo nam chất liệu cotton cao cấp, thoáng mát, form regular fit.")
                .price(new BigDecimal("450000"))
                .discountPrice(new BigDecimal("350000"))
                .stockQuantity(200)
                .thumbnail("https://example.com/polo-shirt.jpg")
                .category(fashion)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Quần Jeans Nữ Skinny")
                .description("Quần jeans nữ form skinny, co giãn tốt, màu xanh đậm classic.")
                .price(new BigDecimal("650000"))
                .discountPrice(new BigDecimal("520000"))
                .stockQuantity(150)
                .thumbnail("https://example.com/jeans.jpg")
                .category(fashion)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        // Home & Living Products
        products.add(Product.builder()
                .name("Bộ Chăn Ga Gối Cotton")
                .description("Bộ chăn ga gối 100% cotton Hàn Quốc, mềm mại, thoáng khí.")
                .price(new BigDecimal("1200000"))
                .discountPrice(new BigDecimal("990000"))
                .stockQuantity(80)
                .thumbnail("https://example.com/bedding.jpg")
                .category(home)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Đèn Bàn LED Thông Minh")
                .description("Đèn bàn LED điều chỉnh độ sáng, màu sắc, kết nối app điện thoại.")
                .price(new BigDecimal("890000"))
                .stockQuantity(60)
                .thumbnail("https://example.com/lamp.jpg")
                .category(home)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        // Sports Products
        products.add(Product.builder()
                .name("Giày Chạy Bộ Nike Air Zoom")
                .description("Giày chạy bộ công nghệ Air Zoom, êm ái, hỗ trợ chạy đường dài.")
                .price(new BigDecimal("3500000"))
                .discountPrice(new BigDecimal("2990000"))
                .stockQuantity(45)
                .thumbnail("https://example.com/nike-shoes.jpg")
                .category(sports)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        // Beauty Products
        products.add(Product.builder()
                .name("Serum Vitamin C Brightening")
                .description("Serum dưỡng trắng da với 20% Vitamin C nguyên chất, chống oxy hóa.")
                .price(new BigDecimal("680000"))
                .discountPrice(new BigDecimal("550000"))
                .stockQuantity(120)
                .thumbnail("https://example.com/serum.jpg")
                .category(beauty)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        productRepository.saveAll(products);

        log.info("=".repeat(80));
        log.info("Data seeding completed successfully for Single-Vendor E-commerce!");
        log.info("Created: 1 admin, 2 staff, 2 customers, 5 categories, {} products", products.size());
        log.info("System Type: Single-Vendor (First-Party)");
        log.info("Roles: CUSTOMER, STAFF, ADMIN (No SELLER role)");
        log.info("=".repeat(80));
    }
}
