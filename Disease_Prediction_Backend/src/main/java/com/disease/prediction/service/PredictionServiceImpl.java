package com.disease.prediction.service;

import com.disease.prediction.dto.*;
import com.disease.prediction.exception.ResourceNotFoundException;
import com.disease.prediction.model.Patient;
import com.disease.prediction.model.PredictionRecord;
import com.disease.prediction.repository.PredictionRecordRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PredictionServiceImpl implements PredictionService {

    private final PatientService patientService;
    private final MlInferenceService mlInferenceService;
    private final PredictionRecordRepository predictionRecordRepository;
    private final ObjectMapper objectMapper;

    public PredictionServiceImpl(PatientService patientService,
                                 MlInferenceService mlInferenceService,
                                 PredictionRecordRepository predictionRecordRepository,
                                 ObjectMapper objectMapper) {
        this.patientService = patientService;
        this.mlInferenceService = mlInferenceService;
        this.predictionRecordRepository = predictionRecordRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public PredictionResponseDto processPrediction(PredictionRequestDto requestDto) {
        // 1. Get or Create Patient
        Patient patient = patientService.getOrCreatePatient(
                requestDto.getPatientId(),
                requestDto.getPatientName(),
                requestDto.getPatientAge(),
                requestDto.getPatientGender(),
                requestDto.getPatientEmail()
        );

        // 2. Build ML Request Payload
        MlModelApiRequest mlRequest = new MlModelApiRequest(
                requestDto.getDiseaseTarget(),
                requestDto.getFeatures()
        );

        // 3. Call ML Inference Service
        MlModelApiResponse mlResponse = mlInferenceService.predictDisease(mlRequest);

        // 4. Serialize features map to JSON string for storage
        String featuresJson = "";
        try {
            featuresJson = objectMapper.writeValueAsString(requestDto.getFeatures());
        } catch (JsonProcessingException e) {
            featuresJson = requestDto.getFeatures().toString();
        }

        // 5. Persist Prediction Record in PostgreSQL
        PredictionRecord record = new PredictionRecord(
                patient,
                requestDto.getDiseaseTarget(),
                mlResponse.getPredictedDisease(),
                mlResponse.getConfidenceScore(),
                mlResponse.getRiskLevel(),
                featuresJson,
                mlResponse.getRecommendations()
        );
        PredictionRecord saved = predictionRecordRepository.save(record);

        // 6. Return Response DTO
        return mapToResponseDto(saved);
    }

    @Override
    public BatchPredictionResponseDto processBatchPredictions(BatchPredictionRequestDto requestDto) {
        if (requestDto == null || requestDto.getPredictions() == null) {
            return new BatchPredictionResponseDto(0, List.of());
        }

        List<PredictionResponseDto> results = requestDto.getPredictions().stream()
                .map(this::processPrediction)
                .collect(Collectors.toList());

        return new BatchPredictionResponseDto(results.size(), results);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PredictionResponseDto> getPredictionHistoryByPatient(Long patientId) {
        // Verify patient exists
        patientService.getPatientEntityById(patientId);

        return predictionRecordRepository.findByPatientIdOrderByPredictionDateDesc(patientId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PredictionResponseDto getPredictionById(Long predictionId) {
        PredictionRecord record = predictionRecordRepository.findById(predictionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction record not found with id: " + predictionId));
        return mapToResponseDto(record);
    }

    @Override
    @Transactional(readOnly = true)
    public PredictionAnalyticsDto getPredictionAnalytics() {
        long totalCount = predictionRecordRepository.count();

        java.util.Map<String, Long> riskDist = predictionRecordRepository.countRecordsByRiskLevel()
                .stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Unknown",
                        row -> (Long) row[1]
                ));

        java.util.Map<String, Long> targetDist = predictionRecordRepository.countRecordsByDiseaseTarget()
                .stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Unknown",
                        row -> (Long) row[1]
                ));

        java.time.LocalDateTime latestTime = predictionRecordRepository.findTopByOrderByPredictionDateDesc()
                .map(PredictionRecord::getPredictionDate)
                .orElse(null);

        return new PredictionAnalyticsDto(totalCount, riskDist, targetDist, latestTime);
    }

    @Override
    public MlServiceStatusDto getMlServiceStatus() {
        return mlInferenceService.checkMlServiceStatus();
    }

    private PredictionResponseDto mapToResponseDto(PredictionRecord record) {
        return new PredictionResponseDto(
                record.getId(),
                record.getPatient().getId(),
                record.getPatient().getName(),
                record.getDiseaseTarget(),
                record.getPredictedDisease(),
                record.getConfidenceScore(),
                record.getRiskLevel(),
                record.getRecommendations(),
                record.getPredictionDate()
        );
    }
}
