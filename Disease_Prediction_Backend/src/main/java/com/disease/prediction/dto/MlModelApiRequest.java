package com.disease.prediction.dto;

import java.util.Map;

public class MlModelApiRequest {

    private String diseaseTarget;
    private Map<String, Object> features;

    public MlModelApiRequest() {
    }

    public MlModelApiRequest(String diseaseTarget, Map<String, Object> features) {
        this.diseaseTarget = diseaseTarget;
        this.features = features;
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
}
