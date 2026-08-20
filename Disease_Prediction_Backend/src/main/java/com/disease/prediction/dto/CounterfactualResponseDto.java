package com.disease.prediction.dto;

import java.util.List;

public class CounterfactualResponseDto {

    private String diseaseTarget;
    private Double baselineRiskProbability;
    private String baselineRiskLevel;
    private Double simulatedRiskProbability;
    private String simulatedRiskLevel;
    private Double riskReductionDelta;
    private Double percentageRiskReduction;
    private List<String> actionableRoadmap;

    public CounterfactualResponseDto() {
    }

    public CounterfactualResponseDto(String diseaseTarget, Double baselineRiskProbability, String baselineRiskLevel,
                                     Double simulatedRiskProbability, String simulatedRiskLevel,
                                     Double riskReductionDelta, Double percentageRiskReduction,
                                     List<String> actionableRoadmap) {
        this.diseaseTarget = diseaseTarget;
        this.baselineRiskProbability = baselineRiskProbability;
        this.baselineRiskLevel = baselineRiskLevel;
        this.simulatedRiskProbability = simulatedRiskProbability;
        this.simulatedRiskLevel = simulatedRiskLevel;
        this.riskReductionDelta = riskReductionDelta;
        this.percentageRiskReduction = percentageRiskReduction;
        this.actionableRoadmap = actionableRoadmap;
    }

    public String getDiseaseTarget() {
        return diseaseTarget;
    }

    public void setDiseaseTarget(String diseaseTarget) {
        this.diseaseTarget = diseaseTarget;
    }

    public Double getBaselineRiskProbability() {
        return baselineRiskProbability;
    }

    public void setBaselineRiskProbability(Double baselineRiskProbability) {
        this.baselineRiskProbability = baselineRiskProbability;
    }

    public String getBaselineRiskLevel() {
        return baselineRiskLevel;
    }

    public void setBaselineRiskLevel(String baselineRiskLevel) {
        this.baselineRiskLevel = baselineRiskLevel;
    }

    public Double getSimulatedRiskProbability() {
        return simulatedRiskProbability;
    }

    public void setSimulatedRiskProbability(Double simulatedRiskProbability) {
        this.simulatedRiskProbability = simulatedRiskProbability;
    }

    public String getSimulatedRiskLevel() {
        return simulatedRiskLevel;
    }

    public void setSimulatedRiskLevel(String simulatedRiskLevel) {
        this.simulatedRiskLevel = simulatedRiskLevel;
    }

    public Double getRiskReductionDelta() {
        return riskReductionDelta;
    }

    public void setRiskReductionDelta(Double riskReductionDelta) {
        this.riskReductionDelta = riskReductionDelta;
    }

    public Double getPercentageRiskReduction() {
        return percentageRiskReduction;
    }

    public void setPercentageRiskReduction(Double percentageRiskReduction) {
        this.percentageRiskReduction = percentageRiskReduction;
    }

    public List<String> getActionableRoadmap() {
        return actionableRoadmap;
    }

    public void setActionableRoadmap(List<String> actionableRoadmap) {
        this.actionableRoadmap = actionableRoadmap;
    }
}
