package com.ecommerce.platform.service;

import com.ecommerce.platform.entity.RefreshToken;
import com.ecommerce.platform.entity.User;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    RefreshToken verifyRefreshToken(String token);

    void revokeRefreshToken(String token);

    void revokeAllUserTokens(Long userId);
}
