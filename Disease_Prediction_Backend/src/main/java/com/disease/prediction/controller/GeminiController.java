package com.disease.prediction.controller;

import com.disease.prediction.dto.GeminiChatRequestDto;
import com.disease.prediction.dto.GeminiChatResponseDto;
import com.disease.prediction.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/gemini")
@CrossOrigin(origins = "*")
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<GeminiChatResponseDto> chat(@RequestBody GeminiChatRequestDto request) {
        GeminiChatResponseDto response = geminiService.sendMessage(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Gemini service is running");
    }
}
