package com.disease.prediction.service;

import com.disease.prediction.dto.PatientDto;
import com.disease.prediction.model.Patient;

import java.util.List;

public interface PatientService {
    PatientDto createPatient(PatientDto patientDto);
    PatientDto getPatientById(Long id);
    Patient getPatientEntityById(Long id);
    List<PatientDto> getAllPatients();
    PatientDto updatePatient(Long id, PatientDto patientDto);
    void deletePatient(Long id);
    Patient getOrCreatePatient(Long patientId, String name, Integer age, String gender, String email);
}
