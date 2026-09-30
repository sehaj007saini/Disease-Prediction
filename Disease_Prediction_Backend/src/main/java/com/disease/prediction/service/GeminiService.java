package com.disease.prediction.service;

import com.disease.prediction.dto.GeminiChatRequestDto;
import com.disease.prediction.dto.GeminiChatResponseDto;
import com.disease.prediction.dto.MedicalImageAnalysisRequestDto;
import com.disease.prediction.dto.MedicalImageAnalysisResponseDto;

public interface GeminiService {
    GeminiChatResponseDto sendMessage(GeminiChatRequestDto request);
    MedicalImageAnalysisResponseDto analyzeMedicalImage(MedicalImageAnalysisRequestDto request);
}

