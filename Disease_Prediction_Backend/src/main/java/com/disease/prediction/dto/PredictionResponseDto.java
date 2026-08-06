package com.disease.prediction.dto;

import java.time.LocalDateTime;

public class PredictionResponseDto {

    private Long predictionId;
    private Long patientId;
    private String patientName;
    private String diseaseTarget;
    private String predictedDisease;
    private Double confidenceScore;
    private String riskLevel;
    private String recommendations;
    private LocalDateTime predictionDate;

    public PredictionResponseDto() {
    }

    public PredictionResponseDto(Long predictionId, Long patientId, String patientName,
                                 String diseaseTarget, String predictedDisease,
                                 Double confidenceScore, String riskLevel,
                                 String recommendations, LocalDateTime predictionDate) {
        this.predictionId = predictionId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.diseaseTarget = diseaseTarget;
        this.predictedDisease = predictedDisease;
        this.confidenceScore = confidenceScore;
        this.riskLevel = riskLevel;
        this.recommendations = recommendations;
        this.predictionDate = predictionDate;
    }

    public Long getPredictionId() {
        return predictionId;
    }

    public void setPredictionId(Long predictionId) {
        this.predictionId = predictionId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDiseaseTarget() {
        return diseaseTarget;
    }

    public void setDiseaseTarget(String diseaseTarget) {
        this.diseaseTarget = diseaseTarget;
    }

    public String getPredictedDisease() {
        return predictedDisease;
    }

    public void setPredictedDisease(String predictedDisease) {
        this.predictedDisease = predictedDisease;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }

    public LocalDateTime getPredictionDate() {
        return predictionDate;
    }

    public void setPredictionDate(LocalDateTime predictionDate) {
        this.predictionDate = predictionDate;
    }
}
