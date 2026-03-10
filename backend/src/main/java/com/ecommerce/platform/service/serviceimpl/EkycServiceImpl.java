package com.ecommerce.platform.service.serviceimpl;

import com.ecommerce.platform.client.VnptEkycClient;
import com.ecommerce.platform.dto.request.EkycVerifyRequest;
import com.ecommerce.platform.dto.response.EkycVerifyResponse;
import com.ecommerce.platform.entity.EkycResultEntity;
import com.ecommerce.platform.repository.EkycRepository;
import com.ecommerce.platform.service.EkycService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EkycServiceImpl implements EkycService {

    private final VnptEkycClient vnptClient;
    private final EkycRepository ekycRepository;

    @Override
    public EkycVerifyResponse verify(EkycVerifyRequest request) {
        try {
            String clientSession = java.util.UUID.randomUUID().toString();

            // 1. Upload files
            String frontHash = vnptClient.uploadFile(request.getCccdFront());
            String backHash = vnptClient.uploadFile(request.getCccdBack());
            String selfieHash = vnptClient.uploadFile(request.getSelfie());

            // 2. Classify ID
            Map classifyResponse = vnptClient.classifyId(frontHash, clientSession);

            // 3. Card Liveness
            Map cardResponse = vnptClient.cardLiveness(frontHash, clientSession);

            // 4. OCR
            Map ocrResponse = vnptClient.ocr(frontHash, backHash, clientSession);

            // 5. Face Liveness
            Map faceLiveResponse = vnptClient.faceLiveness(selfieHash, clientSession);

            // 6. Face Compare
            Map compareResponse = vnptClient.faceCompare(frontHash, selfieHash, clientSession);

            // Parse results (log ra trước để xem cấu trúc thực tế)
            System.out.println("=== OCR: " + ocrResponse);
            System.out.println("=== CARD LIVENESS: " + cardResponse);
            System.out.println("=== FACE LIVENESS: " + faceLiveResponse);
            System.out.println("=== FACE COMPARE: " + compareResponse);

            // TODO: parse đúng cấu trúc sau khi xem log
            Map ocrData = (Map) ocrResponse.get("object");
            String name = ocrData != null ? String.valueOf(ocrData.get("name")) : "";
            String idNumber = ocrData != null ? String.valueOf(ocrData.get("id")) : "";
            String birthDay = ocrData != null ? String.valueOf(ocrData.get("birth_day")) : "";
            String address = ocrData != null ? String.valueOf(ocrData.get("origin_location")) : "";
            String gender = ocrData != null ? String.valueOf(ocrData.get("gender")) : "";

            Map compareData = (Map) compareResponse.get("object");

            double score = 0;

            if (compareData != null) {
                Object prob = compareData.get("prob");
                if (prob != null) {
                    score = Double.parseDouble(prob.toString());
                }
            }

            boolean verified = score >= 85;

            System.out.println("Face score = " + score);
            System.out.println("Verified = " + verified);

            // Save to DB
            EkycResultEntity result = new EkycResultEntity();
            result.setName(name);
            result.setGender(gender);
            result.setIdNumber(idNumber);
            result.setBirthDay(birthDay);
            result.setAddress(address);
            result.setFaceMatchScore(score);
            result.setVerified(verified);
            ekycRepository.save(result);

            return EkycVerifyResponse.builder()
                    .name(name)
                    .idNumber(idNumber)
                    .birthDay(birthDay)
                    .address(address)
                    .gender(gender)
                    .faceMatchScore(score)
                    .verified(verified)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("eKYC verification failed", e);
        }
    }
}