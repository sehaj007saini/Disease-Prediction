package com.disease.prediction.dto;

import java.util.Map;

public class MultiDiseaseResponseDto {

    private Map<String, Object> patientProfile;
    private Double overallRiskIndex;
    private String highestRiskCategory;
    private Double highestRiskProbability;
    private Map<String, Object> diseases;

    public MultiDiseaseResponseDto() {
    }

    public MultiDiseaseResponseDto(Map<String, Object> patientProfile, Double overallRiskIndex,
                                   String highestRiskCategory, Double highestRiskProbability,
                                   Map<String, Object> diseases) {
        this.patientProfile = patientProfile;
        this.overallRiskIndex = overallRiskIndex;
        this.highestRiskCategory = highestRiskCategory;
        this.highestRiskProbability = highestRiskProbability;
        this.diseases = diseases;
    }

    public Map<String, Object> getPatientProfile() {
        return patientProfile;
    }

    public void setPatientProfile(Map<String, Object> patientProfile) {
        this.patientProfile = patientProfile;
    }

    public Double getOverallRiskIndex() {
        return overallRiskIndex;
    }

    public void setOverallRiskIndex(Double overallRiskIndex) {
        this.overallRiskIndex = overallRiskIndex;
    }

    public String getHighestRiskCategory() {
        return highestRiskCategory;
    }

    public void setHighestRiskCategory(String highestRiskCategory) {
        this.highestRiskCategory = highestRiskCategory;
    }

    public Double getHighestRiskProbability() {
        return highestRiskProbability;
    }

    public void setHighestRiskProbability(Double highestRiskProbability) {
        this.highestRiskProbability = highestRiskProbability;
    }

    public Map<String, Object> getDiseases() {
        return diseases;
    }

    public void setDiseases(Map<String, Object> diseases) {
        this.diseases = diseases;
    }
}
