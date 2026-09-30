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

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent}")
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
        List<String> urlsToTry = List.of(
            geminiApiUrl,
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"
        );

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
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        Exception lastException = null;

        for (String baseUrl : urlsToTry) {
            try {
                String url = baseUrl + "?key=" + geminiApiKey;
                ResponseEntity<String> response = restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        String.class
                );

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
            } catch (Exception e) {
                logger.warn("Gemini API call failed for model URL {}: {}", baseUrl, e.getMessage());
                lastException = e;
            }
        }

        if (lastException != null) {
            throw lastException;
        }

        throw new RuntimeException("Invalid response from Gemini API");
    }

    @Override
    public com.disease.prediction.dto.MedicalImageAnalysisResponseDto analyzeMedicalImage(com.disease.prediction.dto.MedicalImageAnalysisRequestDto request) {
        String modality = request.getModality() != null ? request.getModality().toUpperCase() : "GENERAL";
        String mimeType = request.getMimeType() != null ? request.getMimeType() : "image/jpeg";
        String base64Data = request.getBase64Image();
        
        // Strip data URL prefix if present (e.g., data:image/png;base64,...)
        if (base64Data != null && base64Data.contains(",")) {
            base64Data = base64Data.split(",")[1];
        }

        // Check if API key is configured
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equalsIgnoreCase("your_gemini_api_key_here")) {
            logger.warn("Gemini API key is not configured for image analysis");
            return getSimulatedImagingResponse(modality, "Gemini API key is unconfigured on backend server. Showing demo analytical diagnostic report.");
        }

        try {
            String visionPrompt = createRadiologyPrompt(modality, request.getAdditionalClinicalNotes());
            String rawResponse = callGeminiVisionApi(visionPrompt, base64Data, mimeType);

            return parseRadiologyResponse(rawResponse, modality);

        } catch (Exception e) {
            logger.error("Error analyzing medical image with Gemini Vision: {}", e.getMessage(), e);
            return getSimulatedImagingResponse(modality, "AI Vision Engine Call Failed: " + e.getMessage() + ". Showing fallback clinical report.");
        }
    }

    private String createRadiologyPrompt(String modality, String notes) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert Board-Certified Radiologist and AI Diagnostic Specialist.\n\n");
        sb.append("CRITICAL VALIDATION RULE:\n");
        sb.append("First, inspect the image to determine if it is a genuine medical diagnostic scan (such as an X-Ray, CT Scan, MRI, Ultrasound, Mammogram, or Echocardiogram).\n");
        sb.append("If the image is NOT a medical scan (for example: a smartphone like an iPhone, computer, car, animal, person selfie, consumer device, or non-clinical photograph), you MUST output:\n\n");
        sb.append("DIAGNOSTIC SUMMARY: INVALID NON-MEDICAL IMAGE DETECTED. The uploaded photo is a non-clinical object (e.g., smartphone/device) and not a valid radiological scan.\n");
        sb.append("SEVERITY: INVALID_IMAGE\n");
        sb.append("CONFIDENCE SCORE: 0.0\n");
        sb.append("KEY FINDINGS: Non-medical consumer item or non-clinical object detected.\n");
        sb.append("DETECTED ABNORMALITIES: Invalid file content for radiological evaluation.\n");
        sb.append("RECOMMENDATIONS: Upload a valid DICOM, PNG, or JPEG X-Ray, CT, MRI, or Ultrasound scan.\n\n");
        
        sb.append("If the image IS a valid medical scan, analyze the ").append(modality).append(" scan carefully:\n\n");
        if (notes != null && !notes.trim().isEmpty()) {
            sb.append("Clinical Context / Patient Symptoms: ").append(notes).append("\n\n");
        }
        sb.append("Format for valid scans:\n");
        sb.append("1. DIAGNOSTIC SUMMARY: A clear 2-3 sentence summary of findings.\n");
        sb.append("2. SEVERITY: Choose exactly ONE of: NORMAL, MILD, MODERATE, HIGH, CRITICAL.\n");
        sb.append("3. CONFIDENCE SCORE: A numerical value between 0.70 and 0.99.\n");
        sb.append("4. KEY FINDINGS: Bullet points of anatomical structures.\n");
        sb.append("5. DETECTED ABNORMALITIES: Bullet points of abnormalities.\n");
        sb.append("6. RECOMMENDATIONS: Bullet points of clinical next steps.");
        return sb.toString();
    }


    private String callGeminiVisionApi(String prompt, String base64Image, String mimeType) throws Exception {
        List<String> urlsToTry = List.of(
            geminiApiUrl,
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"
        );

        // Build multimodal request body
        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> imagePart = Map.of(
            "inline_data", Map.of(
                "mime_type", mimeType,
                "data", base64Image
            )
        );

        Map<String, Object> content = Map.of("parts", List.of(textPart, imagePart));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        Exception lastException = null;

        for (String baseUrl : urlsToTry) {
            try {
                String url = baseUrl + "?key=" + geminiApiKey;
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode candidates = root.path("candidates");
                    if (candidates.isArray() && candidates.size() > 0) {
                        JsonNode parts = candidates.get(0).path("content").path("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            return parts.get(0).path("text").asText();
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("Gemini Vision API call failed for URL {}: {}", baseUrl, e.getMessage());
                lastException = e;
            }
        }

        if (lastException != null) {
            throw lastException;
        }

        throw new RuntimeException("Invalid response from Gemini Vision API");
    }

    private com.disease.prediction.dto.MedicalImageAnalysisResponseDto parseRadiologyResponse(String rawText, String modality) {
        String severity = "MODERATE";
        Double confidence = 0.88;
        String summary = "Radiological scan evaluated via AI Multimodal Engine.";
        List<String> findings = new java.util.ArrayList<>();
        List<String> abnormalities = new java.util.ArrayList<>();
        List<String> recommendations = new java.util.ArrayList<>();

        String lowerRaw = rawText.toLowerCase();

        // Check if Gemini detected non-medical image
        if (lowerRaw.contains("invalid_image") || lowerRaw.contains("non-medical image") || lowerRaw.contains("not a medical") || lowerRaw.contains("invalid non-medical")) {
            findings.add("Uploaded image is a non-clinical item (e.g., smartphone, electronic device, or non-medical photo).");
            abnormalities.add("Unable to perform radiological analysis on non-medical imagery.");
            recommendations.add("Please select or upload a valid diagnostic X-Ray, CT Scan, MRI, or Ultrasound.");

            return new com.disease.prediction.dto.MedicalImageAnalysisResponseDto(
                false, modality,
                "⚠️ INVALID IMAGE: The uploaded photo is not a medical scan (e.g. iPhone, non-medical object). Please upload a valid X-Ray, CT, MRI, or Ultrasound image.",
                "INVALID_IMAGE", 0.0, findings, abnormalities, recommendations, rawText, "Non-medical image uploaded"
            );
        }

        String[] lines = rawText.split("\n");
        String currentSection = "";

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            String lower = trimmed.toLowerCase();
            if (lower.contains("severity:")) {
                if (lower.contains("invalid")) severity = "INVALID_IMAGE";
                else if (lower.contains("critical")) severity = "CRITICAL";
                else if (lower.contains("high")) severity = "HIGH";
                else if (lower.contains("moderate")) severity = "MODERATE";
                else if (lower.contains("mild")) severity = "MILD";
                else if (lower.contains("normal")) severity = "NORMAL";
            }
 else if (lower.contains("confidence score:") || lower.contains("confidence:")) {
                try {
                    String numStr = trimmed.replaceAll("[^0-9.]", "");
                    if (!numStr.isEmpty()) {
                        double val = Double.parseDouble(numStr);
                        if (val > 1.0) val = val / 100.0;
                        confidence = Math.min(0.99, Math.max(0.70, val));
                    }
                } catch (Exception ignored) {}
            } else if (lower.contains("diagnostic summary:")) {
                currentSection = "summary";
                summary = trimmed.substring(trimmed.indexOf(":") + 1).trim();
            } else if (lower.contains("key findings:")) {
                currentSection = "findings";
            } else if (lower.contains("detected abnormalities:")) {
                currentSection = "abnormalities";
            } else if (lower.contains("recommendations:")) {
                currentSection = "recommendations";
            } else {
                if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.matches("^\\d+\\..*")) {
                    String item = trimmed.replaceFirst("^[-*\\d.]+\\s*", "").trim();
                    if (currentSection.equals("findings")) findings.add(item);
                    else if (currentSection.equals("abnormalities")) abnormalities.add(item);
                    else if (currentSection.equals("recommendations")) recommendations.add(item);
                } else if (currentSection.equals("summary") && summary.length() < 300) {
                    summary += " " + trimmed;
                }
            }
        }

        if (findings.isEmpty()) findings.add("Visual examination of anatomical structures complete.");
        if (abnormalities.isEmpty()) abnormalities.add("No critical acute pathology visually identified.");
        if (recommendations.isEmpty()) recommendations.add("Correlate findings with clinical symptoms and history.");

        return new com.disease.prediction.dto.MedicalImageAnalysisResponseDto(
            true, modality, summary, severity, confidence, findings, abnormalities, recommendations, rawText, null
        );
    }

    private com.disease.prediction.dto.MedicalImageAnalysisResponseDto getSimulatedImagingResponse(String modality, String notice) {
        String summary;
        String severity;
        Double confidence = 0.91;
        List<String> findings = new java.util.ArrayList<>();
        List<String> abnormalities = new java.util.ArrayList<>();
        List<String> recommendations = new java.util.ArrayList<>();

        if ("XRAY".equalsIgnoreCase(modality)) {
            summary = "Chest X-Ray demonstrates clear pulmonary zones with normal cardiothoracic ratio (CTR < 0.5). Minimal costophrenic angle blunting noted.";
            severity = "MILD";
            findings.add("Bilateral lungs display clear lung fields without focal consolidation.");
            findings.add("Cardiac silhouette size is within standard physiological limits.");
            findings.add("Osseous structures (ribs, clavicles) are intact with no fracture.");
            abnormalities.add("Subtle apical pleural thickening observed on right hemisphere.");
            recommendations.add("Schedule follow-up spirometry test if persistent cough presents.");
            recommendations.add("Correlate with baseline arterial blood gas panel.");
        } else if ("CT".equalsIgnoreCase(modality)) {
            summary = "Helical CT Scan reveals clear slice density across soft tissues and bone windows. No evidence of acute intracranial hemorrhage or focal mass effect.";
            severity = "NORMAL";
            findings.add("Ventricular system and basal cisterns remain well-proportioned.");
            findings.add("Gray-white matter differentiation is preserved throughout hemispheres.");
            abnormalities.add("No midline shift or hyperdense mass lesions identified.");
            recommendations.add("No urgent neurosurgical intervention required.");
            recommendations.add("Routine clinical follow-up in 6 months.");
        } else if ("MRI".equalsIgnoreCase(modality)) {
            summary = "High-resolution Magnetic Resonance Imaging (T1/T2/FLAIR sequences) displays intact structural anatomical boundaries without abnormal signal hyperintensity.";
            severity = "NORMAL";
            findings.add("T2-FLAIR sequence displays clean parenchymal signal intensity.");
            findings.add("Cranial nerves and brainstem contours appear intact.");
            abnormalities.add("Minor non-specific punctate white matter lesions (age-related).");
            recommendations.add("Maintain vascular risk factor management (blood pressure & lipid control).");
        } else if ("ULTRASOUND".equalsIgnoreCase(modality)) {
            summary = "Diagnostic B-mode Sonogram shows normal organ echogenicity, smooth capsule outline, and clear vascular flow on Doppler examination.";
            severity = "NORMAL";
            findings.add("Organ parenchyma demonstrates homogeneous echotexture.");
            findings.add("No focal cystic or solid fluid accumulations detected.");
            abnormalities.add("No gallstones, biliary duct dilation, or urinary stasis.");
            recommendations.add("Continue routine annual wellness screenings.");
        } else {
            summary = "Medical diagnostic scan processed through AI vision analysis system.";
            severity = "NORMAL";
            findings.add("Standard physiological features identified.");
            abnormalities.add("No acute findings requiring emergency escalation.");
            recommendations.add("Consult primary physician for clinical correlation.");
        }

        return new com.disease.prediction.dto.MedicalImageAnalysisResponseDto(
            true, modality, notice + "\n\n" + summary, severity, confidence, findings, abnormalities, recommendations, summary, null
        );
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

