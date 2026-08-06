package com.disease.prediction.repository;

import com.disease.prediction.model.PredictionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRecordRepository extends JpaRepository<PredictionRecord, Long> {
    List<PredictionRecord> findByPatientIdOrderByPredictionDateDesc(Long patientId);
    List<PredictionRecord> findByPredictedDisease(String predictedDisease);

    @Query("SELECT p.riskLevel, COUNT(p) FROM PredictionRecord p GROUP BY p.riskLevel")
    List<Object[]> countRecordsByRiskLevel();

    @Query("SELECT p.diseaseTarget, COUNT(p) FROM PredictionRecord p GROUP BY p.diseaseTarget")
    List<Object[]> countRecordsByDiseaseTarget();

    Optional<PredictionRecord> findTopByOrderByPredictionDateDesc();
}
