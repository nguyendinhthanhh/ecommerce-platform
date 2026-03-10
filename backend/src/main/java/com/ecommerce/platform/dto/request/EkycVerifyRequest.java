package com.ecommerce.platform.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class EkycVerifyRequest {

    private MultipartFile cccdFront;
    private MultipartFile cccdBack;
    private MultipartFile selfie;

}