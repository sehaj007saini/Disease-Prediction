package com.disease.prediction.service;

import com.disease.prediction.dto.GeminiChatRequestDto;
import com.disease.prediction.dto.GeminiChatResponseDto;

public interface GeminiService {
    GeminiChatResponseDto sendMessage(GeminiChatRequestDto request);
}
