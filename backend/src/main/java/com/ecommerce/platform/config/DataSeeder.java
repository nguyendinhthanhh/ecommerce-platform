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

        // Create Sellers
        User seller1 = User.builder()
                .email("seller1@ecommerce.com")
                .password(passwordEncoder.encode("seller123"))
                .fullName("Tech Store Owner")
                .phone("0901234567")
                .address("123 Tech Street, District 1, HCMC")
                .role(User.Role.SELLER)
                .status(User.UserStatus.ACTIVE)
                .build();
        seller1 = userRepository.save(seller1);

        User seller2 = User.builder()
                .email("seller2@ecommerce.com")
                .password(passwordEncoder.encode("seller123"))
                .fullName("Fashion Boutique Owner")
                .phone("0902345678")
                .address("456 Fashion Ave, District 3, HCMC")
                .role(User.Role.SELLER)
                .status(User.UserStatus.ACTIVE)
                .build();
        seller2 = userRepository.save(seller2);

        User seller3 = User.builder()
                .email("seller3@ecommerce.com")
                .password(passwordEncoder.encode("seller123"))
                .fullName("Home Decor Specialist")
                .phone("0903456789")
                .address("789 Home Blvd, District 7, HCMC")
                .role(User.Role.SELLER)
                .status(User.UserStatus.ACTIVE)
                .build();
        seller3 = userRepository.save(seller3);

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

        // Create Shops
        Shop techShop = Shop.builder()
                .name("TechZone Store")
                .description("Your one-stop shop for the latest technology and gadgets")
                .seller(seller1)
                .status(Shop.ShopStatus.ACTIVE)
                .address("123 Tech Street, District 1, HCMC")
                .phone("0901234567")
                .build();
        techShop = shopRepository.save(techShop);

        Shop fashionShop = Shop.builder()
                .name("StyleHub Boutique")
                .description("Trendy fashion for modern lifestyle")
                .seller(seller2)
                .status(Shop.ShopStatus.ACTIVE)
                .address("456 Fashion Ave, District 3, HCMC")
                .phone("0902345678")
                .build();
        fashionShop = shopRepository.save(fashionShop);

        Shop homeShop = Shop.builder()
                .name("Cozy Home Decor")
                .description("Beautiful home furnishings and decor")
                .seller(seller3)
                .status(Shop.ShopStatus.ACTIVE)
                .address("789 Home Blvd, District 7, HCMC")
                .phone("0903456789")
                .build();
        homeShop = shopRepository.save(homeShop);

        // Create Electronics Products
        List<Product> products = new ArrayList<>();

        products.add(Product.builder()
                .name("iPhone 15 Pro Max")
                .description("Latest Apple flagship with A17 Pro chip, titanium design, and advanced camera system. 256GB storage.")
                .price(new BigDecimal("29990000"))
                .discountPrice(new BigDecimal("27990000"))
                .stockQuantity(50)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg")
                .category(electronics)
                .shop(techShop)
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
                .shop(techShop)
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
                .shop(techShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("AirPods Pro 2")
                .description("Wireless earbuds with active noise cancellation, spatial audio, and USB-C charging.")
                .price(new BigDecimal("6490000"))
                .stockQuantity(100)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/54/289780/tai-nghe-bluetooth-airpods-pro-2-usb-c-charge-apple-mqd83-thumb-600x600.jpg")
                .category(electronics)
                .shop(techShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("iPad Air M2")
                .description("Powerful tablet with M2 chip, 11-inch Liquid Retina display, 128GB storage.")
                .price(new BigDecimal("16990000"))
                .discountPrice(new BigDecimal("15990000"))
                .stockQuantity(35)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/522/325536/ipad-air-11-inch-m2-wifi-blue-thumb-600x600.jpg")
                .category(electronics)
                .shop(techShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Sony WH-1000XM5")
                .description("Industry-leading noise canceling headphones with exceptional sound quality.")
                .price(new BigDecimal("8990000"))
                .discountPrice(new BigDecimal("7990000"))
                .stockQuantity(60)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/54/289525/tai-nghe-bluetooth-sony-wh-1000xm5-den-thumb-600x600.jpg")
                .category(electronics)
                .shop(techShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Apple Watch Series 9")
                .description("Advanced health and fitness tracking with always-on Retina display. 45mm GPS.")
                .price(new BigDecimal("11990000"))
                .stockQuantity(45)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/7077/309733/apple-watch-s9-45mm-vien-nhom-day-cao-su-thumb-600x600.jpg")
                .category(electronics)
                .shop(techShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Dell XPS 15")
                .description("Premium laptop with Intel Core i7, 16GB RAM, 512GB SSD, NVIDIA RTX 4050.")
                .price(new BigDecimal("42990000"))
                .stockQuantity(20)
                .thumbnail("https://cdn.tgdd.vn/Products/Images/44/321680/dell-xps-15-9530-i7-71013776-thumb-600x600.jpg")
                .category(electronics)
                .shop(techShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        // Fashion Products
        products.add(Product.builder()
                .name("Nike Air Max 270")
                .description("Comfortable running shoes with Max Air cushioning. Available in multiple colors.")
                .price(new BigDecimal("3590000"))
                .discountPrice(new BigDecimal("2990000"))
                .stockQuantity(80)
                .thumbnail("https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/e777c881-5b62-4250-92a6-362967f54cca/air-max-270-shoes-2V5C4p.png")
                .category(fashion)
                .shop(fashionShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Adidas Ultraboost 22")
                .description("Premium running shoes with Boost cushioning technology for ultimate comfort.")
                .price(new BigDecimal("4290000"))
                .discountPrice(new BigDecimal("3490000"))
                .stockQuantity(65)
                .thumbnail("https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg")
                .category(fashion)
                .shop(fashionShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Levi's 501 Original Jeans")
                .description("Classic straight fit jeans. 100% cotton denim. Timeless style.")
                .price(new BigDecimal("1890000"))
                .discountPrice(new BigDecimal("1490000"))
                .stockQuantity(120)
                .thumbnail("https://lsco.scene7.com/is/image/lsco/005010101-front-pdp?fmt=jpeg&qlt=70&resMode=bisharp&fit=crop,1&op_usm=0.6,0.6,8&wid=750&hei=1000")
                .category(fashion)
                .shop(fashionShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Uniqlo AIRism T-Shirt")
                .description("Breathable and quick-drying t-shirt. Perfect for everyday wear.")
                .price(new BigDecimal("290000"))
                .stockQuantity(200)
                .thumbnail("https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/455359/item/goods_09_455359.jpg")
                .category(fashion)
                .shop(fashionShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Ray-Ban Aviator Sunglasses")
                .description("Classic aviator sunglasses with UV protection. Iconic style.")
                .price(new BigDecimal("4590000"))
                .discountPrice(new BigDecimal("3990000"))
                .stockQuantity(55)
                .thumbnail("https://assets.ray-ban.com/is/image/RayBan/8056597625104__STD__shad__qt.png")
                .category(fashion)
                .shop(fashionShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("The North Face Backpack")
                .description("Durable 30L backpack with laptop compartment. Perfect for daily commute.")
                .price(new BigDecimal("2490000"))
                .stockQuantity(75)
                .thumbnail("https://images.thenorthface.com/is/image/TheNorthFace/NF0A3KV7_JK3_hero")
                .category(fashion)
                .shop(fashionShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        // Home & Living Products
        products.add(Product.builder()
                .name("IKEA POÄNG Armchair")
                .description("Comfortable armchair with layer-glued bent birch frame. Includes cushion.")
                .price(new BigDecimal("2990000"))
                .discountPrice(new BigDecimal("2490000"))
                .stockQuantity(40)
                .thumbnail("https://www.ikea.com/us/en/images/products/poaeng-armchair-birch-veneer-knisa-light-beige__0818181_pe774482_s5.jpg")
                .category(home)
                .shop(homeShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Philips Hue Smart Bulb")
                .description("Smart LED bulb with 16 million colors. Control with app or voice.")
                .price(new BigDecimal("890000"))
                .stockQuantity(150)
                .thumbnail("https://assets.philips.com/is/image/philipsconsumer/046677562984-IMS-en_US")
                .category(home)
                .shop(homeShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Dyson V15 Detect Vacuum")
                .description("Cordless vacuum with laser dust detection and LCD screen.")
                .price(new BigDecimal("18990000"))
                .discountPrice(new BigDecimal("16990000"))
                .stockQuantity(25)
                .thumbnail("https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/394470-01.png")
                .category(home)
                .shop(homeShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Nespresso Coffee Machine")
                .description("Compact espresso machine with 19-bar pressure. Includes milk frother.")
                .price(new BigDecimal("5490000"))
                .stockQuantity(50)
                .thumbnail("https://www.nespresso.com/ecom/medias/sys_master/public/13927890444318/C-D30-EU-BK-NE-H01-1000x1000.png")
                .category(home)
                .shop(homeShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        products.add(Product.builder()
                .name("Muji Aroma Diffuser")
                .description("Ultrasonic aroma diffuser with LED light. Creates relaxing atmosphere.")
                .price(new BigDecimal("790000"))
                .stockQuantity(90)
                .thumbnail("https://img.muji.net/img/item/4550344579664_1260.jpg")
                .category(home)
                .shop(homeShop)
                .status(Product.ProductStatus.ACTIVE)
                .build());

        // Save all products
        productRepository.saveAll(products);

        log.info("Data seeding completed!");
        log.info("Created {} products across {} categories", products.size(), categoryRepository.count());
        log.info("");
        log.info("=== Test Accounts ===");
        log.info("Admin:     admin@ecommerce.com / admin123");
        log.info("Seller 1:  seller1@ecommerce.com / seller123");
        log.info("Seller 2:  seller2@ecommerce.com / seller123");
        log.info("Seller 3:  seller3@ecommerce.com / seller123");
        log.info("Customer 1: customer1@ecommerce.com / customer123");
        log.info("Customer 2: customer2@ecommerce.com / customer123");
        log.info("====================");
    }
}
