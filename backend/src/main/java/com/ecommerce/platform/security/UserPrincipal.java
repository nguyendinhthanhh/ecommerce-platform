package com.ecommerce.platform.security;

import com.ecommerce.platform.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private String role;
    private User.UserStatus status;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        // Map Roles and Permissions to Authorities
        java.util.Set<org.springframework.security.core.GrantedAuthority> authorities = new java.util.HashSet<>();

        // Add Role authorities (ROLE_ADMIN, ROLE_STAFF, etc.)
        for (com.ecommerce.platform.entity.Role role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
        }

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getRoles().isEmpty() ? "" : user.getRoles().iterator().next().getName(), // Primary role for legacy
                                                                                              // support
                user.getStatus(),
                authorities);
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != User.UserStatus.BANNED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == User.UserStatus.ACTIVE;
    }
}
