package com.ecommerce.platform.config;

import com.ecommerce.platform.entity.*;
import com.ecommerce.platform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("dev") // Chỉ chạy trong môi trường dev
public class DataSeeder implements CommandLineRunner {

        private final UserRepository userRepository;
        private final CategoryRepository categoryRepository;
        private final ProductRepository productRepository;
        private final OrderRepository orderRepository;
        private final OrderItemRepository orderItemRepository;
        private final ReviewRepository reviewRepository;
        private final PaymentRepository paymentRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;

        private final Random random = new Random();

        @Override
        @Transactional
        public void run(String... args) {
                log.info("Starting data seeding...");

                seedRoles();
                List<User> users = seedUsers();

                List<Category> categories = seedCategories();
                List<Product> products = seedProducts(categories);

                if (orderRepository.count() == 0) {
                        List<Order> orders = seedOrders(users, products);
                        seedReviews(users, products, orders);
                }

                log.info("Data seeding completed!");
        }

        private void seedRoles() {
                log.info("Seeding roles...");
                createRoleIfNotFound("ADMIN", "Administrator");
                createRoleIfNotFound("STAFF", "Staff Member");
                createRoleIfNotFound("CUSTOMER", "Customer");
        }

        private void createRoleIfNotFound(String name, String description) {
                if (roleRepository.findByName(name).isEmpty()) {
                        Role role = Role.builder()
                                        .name(name)
                                        .description(description)
                                        .build();
                        roleRepository.save(role);
                        log.info("Created role: {}", name);
                }
        }

        private List<User> seedUsers() {
                log.info("Seeding users...");
                List<User> users = new ArrayList<>();

                Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
                Role staffRole = roleRepository.findByName("STAFF").orElseThrow();
                Role customerRole = roleRepository.findByName("CUSTOMER").orElseThrow();

                // Admin
                if (userRepository.findByEmail("admin@techshop.vn").isEmpty()) {
                        User admin = User.builder()
                                        .email("admin@techshop.vn")
                                        .password(passwordEncoder.encode("Admin@123"))
                                        .fullName("Quản trị viên")
                                        .phone("0901234567")
                                        .address("123 Nguyễn Huệ, Quận 1, TP.HCM")
                                        .roles(new java.util.HashSet<>(java.util.Collections.singleton(adminRole)))
                                        .status(User.UserStatus.ACTIVE)
                                        .build();
                        users.add(userRepository.save(admin));
                        log.info("Created admin user");
                }

                // Staff
                if (userRepository.findByEmail("staff@techshop.vn").isEmpty()) {
                        User staff = User.builder()
                                        .email("staff@techshop.vn")
                                                .password(passwordEncoder.encode("Staff@123"))
                                        .fullName("Nhân viên bán hàng")
                                        .phone("0902345678")
                                        .address("456 Lê Lợi, Quận 1, TP.HCM")
                                        .roles(new java.util.HashSet<>(java.util.Collections.singleton(staffRole)))
                                        .status(User.UserStatus.ACTIVE)
                                        .build();
                        users.add(userRepository.save(staff));
                        log.info("Created staff user");
                }

                // Customers
                String[] customerNames = {
                                "Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Cường", "Phạm Minh Đức",
                                "Hoàng Thị Em", "Vũ Quốc Phong", "Đặng Thị Giang", "Bùi Văn Hải",
                                "Ngô Thị Hương", "Lý Minh Khang"
                };

                String[] addresses = {
                                "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
                                "12 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội",
                                "56 Trần Phú, Quận Hải Châu, Đà Nẵng",
                                "34 Nguyễn Văn Linh, Quận 7, TP.HCM",
                                "78 Lạc Long Quân, Quận Tây Hồ, Hà Nội",
                                "90 Bạch Đằng, Quận Hải Châu, Đà Nẵng",
                                "23 Phan Đình Phùng, Quận Ba Đình, Hà Nội",
                                "45 Võ Văn Tần, Quận 3, TP.HCM",
                                "67 Hoàng Diệu, Quận Hải Châu, Đà Nẵng",
                                "11 Điện Biên Phủ, Quận 1, TP.HCM"
                };

                for (int i = 0; i < customerNames.length; i++) {
                        String email = "customer" + (i + 1) + "@gmail.com";
                        if (userRepository.findByEmail(email).isEmpty()) {
                                User customer = User.builder()
                                                .email(email)
                                                .password(passwordEncoder.encode("Customer@123"))
                                                .fullName(customerNames[i])
                                                .phone("090" + String.format("%07d", 3000000 + i))
                                                .address(addresses[i])
                                                .roles(new java.util.HashSet<>(
                                                                java.util.Collections.singleton(customerRole)))
                                                .status(User.UserStatus.ACTIVE)
                                                .build();
                                users.add(userRepository.save(customer));
                        }
                }

                // Return all users for subsequent seeding steps
                return userRepository.findAll();
        }

