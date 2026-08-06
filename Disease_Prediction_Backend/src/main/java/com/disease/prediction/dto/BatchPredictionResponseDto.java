package com.disease.prediction.dto;

import java.util.List;

public class BatchPredictionResponseDto {

    private int totalProcessed;
    private List<PredictionResponseDto> results;

    public BatchPredictionResponseDto() {
    }

    public BatchPredictionResponseDto(int totalProcessed, List<PredictionResponseDto> results) {
        this.totalProcessed = totalProcessed;
        this.results = results;
    }

    public int getTotalProcessed() {
        return totalProcessed;
    }

    public void setTotalProcessed(int totalProcessed) {
        this.totalProcessed = totalProcessed;
    }

    public List<PredictionResponseDto> getResults() {
        return results;
    }

    public void setResults(List<PredictionResponseDto> results) {
        this.results = results;
    }
}
