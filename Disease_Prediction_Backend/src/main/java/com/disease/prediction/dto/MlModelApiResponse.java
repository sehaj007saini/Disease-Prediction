package com.disease.prediction.dto;

public class MlModelApiResponse {

    private String predictedDisease;
    private Double confidenceScore;
    private String riskLevel;
    private String recommendations;

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
}
