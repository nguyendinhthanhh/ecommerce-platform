package com.ecommerce.platform.config;

import com.ecommerce.platform.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ============================================
                        // PUBLIC ENDPOINTS (Guest có thể truy cập)
                        // ============================================

                        // Swagger UI & Payment callback
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html", "/api/payment/**").permitAll()

                        // Authentication endpoints
                        .requestMatchers("/api/auth/**").permitAll()

                        // Email check (for registration validation)
                        .requestMatchers(HttpMethod.GET, "/api/users/check-email").permitAll()

                        // ============================================
                        // PRODUCTS - Public Read Access (như Shopee)
                        // ============================================
                        .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/category/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/top-selling").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/newest").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/chatbot/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/*").permitAll() // Product detail

                        // ============================================
                        // CATEGORIES - Public Read Access
                        // ============================================
                        .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/*/products").permitAll()

                        // ============================================
                        // REVIEWS - Public Read Access (Guest xem được reviews)
                        // ============================================
                        .requestMatchers(HttpMethod.GET, "/api/reviews/product/**").permitAll() // Reviews by product
                        .requestMatchers(HttpMethod.GET, "/api/reviews/*/statistics").permitAll() // Review statistics
                        .requestMatchers(HttpMethod.GET, "/api/reviews/check-eligibility/**").permitAll() // Check eligibility (returns different response for guest vs logged in)
                        .requestMatchers(HttpMethod.GET, "/api/reviews/*").permitAll() // Review detail

                        // ============================================
                        // AUTHENTICATED USER ACTIONS
                        // ============================================

                        // Cart - Requires login (all roles including ADMIN)
                        .requestMatchers("/api/cart/**").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")

                        // Orders - Requires login (all roles)
                        .requestMatchers(HttpMethod.POST, "/api/orders").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/orders/my-orders").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/orders/*").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/cancel").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")

                        // Reviews - Write/Update/Delete requires login (all roles)
                        .requestMatchers(HttpMethod.GET, "/api/reviews/my-reviews").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reviews/can-review").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/reviews").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/*").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/*").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/reviews/*/report").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")

                        // User profile management (all roles)
                        .requestMatchers("/api/users/me/**").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")

                        // ============================================
                        // STAFF/ADMIN ENDPOINTS
                        // ============================================

                        // Product Management (Staff/Admin)
                        .requestMatchers("/api/products/management/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/*").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/*").hasAnyRole("STAFF", "ADMIN")

                        // Order Management (Staff/Admin)
                        .requestMatchers("/api/orders/management").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/*/status").hasAnyRole("STAFF", "ADMIN")

                        // Review Management (Staff/Admin)
                        .requestMatchers(HttpMethod.GET, "/api/reviews/management").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reviews/customer/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/reviews/*/status").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/*/reply").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/*/dismiss-report").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/admin/*").hasRole("ADMIN")

                        // Category Management (Admin only)
                        .requestMatchers(HttpMethod.POST, "/api/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/*").hasRole("ADMIN")

                        // Admin endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // All other requests need authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
