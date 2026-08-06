package com.disease.prediction.controller;

import com.disease.prediction.dto.*;
import com.disease.prediction.service.PredictionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PredictionController.class)
public class PredictionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PredictionService predictionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreatePrediction() throws Exception {
        PredictionRequestDto requestDto = new PredictionRequestDto();
        requestDto.setDiseaseTarget("heart_disease");
        requestDto.setFeatures(Map.of("age", 50, "bp", 120));

        PredictionResponseDto responseDto = new PredictionResponseDto(
                1L, 2L, "Bob", "heart_disease", "Heart Disease Low Risk", 0.95, "Low", "Maintain healthy diet", null
        );

        when(predictionService.processPrediction(any())).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/predictions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.predictionId").value(1))
                .andExpect(jsonPath("$.diseaseTarget").value("heart_disease"))
                .andExpect(jsonPath("$.predictedDisease").value("Heart Disease Low Risk"));
    }

    @Test
    public void testGetPredictionAnalytics() throws Exception {
        PredictionAnalyticsDto analytics = new PredictionAnalyticsDto(10L, Map.of("High", 4L), Map.of("heart_disease", 10L), null);

        when(predictionService.getPredictionAnalytics()).thenReturn(analytics);

        mockMvc.perform(get("/api/v1/predictions/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPredictions").value(10));
    }

    @Test
    public void testGetMlServiceStatus() throws Exception {
        MlServiceStatusDto status = new MlServiceStatusDto("UP", "http://localhost:5000/predict", 15L, "Reachable");

        when(predictionService.getMlServiceStatus()).thenReturn(status);

        mockMvc.perform(get("/api/v1/predictions/ml-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.latencyMs").value(15));
    }
}
