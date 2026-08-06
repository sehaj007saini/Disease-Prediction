package com.disease.prediction.service;

import com.disease.prediction.dto.PatientDto;
import com.disease.prediction.exception.ResourceNotFoundException;
import com.disease.prediction.model.Patient;
import com.disease.prediction.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    private Patient testPatient;
    private PatientDto testPatientDto;

    @BeforeEach
    public void setUp() {
        testPatient = new Patient("John Doe", 45, "Male", "john.doe@example.com", "+123456789");
        testPatient.setId(1L);

        testPatientDto = new PatientDto();
        testPatientDto.setName("John Doe");
        testPatientDto.setAge(45);
        testPatientDto.setGender("Male");
        testPatientDto.setEmail("john.doe@example.com");
        testPatientDto.setPhone("+123456789");
    }

    @Test
    public void testCreatePatient_Success() {
        when(patientRepository.save(any(Patient.class))).thenReturn(testPatient);

        PatientDto result = patientService.createPatient(testPatientDto);

        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        assertEquals(45, result.getAge());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    public void testGetPatientById_Success() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));

        PatientDto result = patientService.getPatientById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("John Doe", result.getName());
    }

    @Test
    public void testGetPatientById_NotFound() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> patientService.getPatientById(99L));
    }

    @Test
    public void testGetAllPatients() {
        when(patientRepository.findAll()).thenReturn(List.of(testPatient));

        List<PatientDto> patients = patientService.getAllPatients();

        assertEquals(1, patients.size());
        assertEquals("John Doe", patients.get(0).getName());
    }

    @Test
    public void testGetOrCreatePatient_ExistingId() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(testPatient));

        Patient result = patientService.getOrCreatePatient(1L, "John", 45, "Male", "john@example.com");

        assertEquals(1L, result.getId());
        verify(patientRepository, never()).save(any());
    }

    @Test
    public void testGetOrCreatePatient_NewPatient() {
        when(patientRepository.save(any(Patient.class))).thenReturn(testPatient);

        Patient result = patientService.getOrCreatePatient(null, "John Doe", 45, "Male", "john.doe@example.com");

        assertNotNull(result);
        verify(patientRepository, times(1)).save(any());
    }
}
