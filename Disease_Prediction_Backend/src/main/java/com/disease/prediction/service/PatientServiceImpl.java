package com.disease.prediction.service;

import com.disease.prediction.dto.PatientDto;
import com.disease.prediction.exception.ResourceNotFoundException;
import com.disease.prediction.model.Patient;
import com.disease.prediction.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public PatientDto createPatient(PatientDto dto) {
        Patient patient = new Patient(
                dto.getName(),
                dto.getAge(),
                dto.getGender(),
                dto.getEmail(),
                dto.getPhone()
        );
        Patient saved = patientRepository.save(patient);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDto getPatientById(Long id) {
        Patient patient = getPatientEntityById(id);
        return mapToDto(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public Patient getPatientEntityById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDto> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PatientDto updatePatient(Long id, PatientDto dto) {
        Patient patient = getPatientEntityById(id);
        patient.setName(dto.getName());
        patient.setAge(dto.getAge());
        patient.setGender(dto.getGender());
        patient.setEmail(dto.getEmail());
        patient.setPhone(dto.getPhone());
        Patient updated = patientRepository.save(patient);
        return mapToDto(updated);
    }

    @Override
    public void deletePatient(Long id) {
        Patient patient = getPatientEntityById(id);
        patientRepository.delete(patient);
    }

    @Override
    public Patient getOrCreatePatient(Long patientId, String name, Integer age, String gender, String email) {
        if (patientId != null) {
            return getPatientEntityById(patientId);
        }

        if (email != null && !email.isBlank()) {
            var existing = patientRepository.findByEmail(email);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        Patient newPatient = new Patient(
                name != null ? name : "Anonymous Patient",
                age != null ? age : 30,
                gender != null ? gender : "Unspecified",
                email,
                null
        );
        return patientRepository.save(newPatient);
    }

    private PatientDto mapToDto(Patient patient) {
        PatientDto dto = new PatientDto();
        dto.setId(patient.getId());
        dto.setName(patient.getName());
        dto.setAge(patient.getAge());
        dto.setGender(patient.getGender());
        dto.setEmail(patient.getEmail());
        dto.setPhone(patient.getPhone());
        dto.setCreatedAt(patient.getCreatedAt());
        return dto;
    }
}
