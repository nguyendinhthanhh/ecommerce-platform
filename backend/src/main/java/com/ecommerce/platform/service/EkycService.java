package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.EkycVerifyRequest;
import com.ecommerce.platform.dto.response.EkycVerifyResponse;

public interface EkycService {
    EkycVerifyResponse verify(EkycVerifyRequest request, String email);

}
