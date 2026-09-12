# Quick Start: Enable Gemini AI in 3 Steps

## 🚀 Get Started in Under 2 Minutes

### Step 1: Get Your API Key (30 seconds)
1. Visit: **https://makersuite.google.com/app/apikey**
2. Click **"Get API Key"** or **"Create API Key"**
3. Copy the key (starts with `AIza...`)

### Step 2: Add to Project (30 seconds)
1. Navigate to `Disease_Prediction_Frontend/` folder
2. Create a file named `.env`
3. Add this line (replace with your actual key):
   ```
   VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 3: Restart Dev Server (10 seconds)
```bash
cd Disease_Prediction_Frontend
npm run dev
```

## ✅ That's It!

Navigate to the **Clinical Assistant** tab and start chatting with AI-powered medical insights!

## 📚 Need More Help?

See the complete guide: [GEMINI_AI_SETUP.md](./GEMINI_AI_SETUP.md)

## 💡 Example Queries

Try asking:
- "What are normal HbA1c ranges?"
- "How to reduce cardiovascular risk?"
- "Explain kidney function eGFR levels"
- "AHA guidelines for blood pressure"

---

**Note:** The app works without an API key using fallback responses, but Gemini AI provides more intelligent, context-aware answers based on real medical guidelines.
