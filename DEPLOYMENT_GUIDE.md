# 🚀 Deployment Guide - Gemini API Configuration

## 🔒 Security-First Architecture

**IMPORTANT:** Your application uses a **secure backend proxy** for Gemini API calls. The API key is **ONLY** stored on the backend server, never exposed to the browser.

```
Frontend → Backend API → Gemini API
         (no key)     (key stored here)
```

This prevents users from stealing your API key through browser inspection.

---

## 🎯 For Render Deployment

### Step 1: Access Render Dashboard

1. Go to https://dashboard.render.com/
2. Sign in to your account
3. Find your **disease-backend** service (NOT frontend!)

### Step 2: Add Environment Variable to Backend

1. Click on your **disease-backend** service
2. Go to **"Environment"** tab (left sidebar)
3. Click **"Add Environment Variable"** button
4. Add the following:
   ```
   Key: GEMINI_API_KEY
   Value: AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  (your actual API key)
   Type: Secret
   ```
5. Click **"Save Changes"**

### Step 3: Redeploy Backend

The service will automatically redeploy with the new environment variable.

**Alternatively, trigger manual deploy:**
1. Go to **"Manual Deploy"** section
2. Click **"Clear build cache & deploy"**

### ❌ DO NOT Add to Frontend

**Do NOT add `VITE_GEMINI_API_KEY` to the frontend service!** This would expose your API key to anyone using your website.

The frontend already routes requests through your backend at `/api/v1/gemini/chat`.

### ⏱️ Deployment Time
- Backend build time: ~5-8 minutes
- Frontend: No changes needed (already deployed)

---

## 🌐 For Vercel Deployment

### Step 1: Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **"Settings"** tab

### Step 2: Add Environment Variable

1. Click **"Environment Variables"** (left sidebar)
2. Add new variable:
   ```
   Name: VITE_GEMINI_API_KEY
   Value: AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Environment: Production, Preview, Development
   ```
3. Click **"Save"**

### Step 3: Redeploy

1. Go to **"Deployments"** tab
2. Click the three dots (...) on latest deployment
3. Click **"Redeploy"**

---

## 📦 For Netlify Deployment

### Step 1: Access Netlify Dashboard

1. Go to https://app.netlify.com/
2. Select your site
3. Go to **"Site configuration"**

### Step 2: Add Environment Variable

1. Click **"Environment variables"** (left sidebar)
2. Click **"Add a variable"**
3. Select **"Add a single variable"**
4. Fill in:
   ```
   Key: VITE_GEMINI_API_KEY
   Value: AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. Click **"Create variable"**

### Step 3: Trigger Redeploy

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"**
3. Select **"Clear cache and deploy site"**

---

## 🐳 For Docker Deployment

### Option A: Using .env File (Development/Staging)

1. Create `.env` file in project root:
   ```env
   VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. Run docker-compose:
   ```bash
   docker-compose up --build
   ```

### Option B: Using Docker Environment (Production)

1. Pass environment variable directly:
   ```bash
   docker run -e VITE_GEMINI_API_KEY=AIzaSyDxxx... your-image
   ```

2. Or use docker-compose with environment:
   ```yaml
   services:
     frontend:
       environment:
         - VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
   ```

---

## 🔍 How to Verify It's Working

### Method 1: Check Browser Console
1. Open your deployed app
2. Go to **"Clinical Assistant"** tab
3. Open browser console (F12)
4. Type: `import.meta.env.VITE_GEMINI_API_KEY`
5. Should return your API key (or "undefined" if not set)

### Method 2: Check UI Indicator
1. Go to **"Clinical Assistant"** tab
2. If API key is **NOT configured**: Yellow warning banner appears
3. If API key is **configured**: No warning banner, normal AI responses

### Method 3: Test AI Responses
1. Ask a medical question
2. If using real API: Detailed, intelligent responses
3. If using fallback: Generic, template-based responses

---

## 🔐 Security Best Practices

### ✅ DO:
- Set environment variables in deployment platform dashboard
- Use different API keys for dev/staging/production
- Monitor API usage in Google AI Studio
- Rotate keys periodically

### ❌ DON'T:
- Never commit `.env` file to Git
- Never hardcode API keys in source code
- Don't share API keys publicly
- Don't use same key across all environments

---

## 🛠️ Troubleshooting

### Issue: "API Key Not Configured" Warning Still Shows

**Possible Causes:**
1. Environment variable not set in deployment platform
2. Wrong variable name (must be `VITE_GEMINI_API_KEY`)
3. Cache not cleared after adding variable
4. Build didn't run after adding variable

**Solution:**
1. Verify variable is set in dashboard
2. Check variable name is exactly `VITE_GEMINI_API_KEY`
3. Clear build cache and redeploy
4. Check build logs for any errors

### Issue: API Key Shows as "undefined"

**Possible Causes:**
1. Variable set after build completed
2. Build process didn't include environment variable
3. Vite build cache issue

**Solution:**
1. Add environment variable BEFORE deploying
2. Trigger a fresh build after adding variable
3. Use "Clear cache and deploy" option

### Issue: Getting "Invalid API Key" Error

**Possible Causes:**
1. Wrong API key copied
2. Extra spaces in API key
3. API key disabled in Google AI Studio
4. API key has domain restrictions

**Solution:**
1. Copy API key again from Google AI Studio
2. Remove any extra spaces or line breaks
3. Check key is enabled in Google AI Studio
4. Remove or adjust domain restrictions if any

---

## 📊 Environment Variable Summary

### Required for Frontend:
```
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Optional for Frontend:
```
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
```

### Note About VITE_ Prefix:
- Vite requires `VITE_` prefix for client-side environment variables
- Only variables with `VITE_` prefix are exposed to browser
- This is a security feature to prevent exposing server-side secrets

---

## 🚀 Quick Reference

| Platform | Where to Add | Time to Deploy |
|----------|--------------|----------------|
| **Render** | Dashboard → Environment | ~5 minutes |
| **Vercel** | Settings → Environment Variables | ~2 minutes |
| **Netlify** | Site Configuration → Environment | ~3 minutes |
| **Docker** | .env file or -e flag | Immediate |

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs/environment-variables
- **Vercel Docs**: https://vercel.com/docs/concepts/projects/environment-variables
- **Netlify Docs**: https://docs.netlify.com/environment-variables/overview/
- **Vite Docs**: https://vitejs.dev/guide/env-and-mode.html
- **Google AI Studio**: https://makersuite.google.com/app/apikey

---

## ✅ Deployment Checklist

Before deploying with Gemini AI:

- [ ] Get Gemini API key from Google AI Studio
- [ ] Add `VITE_GEMINI_API_KEY` in deployment platform
- [ ] Trigger new deployment/build
- [ ] Verify no warning banner on Clinical Assistant page
- [ ] Test AI responses work correctly
- [ ] Check browser console for any errors
- [ ] Monitor API usage in Google AI Studio

---

**Last Updated:** September 12, 2026  
**Platform:** Render, Vercel, Netlify, Docker
