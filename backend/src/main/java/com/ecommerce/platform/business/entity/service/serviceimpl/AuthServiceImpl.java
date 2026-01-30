package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.dto.request.LoginRequest;
import com.ecommerce.platform.dto.request.RefreshTokenRequest;
import com.ecommerce.platform.dto.request.RegisterRequest;
import com.ecommerce.platform.dto.response.AuthResponse;
import com.ecommerce.platform.dto.response.TokenResponse;
import com.ecommerce.platform.dto.response.UserResponse;
import com.ecommerce.platform.entity.RefreshToken;
import com.ecommerce.platform.entity.User;
import com.ecommerce.platform.exception.BadRequestException;
import com.ecommerce.platform.exception.ResourceNotFoundException;
import com.ecommerce.platform.mapper.UserMapper;
import com.ecommerce.platform.repository.UserRepository;
import com.ecommerce.platform.security.JwtTokenProvider;
import com.ecommerce.platform.service.AuthService;
import com.ecommerce.platform.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final RefreshTokenService refreshTokenService;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String accessToken = tokenProvider.generateAccessToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.of(
                accessToken,
                refreshToken.getToken(),
                accessTokenExpiration / 1000,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name()
        );
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User.Role role = User.Role.CUSTOMER;
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
                if (role == User.Role.ADMIN) {
                    throw new BadRequestException("Cannot register as admin");
                }
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + request.getRole());
            }
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setStatus(User.UserStatus.ACTIVE);
        user = userRepository.save(user);

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.of(
                accessToken,
                refreshToken.getToken(),
                accessTokenExpiration / 1000,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name()
        );
    }

    @Override
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());
        User user = refreshToken.getUser();

        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

        return TokenResponse.of(newAccessToken, refreshToken.getToken(), accessTokenExpiration / 1000);
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return userMapper.toResponse(user);
    }
}
