package com.disease.prediction.service;

import com.disease.prediction.dto.MlModelApiRequest;
import com.disease.prediction.dto.MlModelApiResponse;
import com.disease.prediction.dto.MlServiceStatusDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class MlInferenceServiceTest {

    private MlInferenceServiceImpl mlInferenceService;

    @BeforeEach
    public void setUp() {
        RestTemplateBuilder builder = new RestTemplateBuilder();
        mlInferenceService = new MlInferenceServiceImpl(builder, "http://localhost:5000/predict", 1000);
    }

    @Test
    public void testPredictDisease_FallbackWhenServiceOffline() {
        MlModelApiRequest request = new MlModelApiRequest("diabetes", Map.of("glucose", 140, "age", 45));

        MlModelApiResponse response = mlInferenceService.predictDisease(request);

        assertNotNull(response);
        assertNotNull(response.getPredictedDisease());
        assertNotNull(response.getRiskLevel());
        assertNotNull(response.getRecommendations());
        assertTrue(response.getRecommendations().contains("offline"));
    }

    @Test
    public void testCheckMlServiceStatus_Offline() {
        MlServiceStatusDto status = mlInferenceService.checkMlServiceStatus();

        assertNotNull(status);
        assertEquals("DOWN", status.getStatus());
        assertEquals("http://localhost:5000/predict", status.getMlServiceUrl());
    }
}
