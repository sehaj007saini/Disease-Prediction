package com.disease.prediction.dto;

import java.util.Map;

public class MultiDiseaseRequestDto {

    private Long patientId;
    private String patientName;
    private Map<String, Object> features;

    public MultiDiseaseRequestDto() {
    }

    public MultiDiseaseRequestDto(Long patientId, String patientName, Map<String, Object> features) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.features = features;
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

    public Map<String, Object> getFeatures() {
        return features;
    }

    public void setFeatures(Map<String, Object> features) {
        this.features = features;
    }
}
