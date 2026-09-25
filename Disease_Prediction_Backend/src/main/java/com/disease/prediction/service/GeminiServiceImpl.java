package com.disease.prediction.service;

import com.disease.prediction.dto.GeminiChatRequestDto;
import com.disease.prediction.dto.GeminiChatResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GeminiServiceImpl implements GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiServiceImpl.class);

    @Value("${gemini.api.key:your_gemini_api_key_here}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiServiceImpl(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public GeminiChatResponseDto sendMessage(GeminiChatRequestDto request) {
        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equalsIgnoreCase("your_gemini_api_key_here")) {
            logger.warn("Gemini API key is not configured on backend server");
            return new GeminiChatResponseDto(
                "⚠️ Gemini API Key is not configured on the backend server.\n\n" +
                "To enable live Gemini AI responses:\n" +
                "1. Set `GEMINI_API_KEY=your_actual_api_key` in your environment variables or backend `.env` / `application.properties`.\n" +
                "2. If deployed on Render/Docker, configure `GEMINI_API_KEY` in environment variables.\n\n" +
                "Fallback response for your query:\n" + getFallbackResponse(request.getMessage()),
                false,
                "Gemini API key missing or unconfigured"
            );
        }

        try {
            // Build conversation context
            String context = buildConversationContext(request.getConversationHistory());
            
            // Create medical system prompt
            String systemPrompt = createMedicalPrompt(request.getMessage(), context);

            // Call Gemini API
            String response = callGeminiApi(systemPrompt);

            return new GeminiChatResponseDto(response, true);

        } catch (org.springframework.web.client.HttpStatusCodeException httpErr) {
            logger.error("Gemini API HTTP Error {}: {}", httpErr.getStatusCode(), httpErr.getResponseBodyAsString(), httpErr);
            String errDetail = "Google Gemini API returned status code " + httpErr.getStatusCode() + ": " + httpErr.getResponseBodyAsString();
            return new GeminiChatResponseDto(
                "❌ Gemini API Call Failed (" + httpErr.getStatusCode() + "):\n" +
                (httpErr.getStatusCode() == HttpStatus.FORBIDDEN || httpErr.getStatusCode() == HttpStatus.UNAUTHORIZED
                    ? "Your GEMINI_API_KEY appears to be invalid or unauthorized. Please verify your Google Gemini API key."
                    : "Error: " + httpErr.getMessage()) +
                "\n\nFallback clinical guidance:\n" + getFallbackResponse(request.getMessage()),
                false,
                errDetail
            );
        } catch (Exception e) {
            logger.error("Error calling Gemini API: {}", e.getMessage(), e);
            return new GeminiChatResponseDto(
                "⚠️ Gemini API Connection Error: " + e.getMessage() + "\n\nFallback clinical guidance:\n" + getFallbackResponse(request.getMessage()),
                false, 
                "API error - " + e.getMessage()
            );
        }
    }

    private String buildConversationContext(List<GeminiChatRequestDto.ConversationMessage> history) {
        if (history == null || history.isEmpty()) {
            return "";
        }

        return history.stream()
                .limit(5) // Last 5 messages for context
                .map(msg -> String.format("%s: %s", 
                        msg.getSender().equals("user") ? "User" : "Assistant", 
                        msg.getText()))
                .collect(Collectors.joining("\n"));
    }

    private String createMedicalPrompt(String userMessage, String context) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are MedAssist AI, an expert clinical assistant integrated into a Multi-Disease Prediction Platform.\n\n");
        prompt.append("Your role is to:\n");
        prompt.append("- Provide accurate, evidence-based medical information\n");
        prompt.append("- Explain clinical metrics and disease risk factors\n");
        prompt.append("- Reference ADA, AHA, KDIGO, and other clinical guidelines\n");
        prompt.append("- Help interpret physiological parameters and normal ranges\n");
        prompt.append("- Suggest preventative lifestyle modifications\n");
        prompt.append("- Explain AI prediction results in clinical context\n\n");
        
        prompt.append("IMPORTANT GUIDELINES:\n");
        prompt.append("- Base responses on established medical guidelines (ADA, AHA, WHO, KDIGO)\n");
        prompt.append("- Provide specific ranges for clinical parameters\n");
        prompt.append("- Always emphasize consulting healthcare providers for personalized care\n");
        prompt.append("- Be concise but thorough (2-4 sentences typical)\n");
        prompt.append("- Use medical terminology appropriately with explanations\n\n");
        
        prompt.append("Platform Context:\n");
        prompt.append("This platform predicts risk for: Diabetes, Heart Disease, Hypertension, Kidney Disease, and Stroke using ML models.\n\n");
        
        if (!context.isEmpty()) {
            prompt.append("Previous conversation:\n");
            prompt.append(context);
            prompt.append("\n\n");
        }
        
        prompt.append("User's current question: ").append(userMessage).append("\n\n");
        prompt.append("Provide a helpful, accurate clinical response:");
        
        return prompt.toString();
    }

    private String callGeminiApi(String prompt) throws Exception {
        // Build request URL with API key
        String url = geminiApiUrl + "?key=" + geminiApiKey;

        // Build request body
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> part = new HashMap<>();
        
        part.put("text", prompt);
        content.put("parts", List.of(part));
        requestBody.put("contents", List.of(content));

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request entity
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // Make API call
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                String.class
        );

        // Parse response
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode contentNode = firstCandidate.path("content");
                JsonNode parts = contentNode.path("parts");
                
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
        }

        throw new RuntimeException("Invalid response from Gemini API");
    }

    private String getFallbackResponse(String userMessage) {
        String lower = userMessage.toLowerCase();

        if (lower.contains("hba1c") || lower.contains("diabetes")) {
            return "An HbA1c level of 7.2% indicates diabetic range (≥6.5% standard threshold). According to American Diabetes Association (ADA) guidelines, targeted lifestyle modifications and glycemic control (targeting HbA1c < 7.0%) reduce microvascular complications by up to 37%. Please consult your healthcare provider for personalized treatment.";
        } else if (lower.contains("stroke")) {
            return "To reduce cerebrovascular stroke risk by 30-40%: 1) Maintain blood pressure < 120/80 mmHg, 2) Engage in 150 mins/week moderate aerobic exercise, 3) Eliminate active tobacco smoking, and 4) Follow a low-sodium Mediterranean/DASH diet. Consult your physician for personalized prevention strategies.";
        } else if (lower.contains("glucose") || lower.contains("normal range")) {
            return "Standard Clinical Reference Ranges: Fasting Blood Glucose: 70–99 mg/dL (Normal), 100–125 mg/dL (Impaired / Pre-diabetic), ≥126 mg/dL (Diabetic indicator across 2 tests). Regular monitoring is recommended if you have risk factors.";
        } else if (lower.contains("hypertension") || lower.contains("aha") || lower.contains("blood pressure")) {
            return "According to American Heart Association (AHA) guidelines, Stage 1 Hypertension is defined as Systolic 130–139 mmHg or Diastolic 80–89 mmHg. First-line management includes DASH diet, sodium reduction (<2,300 mg/day), weight management, and regular physical activity. Consult your doctor for appropriate treatment.";
        } else if (lower.contains("kidney") || lower.contains("renal") || lower.contains("egfr")) {
            return "Kidney function is assessed via eGFR (estimated Glomerular Filtration Rate). Normal eGFR: >90 mL/min/1.73m². Stage 3 CKD: 30-59 mL/min. According to KDIGO guidelines, lifestyle modifications and blood pressure control are crucial for slowing progression. Regular monitoring is essential.";
        } else if (lower.contains("heart") || lower.contains("cardiovascular") || lower.contains("cardiac")) {
            return "Cardiovascular risk factors include: hypertension, high LDL cholesterol (>100 mg/dL), smoking, diabetes, obesity, and sedentary lifestyle. AHA recommends 150 min/week moderate aerobic exercise, Mediterranean diet, and maintaining healthy BMI (18.5-24.9). Regular cardiac screenings are important.";
        } else {
            return "Based on clinical guidelines (ADA/AHA/KDIGO), maintaining physiological parameters within standard reference ranges significantly lowers multi-disease risk. Please provide more specific details about your health concern, and I can offer targeted clinical information. Remember to consult healthcare providers for personalized medical advice.";
        }
    }
}
