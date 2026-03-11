package com.ecommerce.platform.dto.response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EkycVerifyResponse {

    private String name;
    private String idNumber;
    private String birthDay;
    private String address;
    private String gender;

    private double faceMatchScore;

    private boolean verified;

}