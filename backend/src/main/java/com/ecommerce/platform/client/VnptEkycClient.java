package com.ecommerce.platform.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
@Component
@RequiredArgsConstructor
public class VnptEkycClient {

    private final RestTemplate restTemplate;

    @Value("${vnpt.ekyc.base-url}")
    private String baseUrl;

    @Value("${vnpt.ekyc.access-token}")
    private String accessToken;

    @Value("${vnpt.ekyc.token-id}")
    private String tokenId;

    @Value("${vnpt.ekyc.token-key}")
    private String tokenKey;

    @Value("${vnpt.ekyc.mac-address}")
    private String macAddress;

    private HttpHeaders headers() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.add("Token-id", tokenId);
        headers.add("Token-key", tokenKey);
        headers.add("mac-address", macAddress);
        return headers;
    }

    // ===== Upload file =====
    public String uploadFile(MultipartFile file) {
        try {
            String url = baseUrl + "/file-service/v1/addFile";

            HttpHeaders headers = headers();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("title", file.getOriginalFilename());
            body.add("description", "ekyc");
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, Map.class);

            Map object = (Map) response.getBody().get("object");
            return object.get("hash").toString();

        } catch (Exception e) {
            throw new RuntimeException("Upload file failed", e);
        }
    }

    // ===== Classify ID =====
    public Map classifyId(String imgHash, String clientSession) {
        Map<String, Object> body = Map.of(
                "img_card", imgHash,           // ← không phải "img"
                "token", tokenId,              // ← bắt buộc
                "client_session", clientSession // ← bắt buộc
        );
        return post("/ai/v1/classify/id", body);
    }

    // ===== Card Liveness =====
    public Map cardLiveness(String imgHash, String clientSession) {
        Map<String, Object> body = Map.of(
                "img", imgHash,
                "token", tokenId,
                "client_session", clientSession
        );
        return post("/ai/v1/card/liveness", body);
    }

    // ===== OCR =====
    public Map ocr(String frontHash, String backHash, String clientSession) {
        Map<String, Object> body = Map.of(
                "img_front", frontHash,
                "img_back", backHash,
                "token", tokenId,
                "client_session", clientSession
        );
        return post("/ai/v1/ocr/id", body);
    }

    // ===== Face Liveness =====
    public Map faceLiveness(String imgHash, String clientSession) {
        Map<String, Object> body = Map.of(
                "img", imgHash,            // ← "img_face" cho selfie
                "token", tokenId,
                "client_session", clientSession
        );
        return post("/ai/v1/face/liveness", body);
    }

    // ===== Face Compare =====
    public Map faceCompare(String frontHash, String selfieHash, String clientSession) {
        Map<String, Object> body = Map.of(
                "img_front", frontHash,
                "img_face", selfieHash,
                "token", tokenId,
                "client_session", clientSession
        );
        return post("/ai/v1/face/compare", body);
    }

    // ===== Generic POST JSON =====
    private Map post(String path, Map body) {
        String url = baseUrl + path;

        HttpHeaders headers = headers();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map> entity = new HttpEntity<>(body, headers);

        System.out.println("=== REQUEST URL: " + url);
        System.out.println("=== REQUEST BODY: " + body);

        Map response = restTemplate.postForObject(url, entity, Map.class);

        System.out.println("=== RESPONSE: " + response);

        return response;
    }
}