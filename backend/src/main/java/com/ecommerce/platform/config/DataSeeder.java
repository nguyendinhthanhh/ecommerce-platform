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
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ShopRepository shopRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Data already seeded, skipping...");
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

        // Create Seller
        User seller = User.builder()
                .email("seller@ecommerce.com")
                .password(passwordEncoder.encode("seller123"))
                .fullName("Test Seller")
                .phone("0901234567")
                .address("123 Seller Street")
                .role(User.Role.SELLER)
                .status(User.UserStatus.ACTIVE)
                .build();
        seller = userRepository.save(seller);

        // Create Customer
        User customer = User.builder()
                .email("customer@ecommerce.com")
                .password(passwordEncoder.encode("customer123"))
                .fullName("Test Customer")
                .phone("0909876543")
                .address("456 Customer Avenue")
                .role(User.Role.CUSTOMER)
                .status(User.UserStatus.ACTIVE)
                .build();
        userRepository.save(customer);

        // Create Categories
        Category electronics = Category.builder()
                .name("Electronics")
                .description("Electronic devices and gadgets")
                .isActive(true)
                .build();
        electronics = categoryRepository.save(electronics);

        Category fashion = Category.builder()
                .name("Fashion")
                .description("Clothing and accessories")
                .isActive(true)
                .build();
        fashion = categoryRepository.save(fashion);

        Category home = Category.builder()
                .name("Home & Living")
                .description("Home decor and furniture")
                .isActive(true)
                .build();
        categoryRepository.save(home);

        // Create Shop
        Shop shop = Shop.builder()
                .name("Tech Store")
                .description("Best electronics shop")
                .seller(seller)
                .status(Shop.ShopStatus.ACTIVE)
                .address("789 Shop Boulevard")
                .phone("0912345678")
                .build();
        shop = shopRepository.save(shop);

        // Create Products
        Product product1 = Product.builder()
                .name("iPhone 15 Pro Max")
                .description("Latest Apple smartphone with A17 Pro chip")
                .price(new BigDecimal("29990000"))
                .discountPrice(new BigDecimal("27990000"))
                .stockQuantity(50)
                .thumbnail("https://example.com/iphone15.jpg")
                .category(electronics)
                .shop(shop)
                .status(Product.ProductStatus.ACTIVE)
                .build();
        productRepository.save(product1);

        Product product2 = Product.builder()
                .name("Samsung Galaxy S24 Ultra")
                .description("Premium Android smartphone with AI features")
                .price(new BigDecimal("31990000"))
                .stockQuantity(30)
                .thumbnail("https://example.com/s24ultra.jpg")
                .category(electronics)
                .shop(shop)
                .status(Product.ProductStatus.ACTIVE)
                .build();
        productRepository.save(product2);

        Product product3 = Product.builder()
                .name("MacBook Pro 14 M3")
                .description("Professional laptop with M3 Pro chip")
                .price(new BigDecimal("49990000"))
                .discountPrice(new BigDecimal("47990000"))
                .stockQuantity(20)
                .thumbnail("https://example.com/macbook.jpg")
                .category(electronics)
                .shop(shop)
                .status(Product.ProductStatus.ACTIVE)
                .build();
        productRepository.save(product3);

        Product product4 = Product.builder()
                .name("AirPods Pro 2")
                .description("Wireless earbuds with active noise cancellation")
                .price(new BigDecimal("6490000"))
                .stockQuantity(100)
                .thumbnail("https://example.com/airpods.jpg")
                .category(electronics)
                .shop(shop)
                .status(Product.ProductStatus.ACTIVE)
                .build();
        productRepository.save(product4);

        Product product5 = Product.builder()
                .name("Nike Air Max 270")
                .description("Comfortable running shoes")
                .price(new BigDecimal("3590000"))
                .discountPrice(new BigDecimal("2990000"))
                .stockQuantity(80)
                .thumbnail("https://example.com/nike.jpg")
                .category(fashion)
                .shop(shop)
                .status(Product.ProductStatus.ACTIVE)
                .build();
        productRepository.save(product5);

        log.info("Data seeding completed!");
        log.info("Test accounts:");
        log.info("  Admin: admin@ecommerce.com / admin123");
        log.info("  Seller: seller@ecommerce.com / seller123");
        log.info("  Customer: customer@ecommerce.com / customer123");
    }
}
