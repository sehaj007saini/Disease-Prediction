# Google Gemini AI Integration Guide

## Overview

The Multi-Disease Prediction Platform now integrates **Google Gemini AI** to power the MedAssist AI Clinical Assistant. This provides intelligent, context-aware medical information based on established clinical guidelines.

## Features

✅ **Real-time AI Responses** - Powered by Google's Gemini Pro model  
✅ **Clinical Context** - Pre-trained with medical guidelines (ADA, AHA, KDIGO, WHO)  
✅ **Conversation History** - Maintains context across multiple exchanges  
✅ **Fallback Support** - Works with mock responses if API key is not configured  
✅ **Safety Filters** - Built-in content safety and medical accuracy checks  

## Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit **[Google AI Studio](https://makersuite.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Select an existing Google Cloud project or create a new one
5. Copy the generated API key (starts with `AIza...`)

### Step 2: Configure Environment Variable

#### For Local Development:

1. Create a `.env` file in the **frontend directory** (`Disease_Prediction_Frontend/`):
   ```bash
   cd Disease_Prediction_Frontend
   touch .env  # or create manually
   ```

2. Add your API key to the `.env` file:
   ```env
   VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

#### For Production Deployment:

**Vercel / Netlify:**
1. Go to your project settings
2. Add environment variable: `VITE_GEMINI_API_KEY`
3. Set the value to your API key
4. Redeploy the application

**Docker Deployment:**
Add to your `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Verify Integration

1. Navigate to the **Clinical Assistant** tab in the application
2. If the API key is not configured, you'll see an informational banner
3. Once configured, the assistant will use Gemini AI for all responses
4. Test with a medical query like: *"What are normal HbA1c ranges?"*

## API Key Security

### ⚠️ Important Security Notes:

1. **Never commit your API key** to version control
   - The `.env` file is already in `.gitignore`
   - Always use `.env.example` as a template

2. **Use separate keys** for development and production
   - Generate different API keys for different environments

3. **Monitor API usage** in [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Set up usage alerts
   - Monitor quota limits

4. **Rotate keys regularly** if exposed or compromised

## API Quota & Pricing

### Free Tier (as of 2024):
- **60 requests per minute**
- **1,500 requests per day**
- Suitable for development and small-scale testing

### Paid Tier:
- Higher rate limits available
- Pay-per-request pricing
- Check [Google AI Pricing](https://ai.google.dev/pricing) for current rates

## Troubleshooting

### Issue: "API Key Not Configured" Message

**Solution:**
1. Verify `.env` file exists in `Disease_Prediction_Frontend/`
2. Check environment variable name: `VITE_GEMINI_API_KEY` (with `VITE_` prefix)
3. Restart the dev server after adding the key
4. Check browser console for error messages

### Issue: "Invalid API Key" Error

**Solution:**
1. Verify the API key is correct (starts with `AIza`)
2. Ensure there are no extra spaces in the `.env` file
3. Check that the API key is enabled in Google AI Studio
4. Verify the API is not restricted to specific domains (if using restrictions)

### Issue: "API Quota Exceeded"

**Solution:**
1. Check usage in [Google AI Studio Dashboard](https://makersuite.google.com/app/apikey)
2. Wait for quota reset (daily at midnight Pacific Time)
3. Consider upgrading to paid tier for higher limits
4. The app will automatically fall back to mock responses

### Issue: API Responses Are Slow

**Solution:**
1. Check your internet connection
2. Verify Google AI services status
3. Consider implementing response caching for common queries
4. Gemini typically responds in 1-3 seconds

## Technical Architecture

### Service Layer (`geminiService.js`)

```javascript
// Located at: src/services/geminiService.js
- Handles API initialization
- Manages conversation context
- Implements safety settings
- Provides fallback responses
- Error handling and logging
```

### Component Integration (`MedAssistCopilot.jsx`)

```javascript
// Located at: src/components/MedAssistCopilot.jsx
- User interface for chat
- Message history management
- Real-time typing indicators
- Quick prompt suggestions
- API key status display
```

## Medical Context Configuration

The Gemini AI is pre-configured with medical context:

- **Clinical Guidelines**: ADA, AHA, WHO, KDIGO
- **Disease Coverage**: Diabetes, Heart Disease, Hypertension, Kidney Disease, Stroke
- **Response Style**: Concise, evidence-based, 2-4 sentences
- **Safety**: Always recommends consulting healthcare providers

## Customization

### Adjust Model Parameters:

Edit `src/services/geminiService.js`:

```javascript
generationConfig: {
  temperature: 0.7,      // Creativity (0.0-1.0)
  topK: 40,              // Token selection diversity
  topP: 0.95,            // Nucleus sampling
  maxOutputTokens: 1024, // Response length
}
```

### Add Custom Prompts:

Edit prompt chips in `MedAssistCopilot.jsx`:

```javascript
const promptChips = [
  'Your custom medical question',
  'Another preset query',
];
```

## Support & Resources

- **Google Gemini Documentation**: https://ai.google.dev/docs
- **API Reference**: https://ai.google.dev/api
- **Community Forum**: https://discuss.ai.google.dev/
- **Pricing Details**: https://ai.google.dev/pricing

## Example Usage

```javascript
// The service automatically handles:
1. User sends message: "What is normal blood pressure?"

2. Gemini AI processes with medical context

3. Returns response: "According to AHA guidelines, 
   normal blood pressure is <120/80 mmHg. 
   Elevated: 120-129/<80. Stage 1 Hypertension: 
   130-139/80-89. Regular monitoring recommended."

4. Maintains conversation history for follow-up questions
```

## License Note

This integration uses the **Google Gemini API** which is subject to [Google's Terms of Service](https://ai.google.dev/terms). Ensure compliance with all applicable terms when deploying in production.

---

**Need Help?** Check the troubleshooting section above or consult the Google AI Studio documentation.
