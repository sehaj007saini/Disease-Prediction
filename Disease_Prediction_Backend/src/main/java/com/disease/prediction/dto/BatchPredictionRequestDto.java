package com.disease.prediction.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BatchPredictionRequestDto {

    @NotEmpty(message = "Batch prediction list cannot be empty")
    @Valid
    private List<PredictionRequestDto> predictions;

    public BatchPredictionRequestDto() {
    }

    public BatchPredictionRequestDto(List<PredictionRequestDto> predictions) {
        this.predictions = predictions;
    }

    public List<PredictionRequestDto> getPredictions() {
        return predictions;
    }

    public void setPredictions(List<PredictionRequestDto> predictions) {
        this.predictions = predictions;
    }
}
