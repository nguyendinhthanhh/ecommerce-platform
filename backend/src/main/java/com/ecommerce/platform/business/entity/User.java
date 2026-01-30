package com.ecommerce.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String fullName;
    
    private String phone;
    
    private String address;
    
    private String avatar;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // CUSTOMER, SELLER, ADMIN
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status; // ACTIVE, INACTIVE, BANNED
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = UserStatus.ACTIVE;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum Role {
        CUSTOMER, SELLER, ADMIN
    }
    
    public enum UserStatus {
        ACTIVE, INACTIVE, BANNED
    }
}
