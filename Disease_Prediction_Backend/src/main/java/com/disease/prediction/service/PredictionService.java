package com.disease.prediction.service;

import com.disease.prediction.dto.*;

import java.util.List;

public interface PredictionService {
    PredictionResponseDto processPrediction(PredictionRequestDto requestDto);
    BatchPredictionResponseDto processBatchPredictions(BatchPredictionRequestDto requestDto);
    List<PredictionResponseDto> getPredictionHistoryByPatient(Long patientId);
    PredictionResponseDto getPredictionById(Long predictionId);
    PredictionAnalyticsDto getPredictionAnalytics();
    MlServiceStatusDto getMlServiceStatus();
}
