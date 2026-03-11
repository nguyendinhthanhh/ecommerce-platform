package com.ecommerce.platform;

import com.ecommerce.platform.ai.service.EmbeddingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EcommerceBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner embedData(EmbeddingService embeddingService) {
        return args -> {
            embeddingService.embedAllProducts();
        };
    }

    @Bean
    CommandLineRunner fixDatabaseConstraints(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                // Drop the constraint that prevents the new PROCESSING status
                jdbcTemplate.execute("ALTER TABLE \"ecommerce-platform\".payments DROP CONSTRAINT IF EXISTS payments_status_check;");
                System.out.println("Successfully dropped payments_status_check constraint.");
            } catch (Exception e) {
                System.err.println("Notice: Could not drop constraint (might not exist): " + e.getMessage());
            }
        };
    }
}
