# 🔐 Secure Gemini AI Setup (Backend API)

## ✅ Benefits of Backend Approach:

- **🔒 API Key Never Exposed** - Stays on server, not in browser
- **🛡️ More Secure** - No risk of key theft from client-side
- **📊 Rate Limiting** - Can control usage per user
- **🔍 Monitoring** - Track all AI requests in one place
- **💰 Cost Control** - Prevent API abuse

---

## 🚀 Setup Instructions

### For Render (Backend Deployment):

#### Step 1: Access Render Dashboard
1. Go to: **https://dashboard.render.com/**
2. Find your **disease-backend** service (Spring Boot)
3. Click on it

#### Step 2: Add Environment Variable
1. Click **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add:
   ```
   Key:   GEMINI_API_KEY
   Value: AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Click **"Save Changes"**

#### Step 3: Redeploy
- Render will automatically redeploy your backend
- Wait ~5-7 minutes for deployment

---

### For Local Development:

#### Option 1: Using .env file (Root Directory)
1. Create/edit `.env` in project root:
   ```env
   GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. Restart your Spring Boot backend

#### Option 2: Using application.properties
1. Create `application.properties` in `src/main/resources/`:
   ```properties
   gemini.api.key=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. Restart your Spring Boot backend

---

## 🔌 API Endpoints Created:

### 1. Chat with Gemini AI
```
POST /api/v1/gemini/chat
Content-Type: application/json

Request Body:
{
  "message": "What are normal HbA1c levels?",
  "conversationHistory": [
    {
      "sender": "user",
      "text": "previous message"
    },
    {
      "sender": "bot",
      "text": "previous response"
    }
  ]
}

Response:
{
  "response": "HbA1c levels...",
  "success": true,
  "error": null
}
```

### 2. Health Check
```
GET /api/v1/gemini/health

Response: "Gemini service is running"
```

---

## ✅ Verification Steps:

### 1. Test Backend API Directly
```bash
# Test health endpoint
curl https://your-backend.onrender.com/api/v1/gemini/health

# Test chat endpoint
curl -X POST https://your-backend.onrender.com/api/v1/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is diabetes?","conversationHistory":[]}'
```

### 2. Test from Frontend
1. Open your Vercel deployed app
2. Go to "Clinical Assistant" tab
3. Ask a medical question
4. Should get detailed AI response

### 3. Check Logs
1. Go to Render Dashboard → disease-backend
2. Click "Logs" tab
3. Look for "Gemini API" messages

---

## 🔐 Security Features:

### Backend Protection:
- ✅ API key stored only on server
- ✅ Never exposed to browser/frontend
- ✅ Can add authentication checks
- ✅ Can add rate limiting per user
- ✅ Logs all AI requests

### Fallback Mechanism:
- If API key not configured → Uses smart fallback responses
- If Gemini API fails → Gracefully falls back
- No service interruption

---

## 🛠️ Troubleshooting:

### Issue: "API Key Not Found" in Logs

**Solution:**
1. Verify environment variable is set in Render
2. Check variable name is exactly `GEMINI_API_KEY`
3. Redeploy after adding variable
4. Check deployment logs for errors

### Issue: Backend Returns Fallback Responses

**Possible Causes:**
1. API key not set
2. API key is invalid
3. Gemini API quota exceeded

**Solution:**
1. Check Render environment variables
2. Verify API key in Google AI Studio
3. Check API usage limits

### Issue: CORS Error from Frontend

**Solution:**
Already configured in backend with `@CrossOrigin(origins = "*")`

If you need specific origins:
```java
@CrossOrigin(origins = "https://your-frontend.vercel.app")
```

---

## 📊 Monitoring Usage:

### Google AI Studio:
1. Go to: https://makersuite.google.com/app/apikey
2. Click on your API key
3. View usage statistics
4. Set up usage alerts

### Backend Logs:
- All Gemini requests are logged
- Monitor in Render Dashboard → Logs
- Track errors and responses

---

## 🔄 Migration Complete:

### What Changed:
- ❌ **Before:** Frontend called Gemini directly (insecure)
- ✅ **After:** Frontend → Backend → Gemini (secure)

### Frontend Changes:
- Removed `geminiService.js`
- Updated `MedAssistCopilot.jsx` to call backend `/api/v1/gemini/chat`
- No more `VITE_GEMINI_API_KEY` needed in Vercel

### Backend Changes:
- Added `GeminiService` and `GeminiServiceImpl`
- Added `GeminiController` with `/api/v1/gemini/chat` endpoint
- Uses `GEMINI_API_KEY` environment variable

---

## ✅ Deployment Checklist:

- [ ] Get Gemini API key from Google AI Studio
- [ ] Add `GEMINI_API_KEY` to Render environment variables
- [ ] Redeploy backend on Render
- [ ] Test backend API endpoint directly
- [ ] Deploy updated frontend to Vercel
- [ ] Test frontend Clinical Assistant feature
- [ ] Monitor backend logs
- [ ] Check Gemini API usage

---

**🎉 Your Gemini AI is now securely integrated via backend!**

The API key is protected on the server and never exposed to users. This is the professional, secure way to integrate AI services.
