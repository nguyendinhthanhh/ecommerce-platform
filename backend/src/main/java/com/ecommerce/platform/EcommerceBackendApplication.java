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
}

