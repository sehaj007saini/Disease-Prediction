package com.disease.prediction.dto;

import java.util.Map;

public class CounterfactualRequestDto {

    private String diseaseTarget;
    private Map<String, Object> baselineFeatures;
    private Map<String, Object> targetFeatures;

    public CounterfactualRequestDto() {
    }

    public CounterfactualRequestDto(String diseaseTarget, Map<String, Object> baselineFeatures, Map<String, Object> targetFeatures) {
        this.diseaseTarget = diseaseTarget;
        this.baselineFeatures = baselineFeatures;
        this.targetFeatures = targetFeatures;
    }

    public String getDiseaseTarget() {
        return diseaseTarget;
    }

    public void setDiseaseTarget(String diseaseTarget) {
        this.diseaseTarget = diseaseTarget;
    }

    public Map<String, Object> getBaselineFeatures() {
        return baselineFeatures;
    }

    public void setBaselineFeatures(Map<String, Object> baselineFeatures) {
        this.baselineFeatures = baselineFeatures;
    }

    public Map<String, Object> getTargetFeatures() {
        return targetFeatures;
    }

    public void setTargetFeatures(Map<String, Object> targetFeatures) {
        this.targetFeatures = targetFeatures;
    }
}
