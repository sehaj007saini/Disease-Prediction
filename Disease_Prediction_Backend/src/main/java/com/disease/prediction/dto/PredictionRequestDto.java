package com.disease.prediction.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class PredictionRequestDto {

    private Long patientId;

    @NotNull(message = "Disease target or category is required (e.g., 'diabetes', 'heart_disease', 'general')")
    private String diseaseTarget;

    @NotNull(message = "Input features map is required")
    private Map<String, Object> features;

    // Optional patient info if patient is created on the fly
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String patientEmail;

    public PredictionRequestDto() {
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getDiseaseTarget() {
        return diseaseTarget;
    }

    public void setDiseaseTarget(String diseaseTarget) {
        this.diseaseTarget = diseaseTarget;
    }

    public Map<String, Object> getFeatures() {
        return features;
    }

    public void setFeatures(Map<String, Object> features) {
        this.features = features;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Integer getPatientAge() {
        return patientAge;
    }

    public void setPatientAge(Integer patientAge) {
        this.patientAge = patientAge;
    }

    public String getPatientGender() {
        return patientGender;
    }

    public void setPatientGender(String patientGender) {
        this.patientGender = patientGender;
    }

    public String getPatientEmail() {
        return patientEmail;
    }

    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }
}
