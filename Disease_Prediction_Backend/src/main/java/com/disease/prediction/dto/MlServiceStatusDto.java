package com.disease.prediction.dto;

public class MlServiceStatusDto {

    private String status; // UP or DOWN / DEGRADED
    private String mlServiceUrl;
    private long latencyMs;
    private String message;

    public MlServiceStatusDto() {
    }

    public MlServiceStatusDto(String status, String mlServiceUrl, long latencyMs, String message) {
        this.status = status;
        this.mlServiceUrl = mlServiceUrl;
        this.latencyMs = latencyMs;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMlServiceUrl() {
        return mlServiceUrl;
    }

    public void setMlServiceUrl(String mlServiceUrl) {
        this.mlServiceUrl = mlServiceUrl;
    }

    public long getLatencyMs() {
        return latencyMs;
    }

    public void setLatencyMs(long latencyMs) {
        this.latencyMs = latencyMs;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
