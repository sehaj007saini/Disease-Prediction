package com.disease.prediction.service;

import com.disease.prediction.dto.*;
import com.disease.prediction.model.Patient;
import com.disease.prediction.model.PredictionRecord;
import com.disease.prediction.repository.PredictionRecordRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PredictionServiceTest {

    @Mock
    private PatientService patientService;

    @Mock
    private MlInferenceService mlInferenceService;

    @Mock
    private PredictionRecordRepository predictionRecordRepository;

    private PredictionServiceImpl predictionService;

    private Patient testPatient;
    private PredictionRecord testRecord;
    private PredictionRequestDto requestDto;

    @BeforeEach
    public void setUp() {
        predictionService = new PredictionServiceImpl(
                patientService,
                mlInferenceService,
                predictionRecordRepository,
                new ObjectMapper()
        );

        testPatient = new Patient("Jane Doe", 35, "Female", "jane@example.com", null);
        testPatient.setId(10L);

        testRecord = new PredictionRecord(
                testPatient,
                "diabetes",
                "Diabetes Positive",
                0.88,
                "High",
                "{\"glucose\":140}",
                "Follow up with doctor"
        );
        testRecord.setId(100L);

        requestDto = new PredictionRequestDto();
        requestDto.setDiseaseTarget("diabetes");
        requestDto.setFeatures(Map.of("glucose", 140));
        requestDto.setPatientName("Jane Doe");
        requestDto.setPatientAge(35);
        requestDto.setPatientGender("Female");
        requestDto.setPatientEmail("jane@example.com");
    }

    @Test
    public void testProcessPrediction_Success() {
        when(patientService.getOrCreatePatient(any(), any(), any(), any(), any())).thenReturn(testPatient);
        when(mlInferenceService.predictDisease(any())).thenReturn(
                new MlModelApiResponse("Diabetes Positive", 0.88, "High", "Follow up with doctor")
        );
        when(predictionRecordRepository.save(any())).thenReturn(testRecord);

        PredictionResponseDto response = predictionService.processPrediction(requestDto);

        assertNotNull(response);
        assertEquals(100L, response.getPredictionId());
        assertEquals("diabetes", response.getDiseaseTarget());
        assertEquals("Diabetes Positive", response.getPredictedDisease());
        assertEquals("High", response.getRiskLevel());
    }

    @Test
    public void testProcessBatchPredictions_Success() {
        when(patientService.getOrCreatePatient(any(), any(), any(), any(), any())).thenReturn(testPatient);
        when(mlInferenceService.predictDisease(any())).thenReturn(
                new MlModelApiResponse("Diabetes Positive", 0.88, "High", "Follow up with doctor")
        );
        when(predictionRecordRepository.save(any())).thenReturn(testRecord);

        BatchPredictionRequestDto batchDto = new BatchPredictionRequestDto(List.of(requestDto, requestDto));

        BatchPredictionResponseDto response = predictionService.processBatchPredictions(batchDto);

        assertNotNull(response);
        assertEquals(2, response.getTotalProcessed());
        assertEquals(2, response.getResults().size());
    }

    @Test
    public void testGetPredictionAnalytics() {
        when(predictionRecordRepository.count()).thenReturn(5L);

        List<Object[]> riskLevels = new java.util.ArrayList<>();
        riskLevels.add(new Object[]{"High", 3L});
        riskLevels.add(new Object[]{"Low", 2L});

        List<Object[]> diseaseTargets = new java.util.ArrayList<>();
        diseaseTargets.add(new Object[]{"diabetes", 5L});

        when(predictionRecordRepository.countRecordsByRiskLevel()).thenReturn(riskLevels);
        when(predictionRecordRepository.countRecordsByDiseaseTarget()).thenReturn(diseaseTargets);
        when(predictionRecordRepository.findTopByOrderByPredictionDateDesc()).thenReturn(Optional.of(testRecord));

        PredictionAnalyticsDto analytics = predictionService.getPredictionAnalytics();

        assertNotNull(analytics);
        assertEquals(5L, analytics.getTotalPredictions());
        assertEquals(3L, analytics.getRiskLevelDistribution().get("High"));
        assertEquals(5L, analytics.getDiseaseTargetDistribution().get("diabetes"));
    }
}
