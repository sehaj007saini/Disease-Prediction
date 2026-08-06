package com.disease.prediction.controller;

import com.disease.prediction.dto.*;
import com.disease.prediction.service.PredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/predictions")
@CrossOrigin(origins = "*")
@Tag(name = "Disease Prediction APIs", description = "Endpoints for ML inference, batch prediction, patient logs, analytics & ML service status")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping
    @Operation(summary = "Execute single disease prediction", description = "Forwards feature payload to ML model, records result in DB and returns diagnostic response.")
    public ResponseEntity<PredictionResponseDto> createPrediction(@Valid @RequestBody PredictionRequestDto requestDto) {
        PredictionResponseDto response = predictionService.processPrediction(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/batch")
    @Operation(summary = "Execute batch disease predictions", description = "Processes multiple patient feature payloads in bulk.")
    public ResponseEntity<BatchPredictionResponseDto> createBatchPredictions(@Valid @RequestBody BatchPredictionRequestDto requestDto) {
        BatchPredictionResponseDto response = predictionService.processBatchPredictions(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get prediction record by ID", description = "Retrieves a specific stored prediction log by unique ID.")
    public ResponseEntity<PredictionResponseDto> getPredictionById(@PathVariable Long id) {
        PredictionResponseDto response = predictionService.getPredictionById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get patient prediction history", description = "Retrieves all historical predictions recorded for a specific patient.")
    public ResponseEntity<List<PredictionResponseDto>> getPredictionHistoryByPatient(@PathVariable Long patientId) {
        List<PredictionResponseDto> history = predictionService.getPredictionHistoryByPatient(patientId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get prediction analytics summary", description = "Returns aggregated counts of predictions, risk levels, and disease target distributions.")
    public ResponseEntity<PredictionAnalyticsDto> getPredictionAnalytics() {
        PredictionAnalyticsDto analytics = predictionService.getPredictionAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/ml-status")
    @Operation(summary = "Check ML Model Service health & latency", description = "Pings the external ML model REST endpoint to monitor connectivity and status.")
    public ResponseEntity<MlServiceStatusDto> getMlServiceStatus() {
        MlServiceStatusDto status = predictionService.getMlServiceStatus();
        return ResponseEntity.ok(status);
    }
}
