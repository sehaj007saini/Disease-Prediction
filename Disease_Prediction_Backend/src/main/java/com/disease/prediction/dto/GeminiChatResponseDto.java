package com.disease.prediction.dto;

public class GeminiChatResponseDto {
    private String response;
    private boolean success;
    private String error;

    public GeminiChatResponseDto() {}

    public GeminiChatResponseDto(String response, boolean success) {
        this.response = response;
        this.success = success;
    }

    public GeminiChatResponseDto(String response, boolean success, String error) {
        this.response = response;
        this.success = success;
        this.error = error;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
