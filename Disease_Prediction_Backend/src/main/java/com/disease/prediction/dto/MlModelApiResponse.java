package com.disease.prediction.dto;

import java.util.List;
import java.util.Map;

public class MlModelApiResponse {

    private String predictedDisease;
    private Double confidenceScore;
    private String riskLevel;
    private String recommendations;
    private List<Map<String, Object>> riskFactors;
    private List<Map<String, Object>> featureAttributions;

    public MlModelApiResponse() {
    }

    public MlModelApiResponse(String predictedDisease, Double confidenceScore, String riskLevel, String recommendations) {
        this.predictedDisease = predictedDisease;
        this.confidenceScore = confidenceScore;
        this.riskLevel = riskLevel;
        this.recommendations = recommendations;
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

    public List<Map<String, Object>> getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(List<Map<String, Object>> riskFactors) {
        this.riskFactors = riskFactors;
    }

    public List<Map<String, Object>> getFeatureAttributions() {
        return featureAttributions;
    }

    public void setFeatureAttributions(List<Map<String, Object>> featureAttributions) {
        this.featureAttributions = featureAttributions;
    }
}