        private List<Category> seedCategories() {
                log.info("Seeding categories...");
                List<Category> categories = new ArrayList<>();

                // Danh mục cha
                Category smartphones = updateOrCreateCategory("Điện thoại", "Điện thoại thông minh các hãng",
                                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1920&auto=format&fit=crop");
                Category laptops = updateOrCreateCategory("Laptop", "Laptop văn phòng, gaming, đồ họa",
                                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1504707748692-419802cf939d?q=80&w=1920&auto=format&fit=crop");
                Category tablets = updateOrCreateCategory("Máy tính bảng", "iPad, máy tính bảng Android",
                                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=1920&auto=format&fit=crop");
                Category accessories = updateOrCreateCategory("Phụ kiện", "Phụ kiện điện thoại, laptop, tablet",
                                "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=600&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1555664424-778a1bc5e1b3?q=80&w=1920&auto=format&fit=crop");
                Category audio = updateOrCreateCategory("Âm thanh", "Tai nghe, loa bluetooth, thiết bị âm thanh",
                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1920&auto=format&fit=crop");
                Category wearables = updateOrCreateCategory("Đồng hồ thông minh", "Smartwatch, đồng hồ thông minh các hãng",
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1434494878577-86c23bdd0639?q=80&w=1920&auto=format&fit=crop");

                // Danh mục con cho Điện thoại
                categories.add(createSubCategory("iPhone", "Điện thoại Apple iPhone", smartphones));
                categories.add(createSubCategory("Samsung", "Điện thoại Samsung Galaxy", smartphones));
                categories.add(createSubCategory("Xiaomi", "Điện thoại Xiaomi", smartphones));
                categories.add(createSubCategory("OPPO", "Điện thoại OPPO", smartphones));
                categories.add(createSubCategory("Vivo", "Điện thoại Vivo", smartphones));

                // Danh mục con cho Laptop
                categories.add(createSubCategory("MacBook", "Apple MacBook", laptops));
                categories.add(createSubCategory("Dell", "Laptop Dell", laptops));
                categories.add(createSubCategory("ASUS", "Laptop ASUS", laptops));
                categories.add(createSubCategory("Lenovo", "Laptop Lenovo", laptops));
                categories.add(createSubCategory("HP", "Laptop HP", laptops));

                // Danh mục con cho Phụ kiện
                categories.add(createSubCategory("Ốp lưng", "Ốp lưng điện thoại", accessories));
                categories.add(createSubCategory("Cường lực", "Kính cường lực", accessories));
                categories.add(createSubCategory("Sạc dự phòng", "Pin sạc dự phòng", accessories));
                categories.add(createSubCategory("Cáp sạc", "Cáp sạc các loại", accessories));
                categories.add(createSubCategory("Adapter", "Củ sạc, adapter", accessories));

                // Danh mục con cho Âm thanh
                categories.add(createSubCategory("Tai nghe Bluetooth", "Tai nghe không dây", audio));
                categories.add(createSubCategory("Tai nghe có dây", "Tai nghe có dây", audio));
                categories.add(createSubCategory("Loa Bluetooth", "Loa di động", audio));

                // Thêm danh mục cha vào list
                categories.add(smartphones);
                categories.add(laptops);
                categories.add(tablets);
                categories.add(accessories);
                categories.add(audio);
                categories.add(wearables);

                return categories;
        }

        private Category updateOrCreateCategory(String name, String description, String image, String bannerUrl) {
                return categoryRepository.findByNameIgnoreCase(name)
                                .map(existing -> {
                                        existing.setDescription(description);
                                        existing.setImage(image);
                                        existing.setBannerUrl(bannerUrl);
                                        return categoryRepository.save(existing);
                                })
                                .orElseGet(() -> {
                                        Category category = Category.builder()
                                                        .name(name)
                                                        .description(description)
                                                        .image(image)
                                                        .bannerUrl(bannerUrl)
                                                        .isActive(true)
                                                        .build();
                                        return categoryRepository.save(category);
                                });
        }

        private Category createSubCategory(String name, String description, Category parent) {
                return categoryRepository.findByNameIgnoreCase(name)
                                .map(existing -> {
                                        existing.setDescription(description);
                                        existing.setParent(parent);
                                        return categoryRepository.save(existing);
                                })
                                .orElseGet(() -> {
                                        Category category = Category.builder()
                                                        .name(name)
                                                        .description(description)
                                                        .parent(parent)
                                                        .isActive(true)
                                                        .build();
                                        return categoryRepository.save(category);
                                });
        }

        private List<Product> seedProducts(List<Category> categories) {
                log.info("Seeding products...");
                List<Product> products = new ArrayList<>();

                // Tìm các category cần thiết
                Category iphone = findCategoryByName(categories, "iPhone");
                Category samsung = findCategoryByName(categories, "Samsung");
                Category xiaomi = findCategoryByName(categories, "Xiaomi");
                Category macbook = findCategoryByName(categories, "MacBook");
                Category dell = findCategoryByName(categories, "Dell");
                Category asus = findCategoryByName(categories, "ASUS");
                Category tablets = findCategoryByName(categories, "Máy tính bảng");
                Category earphones = findCategoryByName(categories, "Tai nghe Bluetooth");
                Category speakers = findCategoryByName(categories, "Loa Bluetooth");
                Category powerbank = findCategoryByName(categories, "Sạc dự phòng");
                Category cases = findCategoryByName(categories, "Ốp lưng");
                Category wearables = findCategoryByName(categories, "Đồng hồ thông minh");

                // iPhone
                products.add(createProduct("iPhone 15 Pro Max 256GB",
                                "iPhone 15 Pro Max với chip A17 Pro, màn hình Super Retina XDR 6.7 inch, camera 48MP, Dynamic Island. Thiết kế titan cao cấp, cổng USB-C.",
                                new BigDecimal("34990000"), new BigDecimal("32990000"), 50, iphone,
                                "https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("iPhone 16 Pro Max 256GB",
                                "iPhone 16 Pro Max cao cấp nhất với Apple Intelligence. Thiết kế Titan viền mỏng siêu cấp, màn hình 6.9 inch, chip A18 Pro mạnh mẽ và Camera Fusion 48MP.",
                                new BigDecimal("34990000"), new BigDecimal("34490000"), 150, iphone,
                                "https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("iPhone 15 Pro 128GB",
                                "iPhone 15 Pro với chip A17 Pro, màn hình 6.1 inch, camera chuyên nghiệp 48MP, khung titan bền bỉ.",
                                new BigDecimal("28990000"), new BigDecimal("27490000"), 80, iphone,
                                "https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("iPhone 15 128GB",
                                "iPhone 15 với Dynamic Island, camera 48MP, chip A16 Bionic, thiết kế mới với mặt lưng kính nhám.",
                                new BigDecimal("22990000"), new BigDecimal("21490000"), 100, iphone,
                                "https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("iPhone 14 128GB",
                                "iPhone 14 với chip A15 Bionic, màn hình Super Retina XDR 6.1 inch, hệ thống camera kép 12MP.",
                                new BigDecimal("17990000"), new BigDecimal("16490000"), 120, iphone,
                                "https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1695822822491-d92cee704368?q=80&w=1000&auto=format&fit=crop")));

                // Samsung
                products.add(createProduct("Samsung Galaxy S24 Ultra 256GB",
                                "Galaxy S24 Ultra with bút S Pen, chip Snapdragon 8 Gen 3, màn hình Dynamic AMOLED 2X 6.8 inch, camera 200MP.",
                                new BigDecimal("33990000"), new BigDecimal("29990000"), 60, samsung,
                                "https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Samsung Galaxy Z Flip5 256GB",
                                "Galaxy Z Flip5 điện thoại gập bản lề Flex tiên tiến, màn hình phụ siêu lớn 3.4 inch, camera cải tiến và thiết kế thời thượng.",
                                new BigDecimal("25990000"), new BigDecimal("18990000"), 80, samsung,
                                "https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Samsung Galaxy S24+ 256GB",
                                "Galaxy S24+ với chip Snapdragon 8 Gen 3, màn hình 6.7 inch, camera 50MP, hỗ trợ Galaxy AI.",
                                new BigDecimal("26990000"), new BigDecimal("24990000"), 75, samsung,
                                "https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Samsung Galaxy Z Fold5 256GB",
                                "Galaxy Z Fold5 điện thoại gập với màn hình chính 7.6 inch, màn hình phụ 6.2 inch, chip Snapdragon 8 Gen 2.",
                                new BigDecimal("41990000"), new BigDecimal("38990000"), 30, samsung,
                                "https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Samsung Galaxy A54 5G 128GB",
                                "Galaxy A54 5G với chip Exynos 1380, màn hình Super AMOLED 6.4 inch, camera 50MP, chống nước IP67.",
                                new BigDecimal("10990000"), new BigDecimal("9490000"), 150, samsung,
                                "https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1705585174953-9b2aa8afc174?q=80&w=1000&auto=format&fit=crop")));

                // Xiaomi
                products.add(createProduct("Xiaomi 14 Ultra 512GB",
                                "Xiaomi 14 Ultra với camera Leica, chip Snapdragon 8 Gen 3, màn hình AMOLED 6.73 inch 120Hz.",
                                new BigDecimal("29990000"), new BigDecimal("27990000"), 40, xiaomi,
                                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Xiaomi 14 256GB",
                                "Xiaomi 14 với camera Leica, chip Snapdragon 8 Gen 3, màn hình AMOLED 6.36 inch, sạc nhanh 90W.",
                                new BigDecimal("18990000"), new BigDecimal("17490000"), 70, xiaomi,
                                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Redmi Note 13 Pro+ 5G 256GB",
                                "Redmi Note 13 Pro+ với camera 200MP, màn hình AMOLED cong 6.67 inch 120Hz, sạc nhanh 120W.",
                                new BigDecimal("11990000"), new BigDecimal("10990000"), 200, xiaomi,
                                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1000&auto=format&fit=crop")));

                // MacBook
                products.add(createProduct("MacBook Pro 14 M3 Pro 512GB",
                                "MacBook Pro 14 inch với chip M3 Pro, 18GB RAM, 512GB SSD, màn hình Liquid Retina XDR cực đỉnh.",
                                new BigDecimal("49990000"), new BigDecimal("46990000"), 20, macbook,
                                "https://images.unsplash.com/photo-1724859234679-964acf07b126?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1724859234679-964acf07b126?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("MacBook Air 15 M3 256GB",
                                "MacBook Air 15 inch với chip M3 mới nhất, thiết kế siêu mỏng, pin lên đến 18 giờ, màn hình Liquid Retina.",
                                new BigDecimal("32990000"), new BigDecimal("30490000"), 40, macbook,
                                "https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("MacBook Air 13 M2 256GB",
                                "MacBook Air 13 inch với chip M2, thiết kế mỏng nhẹ, màn hình Liquid Retina, không quạt tản nhiệt.",
                                new BigDecimal("27990000"), new BigDecimal("25990000"), 45, macbook,
                                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000&auto=format&fit=crop")));

                // Dell
                products.add(createProduct("Dell XPS 15 9530 Core i7",
                                "Dell XPS 15 với Intel Core i7-13700H, RAM 16GB, SSD 512GB, màn hình OLED 3.5K 15.6 inch.",
                                new BigDecimal("45990000"), new BigDecimal("42990000"), 20, dell,
                                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Dell Inspiron 15 3520",
                                "Dell Inspiron 15 với Intel Core i5-1235U, RAM 8GB, SSD 512GB, màn hình FHD 15.6 inch.",
                                new BigDecimal("15990000"), new BigDecimal("14490000"), 60, dell,
                                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop")));

                // ASUS & Gaming
                products.add(createProduct("ASUS ROG Strix G16 RTX 4060",
                                "ASUS ROG Strix G16 Gaming với Intel Core i7-13650HX, RTX 4060 8GB, RAM 16GB, màn hình 165Hz.",
                                new BigDecimal("35990000"), new BigDecimal("33990000"), 25, asus,
                                "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("MSI Titan GT77 HX RTX 4090",
                                "Laptop siêu phẩm đồ họa, cấu hình khủng khiếp Intel Core i9-13980HX, NVIDIA RTX 4090 16GB, 64GB RAM DDR5, màn hình 17.3 inch 4K Mini-LED 144Hz.",
                                new BigDecimal("129990000"), new BigDecimal("124990000"), 5, asus,
                                "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("ASUS Vivobook 15 OLED",
                                "ASUS Vivobook 15 với AMD Ryzen 7 7730U, RAM 16GB, SSD 512GB, màn hình OLED FHD 15.6 inch.",
                                new BigDecimal("18990000"), new BigDecimal("17490000"), 50, asus,
                                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop")));

                // Tablets
                products.add(createProduct("iPad Pro M4 11 inch 256GB WiFi",
                                "iPad Pro 11 inch với chip M4, màn hình Ultra Retina XDR, hỗ trợ Apple Pencil Pro.",
                                new BigDecimal("28990000"), new BigDecimal("27490000"), 40, tablets,
                                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("iPad Air M2 11 inch 128GB WiFi",
                                "iPad Air 11 inch với chip M2, màn hình Liquid Retina, hỗ trợ Apple Pencil Pro.",
                                new BigDecimal("18990000"), new BigDecimal("17990000"), 55, tablets,
                                "https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Samsung Galaxy Tab S9 FE 128GB WiFi",
                                "Galaxy Tab S9 FE với chip Exynos 1380, màn hình 10.9 inch, bút S Pen, chống nước IP68.",
                                new BigDecimal("12490000"), new BigDecimal("11490000"), 70, tablets,
                                "https://images.unsplash.com/photo-1585517586921-16af729ff75a?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1585517586921-16af729ff75a?q=80&w=1000&auto=format&fit=crop")));

                // Tai nghe Bluetooth
                products.add(createProduct("AirPods Pro 2 USB-C",
                                "AirPods Pro thế hệ 2 với cổng USB-C, chống ồn chủ động, âm thanh không gian, chip H2.",
                                new BigDecimal("6790000"), new BigDecimal("5990000"), 100, earphones,
                                "https://images.unsplash.com/photo-1588423770674-f28e1204b3ed?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1588423770674-f28e1204b3ed?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Samsung Galaxy Buds2 Pro",
                                "Galaxy Buds2 Pro với chống ồn chủ động thông minh, âm thanh Hi-Fi 24bit, chống nước IPX7.",
                                new BigDecimal("4990000"), new BigDecimal("3990000"), 120, earphones,
                                "https://images.unsplash.com/photo-1590664095641-7fa05f689813?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1590664095641-7fa05f689813?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Sony WF-1000XM5",
                                "Sony WF-1000XM5 với chống ồn hàng đầu thế giới, âm thanh Hi-Res, pin 8 giờ.",
                                new BigDecimal("7490000"), new BigDecimal("6490000"), 50, earphones,
                                "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop")));

                // Loa Bluetooth
                products.add(createProduct("JBL Flip 6",
                                "JBL Flip 6 với công suất 30W, chống nước IP67, pin 12 giờ, kết nối PartyBoost.",
                                new BigDecimal("2990000"), new BigDecimal("2490000"), 80, speakers,
                                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Harman Kardon Onyx Studio 8",
                                "Harman Kardon Onyx Studio 8 với âm thanh cao cấp, thiết kế sang trọng, pin 8 giờ.",
                                new BigDecimal("6990000"), new BigDecimal("5990000"), 30, speakers,
                                "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1000&auto=format&fit=crop")));

                // Sạc dự phòng
                products.add(createProduct("Anker PowerCore 20000mAh PD 65W",
                                "Anker PowerCore với dung lượng 20000mAh, sạc nhanh PD 65W, có thể sạc laptop.",
                                new BigDecimal("1490000"), new BigDecimal("1290000"), 150, powerbank,
                                "https://images.unsplash.com/photo-1625842268584-8f3bf9ff16a1?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1625842268584-8f3bf9ff16a1?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Xiaomi Power Bank 3 10000mAh 22.5W",
                                "Xiaomi Power Bank 10000mAh với sạc nhanh 22.5W, thiết kế nhỏ gọn, 2 cổng USB.",
                                new BigDecimal("450000"), new BigDecimal("390000"), 300, powerbank,
                                "https://images.unsplash.com/photo-1619131427655-41d993c130b3?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1619131427655-41d993c130b3?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Samsung Battery Pack 25W Wireless",
                                "Samsung Battery Pack 10000mAh với sạc không dây 25W, USB-C PD, thiết kế sang trọng.",
                                new BigDecimal("1190000"), new BigDecimal("990000"), 100, powerbank,
                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQoOTRfMODP0BU87BDCYafOOnMj9C_iGP0_Q&s",
                                Arrays.asList("https://m.media-amazon.com/images/I/41Z663R2oxL.jpg")));

                // Ốp lưng
                products.add(createProduct("Apple MagSafe Silicone Case iPhone 15 Pro Max",
                                "Ốp lưng silicone chính hãng Apple với MagSafe cho iPhone 15 Pro Max, nhiều màu sắc.",
                                new BigDecimal("1490000"), new BigDecimal("1290000"), 200, cases,
                                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("UAG Monarch iPhone 15 Pro Max",
                                "Ốp lưng UAG Monarch cao cấp cho iPhone 15 Pro Max, chống sốc tiêu chuẩn quân đội.",
                                new BigDecimal("1890000"), new BigDecimal("1590000"), 80, cases,
                                "https://images.unsplash.com/photo-1586776977607-310e9c725c37?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1586776977607-310e9c725c37?q=80&w=1000&auto=format&fit=crop")));

                // Đồng hồ thông minh
                products.add(createProduct("Apple Watch Series 9 GPS 45mm",
                                "Apple Watch Series 9 với chip S9, màn hình Always-On Retina, đo SpO2, ECG.",
                                new BigDecimal("11990000"), new BigDecimal("10990000"), 60, wearables,
                                "https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Samsung Galaxy Watch6 Classic 47mm",
                                "Galaxy Watch6 Classic với vòng bezel xoay, màn hình Super AMOLED, đo huyết áp.",
                                new BigDecimal("10490000"), new BigDecimal("8990000"), 50, wearables,
                                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1000&auto=format&fit=crop")));

                products.add(createProduct("Garmin Venu 3",
                                "Garmin Venu 3 với màn hình AMOLED sáng, theo dõi sức khỏe nâng cao, pin lên đến 14 ngày.",
                                new BigDecimal("12990000"), new BigDecimal("11990000"), 30, wearables,
                                "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1000&auto=format&fit=crop",
                                Arrays.asList("https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1000&auto=format&fit=crop")));

                return productRepository.saveAll(products);
        }

        private Category findCategoryByName(List<Category> categories, String name) {
                return categories.stream()
                                .filter(c -> c.getName().equals(name))
                                .findFirst()
                                .orElse(categories.get(0));
        }

        private Product createProduct(String name, String description, BigDecimal price,
                                      BigDecimal discountPrice, int stock, Category category,
                                      String thumbnail, List<String> images) {

                return productRepository.findByName(name)
                        .map(existing -> {
                                existing.setDescription(description);
                                existing.setPrice(price);
                                existing.setDiscountPrice(discountPrice);
                                existing.setCategory(category);
                                existing.setThumbnail(thumbnail);
                                existing.setImages(new ArrayList<>(images));
                                return existing;
                        })
                        .orElseGet(() -> Product.builder()
                                .name(name)
                                .description(description)
                                .price(price)
                                .discountPrice(discountPrice)
                                .stockQuantity(stock)
                                .category(category)
                                .thumbnail(thumbnail)
                                .images(new ArrayList<>(images))
                                .status(Product.ProductStatus.ACTIVE)
                                .averageRating(0.0)
                                .totalReviews(0)
                                .soldCount(random.nextInt(500) + 10)
                                .build());
        }

        private List<Order> seedOrders(List<User> users, List<Product> products) {
                log.info("Seeding orders...");
                List<Order> orders = new ArrayList<>();

                // Lọc customers
                List<User> customers = users.stream()
                        .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("CUSTOMER")))
                        .collect(java.util.stream.Collectors.toList());

                Order.OrderStatus[] statuses = {
                                Order.OrderStatus.PENDING,
                                Order.OrderStatus.CONFIRMED,
                                Order.OrderStatus.SHIPPING,
                                Order.OrderStatus.DELIVERED,
                                Order.OrderStatus.DELIVERED,
                                Order.OrderStatus.DELIVERED
                };

                for (int i = 0; i < 30; i++) {
                        User customer = customers.get(random.nextInt(customers.size()));
                        Order.OrderStatus status = statuses[random.nextInt(statuses.length)];

                        Order order = Order.builder()
                                        .orderCode("ORD" + System.currentTimeMillis() + i)
                                        .customer(customer)
                                        .shippingName(customer.getFullName())
                                        .shippingPhone(customer.getPhone())
                                        .shippingAddress(customer.getAddress())
                                        .shippingFee(new BigDecimal("30000"))
                                        .status(status)
                                        .note(random.nextBoolean() ? "Giao giờ hành chính" : null)
                                        .build();

                        order = orderRepository.save(order);

                        // Tạo order items
                        int itemCount = random.nextInt(3) + 1;
                        BigDecimal subtotal = BigDecimal.ZERO;
                        List<OrderItem> orderItems = new ArrayList<>();

                        for (int j = 0; j < itemCount; j++) {
                                Product product = products.get(random.nextInt(products.size()));
                                int quantity = random.nextInt(2) + 1;
                                BigDecimal unitPrice = product.getDiscountPrice() != null ? product.getDiscountPrice()
                                                : product.getPrice();
                                BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));

                                OrderItem item = OrderItem.builder()
                                                .order(order)
                                                .product(product)
                                                .productName(product.getName())
                                                .productThumbnail(product.getThumbnail())
                                                .quantity(quantity)
                                                .unitPrice(unitPrice)
                                                .totalPrice(totalPrice)
                                                .build();

                                orderItems.add(orderItemRepository.save(item));
                                subtotal = subtotal.add(totalPrice);
                        }

                        order.setItems(orderItems);
                        order.setSubtotal(subtotal);
                        BigDecimal tax = subtotal.multiply(new BigDecimal("0.1"));
                        order.setTaxAmount(tax);
                        order.setTotalAmount(subtotal.add(order.getShippingFee()).add(tax));

                        // Cập nhật timestamps theo status
                        if (status == Order.OrderStatus.CONFIRMED || status == Order.OrderStatus.PROCESSING
                                        || status == Order.OrderStatus.SHIPPING ||
                                        status == Order.OrderStatus.DELIVERED
                                        || status == Order.OrderStatus.COMPLETED) {
                                order.setConfirmedAt(LocalDateTime.now().minusDays(random.nextInt(5) + 3));
                        }
                        if (status == Order.OrderStatus.PROCESSING || status == Order.OrderStatus.SHIPPING ||
                                        status == Order.OrderStatus.DELIVERED
                                        || status == Order.OrderStatus.COMPLETED) {
                                order.setProcessingAt(LocalDateTime.now().minusDays(random.nextInt(4) + 2));
                        }
                        if (status == Order.OrderStatus.SHIPPING || status == Order.OrderStatus.DELIVERED
                                        || status == Order.OrderStatus.COMPLETED) {
                                order.setShippedAt(LocalDateTime.now().minusDays(random.nextInt(3) + 1));
                        }
                        if (status == Order.OrderStatus.DELIVERED || status == Order.OrderStatus.COMPLETED) {
                                order.setDeliveredAt(LocalDateTime.now().minusDays(random.nextInt(2)));
                        }
                        if (status == Order.OrderStatus.COMPLETED) {
                                order.setCompletedAt(LocalDateTime.now());
                        }
                        if (status == Order.OrderStatus.CANCELLED) {
                                order.setCancelledAt(LocalDateTime.now().minusDays(random.nextInt(2)));
                        }

                        order = orderRepository.save(order);

                        // Tạo payment
                        Payment payment = Payment.builder()
                                        .order(order)
                                        .amount(order.getTotalAmount())
                                        .method(random.nextBoolean() ? Payment.PaymentMethod.COD
                                                        : Payment.PaymentMethod.VNPAY)
                                        .status((status == Order.OrderStatus.DELIVERED
                                                        || status == Order.OrderStatus.COMPLETED)
                                                                        ? Payment.PaymentStatus.COMPLETED
                                                                        : Payment.PaymentStatus.PENDING)
                                        .build();

                        if (payment.getMethod() == Payment.PaymentMethod.VNPAY &&
                                        payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
                                payment.setTransactionId("VNP" + System.currentTimeMillis() + i);
                                payment.setPaidAt(LocalDateTime.now().minusDays(random.nextInt(5)));
                        }

                        paymentRepository.save(payment);
                        orders.add(order);
                }

                return orders;
        }

        private void seedReviews(List<User> users, List<Product> products, List<Order> orders) {
                log.info("Seeding reviews...");

                List<Order> deliveredOrders = orders.stream()
                        .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                        .collect(java.util.stream.Collectors.toList());

                String[] positiveComments = {
                                "Sản phẩm rất tốt, đúng mô tả. Giao hàng nhanh!",
                                "Chất lượng tuyệt vời, đóng gói cẩn thận.",
                                "Hàng chính hãng, rất hài lòng với sản phẩm này.",
                                "Dùng rất ổn định, pin trâu, camera đẹp.",
                                "Shop tư vấn nhiệt tình, sản phẩm đúng như quảng cáo.",
                                "Giá tốt, chất lượng tương xứng. Sẽ ủng hộ lần sau.",
                                "Máy đẹp, chạy mượt. Recommend cho mọi người!",
                                "Sản phẩm authentic 100%, rất yên tâm.",
                                "Giao hàng siêu nhanh, đóng gói kỹ lưỡng.",
                                "Mua lần 2 rồi, chất lượng vẫn như lần đầu."
                };

                String[] neutralComments = {
                                "Sản phẩm ổn, tạm được với giá tiền.",
                                "Chất lượng trung bình, giao hàng hơi lâu.",
                                "Dùng được, không có gì đặc biệt.",
                                "Hàng ok nhưng đóng gói chưa được cẩn thận lắm."
                };

                for (Order order : deliveredOrders) {
                        if (random.nextDouble() > 0.3) { // 70% orders có review
                                for (OrderItem item : order.getItems()) {
                                        if (random.nextDouble() > 0.4) { // 60% items được review
                                                int rating = random.nextInt(3) + 3; // Rating 3-5
                                                String comment;

                                                if (rating >= 4) {
                                                        comment = positiveComments[random
                                                                        .nextInt(positiveComments.length)];
                                                } else {
                                                        comment = neutralComments[random
                                                                        .nextInt(neutralComments.length)];
                                                }

                                                Review review = Review.builder()
                                                                .product(item.getProduct())
                                                                .customer(order.getCustomer())
                                                                .order(order)
                                                                .rating(rating)
                                                                .comment(comment)
                                                                .status(Review.ReviewStatus.ACTIVE)
                                                                .build();

                                                reviewRepository.save(review);

                                                // Cập nhật product rating
                                                Product product = item.getProduct();
                                                Double avgRating = reviewRepository
                                                                .calculateAverageRating(product.getId());
                                                Integer totalReviews = reviewRepository
                                                                .countActiveReviewsByProductId(product.getId());

                                                product.setAverageRating(avgRating != null ? avgRating : 0.0);
                                                product.setTotalReviews(totalReviews != null ? totalReviews : 0);
                                                productRepository.save(product);
                                        }
                                }
                        }
                }
        }
}
