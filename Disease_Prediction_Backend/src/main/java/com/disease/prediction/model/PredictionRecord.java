package com.disease.prediction.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prediction_records")
public class PredictionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Column(name = "disease_target", nullable = false)
    private String diseaseTarget;

    @Column(name = "predicted_disease", nullable = false)
    private String predictedDisease;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "input_features_json", columnDefinition = "TEXT")
    private String inputFeaturesJson;

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "prediction_date", nullable = false, updatable = false)
    private LocalDateTime predictionDate;

    public PredictionRecord() {
    }

    public PredictionRecord(Patient patient, String diseaseTarget, String predictedDisease,
                            Double confidenceScore, String riskLevel, String inputFeaturesJson,
                            String recommendations) {
        this.patient = patient;
        this.diseaseTarget = diseaseTarget;
        this.predictedDisease = predictedDisease;
        this.confidenceScore = confidenceScore;
        this.riskLevel = riskLevel;
        this.inputFeaturesJson = inputFeaturesJson;
        this.recommendations = recommendations;
    }

    @PrePersist
    protected void onCreate() {
        this.predictionDate = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public String getDiseaseTarget() {
        return diseaseTarget;
    }

    public void setDiseaseTarget(String diseaseTarget) {
        this.diseaseTarget = diseaseTarget;
    }

    public String getPredictedDisease() {
        return predictedDisease;
    }

    public void setPredictedDisease(String predictedDisease) {
        this.predictedDisease = predictedDisease;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getInputFeaturesJson() {
        return inputFeaturesJson;
    }

    public void setInputFeaturesJson(String inputFeaturesJson) {
        this.inputFeaturesJson = inputFeaturesJson;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }

    public LocalDateTime getPredictionDate() {
        return predictionDate;
    }

    public void setPredictionDate(LocalDateTime predictionDate) {
        this.predictionDate = predictionDate;
    }
}
