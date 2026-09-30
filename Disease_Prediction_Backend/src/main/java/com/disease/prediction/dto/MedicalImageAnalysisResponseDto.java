package com.disease.prediction.dto;

import java.util.List;

public class MedicalImageAnalysisResponseDto {
    private boolean success;
    private String modality;
    private String diagnosticSummary;
    private String severityLevel; // NORMAL, MILD, MODERATE, HIGH, CRITICAL
    private Double confidenceScore;
    private List<String> keyFindings;
    private List<String> detectedAbnormalities;
    private List<String> clinicalRecommendations;
    private String rawAnalysisText;
    private String errorMessage;
    private String timestamp;

    public MedicalImageAnalysisResponseDto() {}

    public MedicalImageAnalysisResponseDto(boolean success, String modality, String diagnosticSummary, String severityLevel, Double confidenceScore, List<String> keyFindings, List<String> detectedAbnormalities, List<String> clinicalRecommendations, String rawAnalysisText, String errorMessage) {
        this.success = success;
        this.modality = modality;
        this.diagnosticSummary = diagnosticSummary;
        this.severityLevel = severityLevel;
        this.confidenceScore = confidenceScore;
        this.keyFindings = keyFindings;
        this.detectedAbnormalities = detectedAbnormalities;
        this.clinicalRecommendations = clinicalRecommendations;
        this.rawAnalysisText = rawAnalysisText;
        this.errorMessage = errorMessage;
        this.timestamp = java.time.LocalDateTime.now().toString();
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getModality() {
        return modality;
    }

    public void setModality(String modality) {
        this.modality = modality;
    }

    public String getDiagnosticSummary() {
        return diagnosticSummary;
    }

    public void setDiagnosticSummary(String diagnosticSummary) {
        this.diagnosticSummary = diagnosticSummary;
    }

    public String getSeverityLevel() {
        return severityLevel;
    }

    public void setSeverityLevel(String severityLevel) {
        this.severityLevel = severityLevel;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public List<String> getKeyFindings() {
        return keyFindings;
    }

    public void setKeyFindings(List<String> keyFindings) {
        this.keyFindings = keyFindings;
    }

    public List<String> getDetectedAbnormalities() {
        return detectedAbnormalities;
    }

    public void setDetectedAbnormalities(List<String> detectedAbnormalities) {
        this.detectedAbnormalities = detectedAbnormalities;
    }

    public List<String> getClinicalRecommendations() {
        return clinicalRecommendations;
    }

    public void setClinicalRecommendations(List<String> clinicalRecommendations) {
        this.clinicalRecommendations = clinicalRecommendations;
    }

    public String getRawAnalysisText() {
        return rawAnalysisText;
    }

    public void setRawAnalysisText(String rawAnalysisText) {
        this.rawAnalysisText = rawAnalysisText;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
