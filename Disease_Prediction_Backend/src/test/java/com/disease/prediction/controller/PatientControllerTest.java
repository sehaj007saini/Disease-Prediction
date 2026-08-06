package com.disease.prediction.controller;

import com.disease.prediction.dto.PatientDto;
import com.disease.prediction.service.PatientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PatientController.class)
public class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PatientService patientService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreatePatient() throws Exception {
        PatientDto dto = new PatientDto();
        dto.setName("Alice Smith");
        dto.setAge(29);
        dto.setGender("Female");

        PatientDto created = new PatientDto();
        created.setId(1L);
        created.setName("Alice Smith");
        created.setAge(29);
        created.setGender("Female");

        when(patientService.createPatient(any())).thenReturn(created);

        mockMvc.perform(post("/api/v1/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Alice Smith"));
    }

    @Test
    public void testGetAllPatients() throws Exception {
        PatientDto patient = new PatientDto();
        patient.setId(1L);
        patient.setName("Alice Smith");

        when(patientService.getAllPatients()).thenReturn(List.of(patient));

        mockMvc.perform(get("/api/v1/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alice Smith"));
    }

    @Test
    public void testGetPatientById() throws Exception {
        PatientDto patient = new PatientDto();
        patient.setId(1L);
        patient.setName("Alice Smith");

        when(patientService.getPatientById(1L)).thenReturn(patient);

        mockMvc.perform(get("/api/v1/patients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Alice Smith"));
    }
}
