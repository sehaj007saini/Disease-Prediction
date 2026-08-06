package com.disease.prediction.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "System Health API", description = "Backend system status endpoint")
public class HealthCheckController {

    @GetMapping
    @Operation(summary = "Check backend system health", description = "Returns service operational status and current server timestamp.")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Disease Prediction Spring Boot Backend");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
