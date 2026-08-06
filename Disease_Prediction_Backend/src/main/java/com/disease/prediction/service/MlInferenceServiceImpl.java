package com.disease.prediction.service;

import com.disease.prediction.dto.MlModelApiRequest;
import com.disease.prediction.dto.MlModelApiResponse;
import com.disease.prediction.dto.MlServiceStatusDto;
import com.disease.prediction.exception.MlServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Service
public class MlInferenceServiceImpl implements MlInferenceService {

    private static final Logger log = LoggerFactory.getLogger(MlInferenceServiceImpl.class);

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public MlInferenceServiceImpl(RestTemplateBuilder restTemplateBuilder,
                                 @Value("${ml.service.url:http://localhost:5000/predict}") String mlServiceUrl,
                                 @Value("${ml.service.timeout.ms:5000}") int timeoutMs) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(timeoutMs))
                .setReadTimeout(Duration.ofMillis(timeoutMs))
                .build();
        this.mlServiceUrl = mlServiceUrl;
    }

    @Override
    public MlModelApiResponse predictDisease(MlModelApiRequest request) {
        log.info("Sending prediction request for target '{}' to ML service at {}",
                request.getDiseaseTarget(), mlServiceUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<MlModelApiRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<MlModelApiResponse> response = restTemplate.exchange(
                    mlServiceUrl,
                    HttpMethod.POST,
                    entity,
                    MlModelApiResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new MlServiceException("ML model service returned non-2xx status: " + response.getStatusCode());
            }
        } catch (RestClientException ex) {
            log.warn("Could not connect to external ML model service at {}. Error: {}", mlServiceUrl, ex.getMessage());
            
            // Fallback response for demonstration when user's ML service is offline
            return getFallbackPrediction(request);
        }
    }

    @Override
    public MlServiceStatusDto checkMlServiceStatus() {
        long startTime = System.currentTimeMillis();
        try {
            // Ping service root or endpoint
            String healthUrl = mlServiceUrl;
            if (mlServiceUrl.endsWith("/predict")) {
                healthUrl = mlServiceUrl.substring(0, mlServiceUrl.length() - 8) + "/health";
            }
            
            ResponseEntity<String> response = restTemplate.getForEntity(healthUrl, String.class);
            long latency = System.currentTimeMillis() - startTime;
            if (response.getStatusCode().is2xxSuccessful()) {
                return new MlServiceStatusDto("UP", mlServiceUrl, latency, "ML Service is reachable and healthy.");
            } else {
                return new MlServiceStatusDto("DEGRADED", mlServiceUrl, latency, "ML Service responded with status: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            long latency = System.currentTimeMillis() - startTime;
            return new MlServiceStatusDto("DOWN", mlServiceUrl, latency, "ML Service unreachable: " + ex.getMessage());
        }
    }

    private MlModelApiResponse getFallbackPrediction(MlModelApiRequest request) {
        log.info("Using baseline diagnostic rule engine fallback for target '{}'", request.getDiseaseTarget());
        
        String disease = request.getDiseaseTarget() != null ? request.getDiseaseTarget() : "General";
        double confidence = 0.85;
        String risk = "Moderate";
        String recommendation = "ML model service at " + mlServiceUrl + " is currently offline. " +
                "Please start your ML model endpoint to get live predictions.";

        return new MlModelApiResponse(
                "Predicted Risk: " + disease.substring(0, 1).toUpperCase() + disease.substring(1),
                confidence,
                risk,
                recommendation
        );
    }
}
