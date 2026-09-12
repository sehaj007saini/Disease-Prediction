# 🔑 How to Add Your Gemini API Key

Your `.env` file has been created at:
```
Disease_Prediction_Frontend/.env
```

## Step-by-Step Instructions:

### 1. Get Your Gemini API Key

1. Open your browser and go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click the **"Get API Key"** or **"Create API Key"** button
4. Copy the API key (it will look like: `AIzaSyD...`)

### 2. Add the Key to Your .env File

Open the file `Disease_Prediction_Frontend/.env` and paste your API key:

**Before:**
```env
VITE_GEMINI_API_KEY=
```

**After:**
```env
VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Restart Your Development Server

If the dev server is running, restart it:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd Disease_Prediction_Frontend
npm run dev
```

### 4. Verify It Works

1. Open your browser to `http://localhost:3000` (or your dev server URL)
2. Navigate to the **"Clinical Assistant"** tab
3. If the API key is working, you won't see the yellow warning banner
4. Try asking: "What are normal blood pressure ranges?"

---

## ⚠️ Important Notes:

### Security:
- ✅ The `.env` file is **already in `.gitignore`** - it won't be committed to Git
- ✅ Never share your API key publicly
- ✅ Never commit the `.env` file to GitHub

### Troubleshooting:

**If you still see "API Key Not Configured":**
1. Make sure there are no spaces around the `=` sign
2. Make sure the variable name is exactly: `VITE_GEMINI_API_KEY` (with `VITE_` prefix)
3. Restart the dev server (important!)
4. Check browser console for any error messages

**If you get "Invalid API Key" error:**
1. Double-check you copied the complete key from Google AI Studio
2. Make sure there are no extra spaces or line breaks
3. Verify the key is enabled in Google AI Studio
4. Try generating a new API key

---

## 🎯 Quick Test

Once configured, try these questions in the Clinical Assistant:

1. "What is a normal HbA1c level?"
2. "How to reduce stroke risk?"
3. "Explain kidney function eGFR"
4. "What are AHA blood pressure guidelines?"

You should get detailed, AI-generated responses based on medical guidelines!

---

**Need more help?** Check the main setup guide: `GEMINI_AI_SETUP.md` in the project root.
