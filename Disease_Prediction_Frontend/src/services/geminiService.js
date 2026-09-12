import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = null;
    this.model = null;
    this.initialized = false;
  }

  initialize() {
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Using mock responses.');
      return false;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      });
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      return false;
    }
  }

  async sendMessage(userMessage, conversationHistory = []) {
    if (!this.initialized && !this.initialize()) {
      return this.getMockResponse(userMessage);
    }

    try {
      // Build context from conversation history
      const contextMessages = conversationHistory.map(msg => 
        `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
      ).join('\n');

      // Create medical context prompt
      const systemPrompt = `You are MedAssist AI, an expert clinical assistant integrated into a Multi-Disease Prediction Platform. 

Your role is to:
- Provide accurate, evidence-based medical information
- Explain clinical metrics and disease risk factors
- Reference ADA, AHA, KDIGO, and other clinical guidelines
- Help interpret physiological parameters and normal ranges
- Suggest preventative lifestyle modifications
- Explain AI prediction results in clinical context

IMPORTANT GUIDELINES:
- Base responses on established medical guidelines (ADA, AHA, WHO, KDIGO)
- Provide specific ranges for clinical parameters
- Always emphasize consulting healthcare providers for personalized care
- Be concise but thorough (2-4 sentences typical)
- Use medical terminology appropriately with explanations

Platform Context:
This platform predicts risk for: Diabetes, Heart Disease, Hypertension, Kidney Disease, and Stroke using ML models.

Previous conversation:
${contextMessages}

User's current question: ${userMessage}

Provide a helpful, accurate clinical response:`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Fallback to mock response on error
      if (error.message?.includes('API_KEY')) {
        return 'Error: Invalid API key. Please check your Gemini API key configuration.';
      } else if (error.message?.includes('quota')) {
        return 'Error: API quota exceeded. Please try again later or check your API limits.';
      }
      
      return this.getMockResponse(userMessage);
    }
  }

  getMockResponse(userMessage) {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('hba1c') || lower.includes('diabetes')) {
      return 'An HbA1c level of 7.2% indicates diabetic range (≥6.5% standard threshold). According to American Diabetes Association (ADA) guidelines, targeted lifestyle modifications and glycemic control (targeting HbA1c < 7.0%) reduce microvascular complications by up to 37%. Please consult your healthcare provider for personalized treatment.';
    } else if (lower.includes('stroke')) {
      return 'To reduce cerebrovascular stroke risk by 30-40%: 1) Maintain blood pressure < 120/80 mmHg, 2) Engage in 150 mins/week moderate aerobic exercise, 3) Eliminate active tobacco smoking, and 4) Follow a low-sodium Mediterranean/DASH diet. Consult your physician for personalized prevention strategies.';
    } else if (lower.includes('glucose') || lower.includes('normal range')) {
      return 'Standard Clinical Reference Ranges: Fasting Blood Glucose: 70–99 mg/dL (Normal), 100–125 mg/dL (Impaired / Pre-diabetic), ≥126 mg/dL (Diabetic indicator across 2 tests). Regular monitoring is recommended if you have risk factors.';
    } else if (lower.includes('hypertension') || lower.includes('aha') || lower.includes('blood pressure')) {
      return 'According to American Heart Association (AHA) guidelines, Stage 1 Hypertension is defined as Systolic 130–139 mmHg or Diastolic 80–89 mmHg. First-line management includes DASH diet, sodium reduction (<2,300 mg/day), weight management, and regular physical activity. Consult your doctor for appropriate treatment.';
    } else if (lower.includes('kidney') || lower.includes('renal') || lower.includes('egfr')) {
      return 'Kidney function is assessed via eGFR (estimated Glomerular Filtration Rate). Normal eGFR: >90 mL/min/1.73m². Stage 3 CKD: 30-59 mL/min. According to KDIGO guidelines, lifestyle modifications and blood pressure control are crucial for slowing progression. Regular monitoring is essential.';
    } else if (lower.includes('heart') || lower.includes('cardiovascular') || lower.includes('cardiac')) {
      return 'Cardiovascular risk factors include: hypertension, high LDL cholesterol (>100 mg/dL), smoking, diabetes, obesity, and sedentary lifestyle. AHA recommends 150 min/week moderate aerobic exercise, Mediterranean diet, and maintaining healthy BMI (18.5-24.9). Regular cardiac screenings are important.';
    } else if (lower.includes('bmi') || lower.includes('weight') || lower.includes('obesity')) {
      return 'Body Mass Index (BMI) Categories: Underweight <18.5, Normal 18.5-24.9, Overweight 25-29.9, Obese ≥30. Even 5-10% weight loss significantly reduces diabetes and cardiovascular risk. Combine caloric restriction with regular exercise for sustainable results.';
    } else {
      return 'Based on clinical guidelines (ADA/AHA/KDIGO), maintaining physiological parameters within standard reference ranges significantly lowers multi-disease risk. Please provide more specific details about your health concern, and I can offer targeted clinical information. Remember to consult healthcare providers for personalized medical advice.';
    }
  }

  async startNewChat() {
    if (this.initialized && this.model) {
      // Chat session for multi-turn conversations
      return this.model.startChat({
        history: [],
      });
    }
    return null;
  }
}

export const geminiService = new GeminiService();
