package com.disease.prediction.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class PredictionAnalyticsDto {

    private long totalPredictions;
    private Map<String, Long> riskLevelDistribution;
    private Map<String, Long> diseaseTargetDistribution;
    private LocalDateTime latestPredictionTime;

    public PredictionAnalyticsDto() {
    }

    public PredictionAnalyticsDto(long totalPredictions,
                                  Map<String, Long> riskLevelDistribution,
                                  Map<String, Long> diseaseTargetDistribution,
                                  LocalDateTime latestPredictionTime) {
        this.totalPredictions = totalPredictions;
        this.riskLevelDistribution = riskLevelDistribution;
        this.diseaseTargetDistribution = diseaseTargetDistribution;
        this.latestPredictionTime = latestPredictionTime;
    }

    public long getTotalPredictions() {
        return totalPredictions;
    }

    public void setTotalPredictions(long totalPredictions) {
        this.totalPredictions = totalPredictions;
    }

    public Map<String, Long> getRiskLevelDistribution() {
        return riskLevelDistribution;
    }

    public void setRiskLevelDistribution(Map<String, Long> riskLevelDistribution) {
        this.riskLevelDistribution = riskLevelDistribution;
    }

    public Map<String, Long> getDiseaseTargetDistribution() {
        return diseaseTargetDistribution;
    }

    public void setDiseaseTargetDistribution(Map<String, Long> diseaseTargetDistribution) {
        this.diseaseTargetDistribution = diseaseTargetDistribution;
    }

    public LocalDateTime getLatestPredictionTime() {
        return latestPredictionTime;
    }

    public void setLatestPredictionTime(LocalDateTime latestPredictionTime) {
        this.latestPredictionTime = latestPredictionTime;
    }
}
