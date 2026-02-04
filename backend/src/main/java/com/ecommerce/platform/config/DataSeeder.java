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
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database đã có dữ liệu, bỏ qua seeding...");
            return;
        }

        log.info("Bắt đầu seed dữ liệu cho nền tảng E-commerce Điện tử...");

        List<User> users = seedUsers();
        List<Category> categories = seedCategories();
        List<Product> products = seedProducts(categories);
        List<Order> orders = seedOrders(users, products);
        seedReviews(users, products, orders);

        log.info("Hoàn thành seed dữ liệu!");
    }

    private List<User> seedUsers() {
        log.info("Seeding users...");
        List<User> users = new ArrayList<>();

        // Admin
        users.add(User.builder()
                .email("admin@techshop.vn")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("Quản trị viên")
                .phone("0901234567")
                .address("123 Nguyễn Huệ, Quận 1, TP.HCM")
                .role(User.Role.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .build());

        // Staff
        users.add(User.builder()
                .email("staff@techshop.vn")
                .password(passwordEncoder.encode("Staff@123"))
                .fullName("Nhân viên bán hàng")
                .phone("0902345678")
                .address("456 Lê Lợi,    Quận 1, TP.HCM")
                .role(User.Role.STAFF)
                .status(User.UserStatus.ACTIVE)
                .build());

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
            users.add(User.builder()
                    .email(email)
                    .password(passwordEncoder.encode("Customer@123"))
                    .fullName(customerNames[i])
                    .phone("090" + String.format("%07d", 3000000 + i))
                    .address(addresses[i])
                    .role(User.Role.CUSTOMER)
                    .status(User.UserStatus.ACTIVE)
                    .build());
        }

        return userRepository.saveAll(users);
    }

    private List<Category> seedCategories() {
        log.info("Seeding categories...");
        List<Category> categories = new ArrayList<>();

        // Danh mục cha
        Category smartphones = Category.builder()
                .name("Điện thoại")
                .description("Điện thoại thông minh các hãng")
                .image("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu_vZDCvtKXzGg1yMmlxGES88uI0g5v184hQ&s")
                .isActive(true)
                .build();
        smartphones = categoryRepository.save(smartphones);

        Category laptops = Category.builder()
                .name("Laptop")
                .description("Laptop văn phòng, gaming, đồ họa")
                .image("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSromBS1BYk6n4gOgl9FaZuaVUbO3oqt9X14g&s")
                .isActive(true)
                .build();
        laptops = categoryRepository.save(laptops);

        Category tablets = Category.builder()
                .name("Máy tính bảng")
                .description("iPad, máy tính bảng Android")
                .image("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvE8iRliz1GLaKcQvoq8YhDFHM0_6WKkpKTQ&s")
                .isActive(true)
                .build();
        tablets = categoryRepository.save(tablets);

        Category accessories = Category.builder()
                .name("Phụ kiện")
                .description("Phụ kiện điện thoại, laptop, tablet")
                .image("https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:100/plain/https://cellphones.com.vn/media/wysiwyg/phu-kien/phu-kien-dien-thoai-1.jpg")
                .isActive(true)
                .build();
        accessories = categoryRepository.save(accessories);

        Category audio = Category.builder()
                .name("Âm thanh")
                .description("Tai nghe, loa bluetooth, thiết bị âm thanh")
                .image("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyMPWouL7_ObTVftMWGNgTdqZkmzRV9kbGkw&s")
                .isActive(true)
                .build();
        audio = categoryRepository.save(audio);

        Category wearables = Category.builder()
                .name("Đồng hồ thông minh")
                .description("Smartwatch, đồng hồ thông minh các hãng")
                .image("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWT9D8-YY5fcUnYSN62aZT_Ach-UIWrHD7UA&s")
                .isActive(true)
                .build();
        wearables = categoryRepository.save(wearables);

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

    private Category createSubCategory(String name, String description, Category parent) {
        Category category = Category.builder()
                .name(name)
                .description(description)
                .parent(parent)
                .isActive(true)
                .build();
        return categoryRepository.save(category);
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
                "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:format(webp):quality(75)/2024_4_16_638488768365442895_6.jpg",
                Arrays.asList("https://cdn2.fptshop.com.vn/unsafe/800x0/iphone_15_pro_max_19_e4934e6e90.jpg", 
                        "https://tuannguyenmobile.com/wp-content/uploads/2024/05/z5458779032335_bf977155b0985c49542336c23e9bfbb0.jpg")));

        products.add(createProduct("iPhone 15 Pro 128GB",
                "iPhone 15 Pro với chip A17 Pro, màn hình 6.1 inch, camera chuyên nghiệp 48MP, khung titan bền bỉ.",
                new BigDecimal("28990000"), new BigDecimal("27490000"), 80, iphone,
                "https://cdn2.fptshop.com.vn/unsafe/828x0/filters:format(webp):quality(75)/2023_9_13_638301983456473055_VN_iPhone_15_Pro_Natural_Titanium_PDP_Image_Position-2_Design.jpg",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9_XPcDid9sZ6sKGbeWmtf7SYBrlMoBEEAFA&s")));

        products.add(createProduct("iPhone 15 128GB",
                "iPhone 15 với Dynamic Island, camera 48MP, chip A16 Bionic, thiết kế mới với mặt lưng kính nhám.",
                new BigDecimal("22990000"), new BigDecimal("21490000"), 100, iphone,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlWcl0it03cHs6rFHs2ec9sM5Uw36t1S3shg&s",
                Arrays.asList("https://ishop.gt/cdn/shop/files/IMG-10933066_314d34af-d4aa-4b2f-8af7-f41e1528d1f7.jpg?v=1718925694&width=823")));

        products.add(createProduct("iPhone 14 128GB",
                "iPhone 14 với chip A15 Bionic, màn hình Super Retina XDR 6.1 inch, hệ thống camera kép 12MP.",
                new BigDecimal("17990000"), new BigDecimal("16490000"), 120, iphone,
                "https://cdn.tgdd.vn/Products/Images/42/240259/iPhone-14-plus-thumb-xanh-600x600.jpg",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMEKylPyXW8x3J_qImu5vkV4WcGQu3mag-FQ&s")));

        // Samsung
        products.add(createProduct("Samsung Galaxy S24 Ultra 256GB",
                "Galaxy S24 Ultra với bút S Pen, chip Snapdragon 8 Gen 3, màn hình Dynamic AMOLED 2X 6.8 inch, camera 200MP.",
                new BigDecimal("33990000"), new BigDecimal("31990000"), 60, samsung,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToFOf7kK1Xnok6xGPkeOwkiwx9L6UaMnND7Q&s",
                Arrays.asList("https://www.didongmy.com/vnt_upload/product/01_2024/samsung_galaxy_s24_ultra_5g_vang_didongmy_thumb_600x600_1.jpg")));

        products.add(createProduct("Samsung Galaxy S24+ 256GB",
                "Galaxy S24+ với chip Snapdragon 8 Gen 3, màn hình 6.7 inch, camera 50MP, hỗ trợ Galaxy AI.",
                new BigDecimal("26990000"), new BigDecimal("24990000"), 75, samsung,
                "https://cdn.techshop.vn/products/samsung-s24-plus.jpg",
                Arrays.asList("https://cdn.techshop.vn/products/samsung-s24-plus-1.jpg")));

        products.add(createProduct("Samsung Galaxy Z Fold5 256GB",
                "Galaxy Z Fold5 điện thoại gập với màn hình chính 7.6 inch, màn hình phụ 6.2 inch, chip Snapdragon 8 Gen 2.",
                new BigDecimal("41990000"), new BigDecimal("38990000"), 30, samsung,
                "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/a/galaxy-s24-plus-den.png",
                Arrays.asList("https://cdn-v2.didongviet.vn/files/products/2024/0/18/1/1705512523638_samsung_galaxy_s24_plus_vang_didongviet.png")));

        products.add(createProduct("Samsung Galaxy A54 5G 128GB",
                "Galaxy A54 5G với chip Exynos 1380, màn hình Super AMOLED 6.4 inch, camera 50MP, chống nước IP67.",
                new BigDecimal("10990000"), new BigDecimal("9490000"), 150, samsung,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMMw9GLaEaWDAvt5TEFYjsL5Na6yUv2k_PoA&s",
                Arrays.asList("https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-a54-8gb-256gb.png")));

        // Xiaomi
        products.add(createProduct("Xiaomi 14 Ultra 512GB",
                "Xiaomi 14 Ultra với camera Leica, chip Snapdragon 8 Gen 3, màn hình AMOLED 6.73 inch 120Hz.",
                new BigDecimal("29990000"), new BigDecimal("27990000"), 40, xiaomi,
                "https://cdn.techshop.vn/products/xiaomi-14-ultra.jpg",
                Arrays.asList("https://cdn.techshop.vn/products/xiaomi-14-ultra-1.jpg")));

        products.add(createProduct("Xiaomi 14 256GB",
                "Xiaomi 14 với camera Leica, chip Snapdragon 8 Gen 3, màn hình AMOLED 6.36 inch, sạc nhanh 90W.",
                new BigDecimal("18990000"), new BigDecimal("17490000"), 70, xiaomi,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThau8nMexAGQ4KmmU1BqqTjplLDZim1Ueplg&s",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjbzGh9UtEn-UpPhwxUJNWV0HUJjOYu5wXig&s")));

        products.add(createProduct("Redmi Note 13 Pro+ 5G 256GB",
                "Redmi Note 13 Pro+ với camera 200MP, màn hình AMOLED cong 6.67 inch 120Hz, sạc nhanh 120W.",
                new BigDecimal("11990000"), new BigDecimal("10990000"), 200, xiaomi,
                "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-redmi-note-13-pro-plus_5_.png",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThKXx65d51XpNXD--F__Dhy-8GFcOupX910A&s")));

        // MacBook
        products.add(createProduct("MacBook Pro 14 M3 Pro 512GB",
                "MacBook Pro 14 inch với chip M3 Pro, RAM 18GB, màn hình Liquid Retina XDR, thời lượng pin lên đến 17 giờ.",
                new BigDecimal("52990000"), new BigDecimal("49990000"), 25, macbook,
                "https://cdn.tgdd.vn/Products/Images/44/322359/apple-macbook-pro-14-inch-m3-pro-2023-silver-1-750x500.jpg",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQT6DoCK_zAJD3vGfYBtmx2dSn6stToC00IA&s")));

        products.add(createProduct("MacBook Air 15 M3 256GB",
                "MacBook Air 15 inch với chip M3, thiết kế siêu mỏng, màn hình Liquid Retina, pin cả ngày.",
                new BigDecimal("37990000"), new BigDecimal("35990000"), 35, macbook,
                "https://cdn.techshop.vn/products/macbook-air-15-m3.jpg",
                Arrays.asList("https://cdn.techshop.vn/products/macbook-air-15-m3-1.jpg")));

        products.add(createProduct("MacBook Air 13 M2 256GB",
                "MacBook Air 13 inch với chip M2, thiết kế mỏng nhẹ, màn hình Liquid Retina, không quạt tản nhiệt.",
                new BigDecimal("27990000"), new BigDecimal("25990000"), 45, macbook,
                "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-air-m3-15-inch-2024_1_.png",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgJI2JrVW2RpymCnCroeVVc1S5N-hnOhV2Yg&s")));

        // Dell
        products.add(createProduct("Dell XPS 15 9530 Core i7",
                "Dell XPS 15 với Intel Core i7-13700H, RAM 16GB, SSD 512GB, màn hình OLED 3.5K 15.6 inch.",
                new BigDecimal("45990000"), new BigDecimal("42990000"), 20, dell,
                "https://cdn.techshop.vn/products/dell-xps-15.jpg",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpXfUDRe6P02i1ERG4wxFlNvhHAccJZKOM6A&s")));

        products.add(createProduct("Dell Inspiron 15 3520",
                "Dell Inspiron 15 với Intel Core i5-1235U, RAM 8GB, SSD 512GB, màn hình FHD 15.6 inch.",
                new BigDecimal("15990000"), new BigDecimal("14490000"), 60, dell,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYIV3NYrS7zeOBD7mGLu5305ky5Ss45qjlvg&s",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0DRtlo6Mfa-HewvrgEs85DaerjgB2Ujwyag&s")));

        // ASUS
        products.add(createProduct("ASUS ROG Strix G16 RTX 4060",
                "ASUS ROG Strix G16 Gaming với Intel Core i7-13650HX, RTX 4060 8GB, RAM 16GB, màn hình 165Hz.",
                new BigDecimal("35990000"), new BigDecimal("33990000"), 25, asus,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR95RKQ86BFVnAqznsQOn3YjULb0bxRydDaJg&s",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7IXjmdLNQ7uCBPhBYf75CnUVtuyL9gvUDlw&s")));

        products.add(createProduct("ASUS Vivobook 15 OLED",
                "ASUS Vivobook 15 với AMD Ryzen 7 7730U, RAM 16GB, SSD 512GB, màn hình OLED FHD 15.6 inch.",
                new BigDecimal("18990000"), new BigDecimal("17490000"), 50, asus,
                "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/328950/asus-vivobook-15-oled-a1505va-i9-ma586ws-170225-112950-659-600x600.jpg",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP4nQ_NVuZymaqqVhqpHSsrskPTWTYe4Di2w&s")));

        // Tablets
        products.add(createProduct("iPad Pro M4 11 inch 256GB WiFi",
                "iPad Pro 11 inch với chip M4, màn hình Ultra Retina XDR, hỗ trợ Apple Pencil Pro.",
                new BigDecimal("28990000"), new BigDecimal("27490000"), 40, tablets,
                "https://cdn.techshop.vn/products/ipad-pro-m4-11.jpg",
                Arrays.asList("https://cdn.techshop.vn/products/ipad-pro-m4-11-1.jpg")));

        products.add(createProduct("iPad Air M2 11 inch 128GB WiFi",
                "iPad Air 11 inch với chip M2, màn hình Liquid Retina, hỗ trợ Apple Pencil Pro.",
                new BigDecimal("18990000"), new BigDecimal("17990000"), 55, tablets,
                "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/ipad-pro-m5.jpg",
                Arrays.asList("https://clickbuy.com.vn/uploads/images/tin%20tuc/Nam/ipad-pro-m5-13-inch-5g.jpg")));

        products.add(createProduct("Samsung Galaxy Tab S9 FE 128GB WiFi",
                "Galaxy Tab S9 FE với chip Exynos 1380, màn hình 10.9 inch, bút S Pen, chống nước IP68.",
                new BigDecimal("12490000"), new BigDecimal("11490000"), 70, tablets,
                "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-tab-s9-fe-plus-wifi_1_.png",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGrQ2kC0xyBwAr-qFpuHV8N1OoSkbF2kzpoA&s")));

        // Tai nghe Bluetooth
        products.add(createProduct("AirPods Pro 2 USB-C",
                "AirPods Pro thế hệ 2 với cổng USB-C, chống ồn chủ động, âm thanh không gian, chip H2.",
                new BigDecimal("6790000"), new BigDecimal("5990000"), 100, earphones,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKRABQXX-8K_zyxsKxVdO-tACvBkWi0COl_g&s",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8ZM1JYFKNuMfeC_g6cIPPqNcU-DdnJMJj7A&s")));

        products.add(createProduct("Samsung Galaxy Buds2 Pro",
                "Galaxy Buds2 Pro với chống ồn chủ động thông minh, âm thanh Hi-Fi 24bit, chống nước IPX7.",
                new BigDecimal("4990000"), new BigDecimal("3990000"), 120, earphones,
                "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-buds-2-pro-thumb.png",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnB5cHnVaBPv2j5Ns8_L3uCsI52vMBXzl1BA&s")));

        products.add(createProduct("Sony WF-1000XM5",
                "Sony WF-1000XM5 với chống ồn hàng đầu thế giới, âm thanh Hi-Res, pin 8 giờ.",
                new BigDecimal("7490000"), new BigDecimal("6490000"), 50, earphones,
                "https://cdn.tgdd.vn/Products/Images/2162/286271/bluetooth-jbl-flip-6-2-750x500.jpg",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9uN1hEFnFH2tp6ePZ868AiV4SWSDhWDWdiQ&s")));

        // Loa Bluetooth
        products.add(createProduct("JBL Flip 6",
                "JBL Flip 6 với công suất 30W, chống nước IP67, pin 12 giờ, kết nối PartyBoost.",
                new BigDecimal("2990000"), new BigDecimal("2490000"), 80, speakers,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0J-cH3DQrNriXk5YFzwwqPmNuc9U3hsfVDw&s",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnuSiaRXtt09KaNHAqPoWYWYCgeiuiWnDgSg&s")));

        products.add(createProduct("Harman Kardon Onyx Studio 8",
                "Harman Kardon Onyx Studio 8 với âm thanh cao cấp, thiết kế sang trọng, pin 8 giờ.",
                new BigDecimal("6990000"), new BigDecimal("5990000"), 30, speakers,
                "https://cdn.tgdd.vn/Products/Images/2162/293654/loa-bluetooth-harman-kardon-onyx-studio-8-1-750x500.jpg",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5qGICkxDAv_6yGs-mza3VPvJGH-5_86ICOA&s")));

        // Sạc dự phòng
        products.add(createProduct("Anker PowerCore 20000mAh PD 65W",
                "Anker PowerCore với dung lượng 20000mAh, sạc nhanh PD 65W, có thể sạc laptop.",
                new BigDecimal("1490000"), new BigDecimal("1290000"), 150, powerbank,
                "https://cdn2.cellphones.com.vn/x/media/catalog/product/1/2/12312313124_1.jpg",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI__Ti1veDeCpgDnvIXxTDeElvzv2rCuGiew&s")));

        products.add(createProduct("Xiaomi Power Bank 3 10000mAh 22.5W",
                "Xiaomi Power Bank 10000mAh với sạc nhanh 22.5W, thiết kế nhỏ gọn, 2 cổng USB.",
                new BigDecimal("450000"), new BigDecimal("390000"), 300, powerbank,
                "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/p/i/pin-sac-du-phong-xiaomi-power-bank-3-10000mah-ultra-compact_1_.png",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUFx87md-6CNiePe5tnF9axd879SqDP6Jfmg&s")));

        products.add(createProduct("Samsung Battery Pack 25W Wireless",
                "Samsung Battery Pack 10000mAh với sạc không dây 25W, USB-C PD, thiết kế sang trọng.",
                new BigDecimal("1190000"), new BigDecimal("990000"), 100, powerbank,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQoOTRfMODP0BU87BDCYafOOnMj9C_iGP0_Q&s",
                Arrays.asList("https://m.media-amazon.com/images/I/41Z663R2oxL.jpg")));

        // Ốp lưng
        products.add(createProduct("Apple MagSafe Silicone Case iPhone 15 Pro Max",
                "Ốp lưng silicone chính hãng Apple với MagSafe cho iPhone 15 Pro Max, nhiều màu sắc.",
                new BigDecimal("1490000"), new BigDecimal("1290000"), 200, cases,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsonK_ltG3u5qfRu1bNY19hDbUjABkczylsA&s",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiAacRjCV9LpPkqVlkpCgZmmphurlqlRY9yQ&s")));

        products.add(createProduct("UAG Monarch iPhone 15 Pro Max",
                "Ốp lưng UAG Monarch cao cấp cho iPhone 15 Pro Max, chống sốc tiêu chuẩn quân đội.",
                new BigDecimal("1890000"), new BigDecimal("1590000"), 80, cases,
                "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/o/p/op-lung-iphone-15-pro-max-uag-monarch-carbon-fiber_1_.png",
                Arrays.asList("https://m.media-amazon.com/images/I/71LTGS2eD+L._AC_UF894,1000_QL80_.jpg")));

        // Đồng hồ thông minh
        products.add(createProduct("Apple Watch Series 9 GPS 45mm",
                "Apple Watch Series 9 với chip S9, màn hình Always-On Retina, đo SpO2, ECG.",
                new BigDecimal("11990000"), new BigDecimal("10990000"), 60, wearables,
                "https://cdn.tgdd.vn/Products/Images/7077/316002/apple-watch-s9-vien-nhom-day-the-thao-bac-tb-600x600.jpg",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf5_J9xETwMjsyH55TajLqaNkIVI_x5DMq4w&s")));

        products.add(createProduct("Samsung Galaxy Watch6 Classic 47mm",
                "Galaxy Watch6 Classic với vòng bezel xoay, màn hình Super AMOLED, đo huyết áp.",
                new BigDecimal("10490000"), new BigDecimal("8990000"), 50, wearables,
                "https://cdn.tgdd.vn/Products/Images/7077/310858/samsung-galaxy-watch6-classic-47mm-bac-1-750x500.png",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRClSUlC_YrC4xegekv5QX2Re66LWsoYZxKTQ&s")));

        products.add(createProduct("Garmin Venu 3",
                "Garmin Venu 3 với màn hình AMOLED sáng, theo dõi sức khỏe nâng cao, pin lên đến 14 ngày.",
                new BigDecimal("12990000"), new BigDecimal("11990000"), 30, wearables,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm1YZVAvkZ7XZVULYbhmZo5hr9wScRDbf8vA&s",
                Arrays.asList("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC9u5_jS09jvhIlghVdFS1UIZ4SgOUEwrHQQ&s")));

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
        return Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .discountPrice(discountPrice)
                .stockQuantity(stock)
                .category(category)
                .thumbnail(thumbnail)
                .images(images)
                .status(Product.ProductStatus.ACTIVE)
                .averageRating(0.0)
                .totalReviews(0)
                .soldCount(random.nextInt(500) + 10)
                .build();
    }

    private List<Order> seedOrders(List<User> users, List<Product> products) {
        log.info("Seeding orders...");
        List<Order> orders = new ArrayList<>();

        // Lọc customers
        List<User> customers = users.stream()
                .filter(u -> u.getRole() == User.Role.CUSTOMER)
                .toList();

        Order.OrderStatus[] statuses = {
                Order.OrderStatus.PLACED,
                Order.OrderStatus.CONFIRMED,
                Order.OrderStatus.SHIPPED,
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
                BigDecimal unitPrice = product.getDiscountPrice() != null ? 
                        product.getDiscountPrice() : product.getPrice();
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
            order.setTotalAmount(subtotal.add(order.getShippingFee()));

            // Cập nhật timestamps theo status
            if (status == Order.OrderStatus.CONFIRMED || status == Order.OrderStatus.SHIPPED || 
                status == Order.OrderStatus.DELIVERED) {
                order.setConfirmedAt(LocalDateTime.now().minusDays(random.nextInt(5) + 1));
            }
            if (status == Order.OrderStatus.SHIPPED || status == Order.OrderStatus.DELIVERED) {
                order.setShippedAt(LocalDateTime.now().minusDays(random.nextInt(3)));
            }
            if (status == Order.OrderStatus.DELIVERED) {
                order.setDeliveredAt(LocalDateTime.now().minusDays(random.nextInt(2)));
            }

            order = orderRepository.save(order);

            // Tạo payment
            Payment payment = Payment.builder()
                    .order(order)
                    .amount(order.getTotalAmount())
                    .method(random.nextBoolean() ? Payment.PaymentMethod.COD : Payment.PaymentMethod.VNPAY)
                    .status(status == Order.OrderStatus.DELIVERED ? 
                            Payment.PaymentStatus.COMPLETED : Payment.PaymentStatus.PENDING)
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

        List<User> customers = users.stream()
                .filter(u -> u.getRole() == User.Role.CUSTOMER)
                .toList();

        List<Order> deliveredOrders = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .toList();

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
                            comment = positiveComments[random.nextInt(positiveComments.length)];
                        } else {
                            comment = neutralComments[random.nextInt(neutralComments.length)];
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
                        Double avgRating = reviewRepository.calculateAverageRating(product.getId());
                        Integer totalReviews = reviewRepository.countActiveReviewsByProductId(product.getId());

                        product.setAverageRating(avgRating != null ? avgRating : 0.0);
                        product.setTotalReviews(totalReviews != null ? totalReviews : 0);
                        productRepository.save(product);
                    }
                }
            }
        }
    }
}
