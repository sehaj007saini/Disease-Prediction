package com.disease.prediction.dto;

import java.util.Map;

public class GlobalXaiDto {

    private String status;
    private Map<String, Object> models;

    public GlobalXaiDto() {
    }

    public GlobalXaiDto(String status, Map<String, Object> models) {
        this.status = status;
        this.models = models;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Map<String, Object> getModels() {
        return models;
    }

    public void setModels(Map<String, Object> models) {
        this.models = models;
    }
}
