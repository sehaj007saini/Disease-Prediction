# Wearable Device Integration Guide

## Overview
MediPulse AI supports real-time health data synchronization from multiple wearable devices and fitness platforms.

---

## Supported Devices & Platforms

### ✅ Fully Supported:
1. **Google Fit / Health Connect**
   - Android Wear OS devices
   - Pixel Watch
   - Samsung Galaxy Watch (via Health Connect)
   
2. **Fitbit**
   - All Fitbit smartwatches (Sense, Versa, Charge, etc.)
   - Fitbit trackers

3. **Apple HealthKit** (iOS only)
   - Apple Watch (all models)
   - iPhone health data

### 🔄 Planned Support:
4. **Garmin Connect**
5. **Samsung Health** (native)
6. **Oura Ring**
7. **WHOOP**

---

## Setup Instructions

### 1. Google Fit Integration

#### Prerequisites:
- Google Cloud Project
- OAuth 2.0 credentials

#### Steps:

**A. Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "MediPulse-Wearable"
3. Enable Google Fit API

**B. Configure OAuth Consent Screen**
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in application details:
   - App name: MediPulse AI
   - User support email: your-email@domain.com
   - Developer contact: your-email@domain.com
4. Add scopes:
   - `https://www.googleapis.com/auth/fitness.heart_rate.read`
   - `https://www.googleapis.com/auth/fitness.blood_pressure.read`
   - `https://www.googleapis.com/auth/fitness.blood_glucose.read`
   - `https://www.googleapis.com/auth/fitness.activity.read`
   - `https://www.googleapis.com/auth/fitness.sleep.read`

**C. Create OAuth Credentials**
1. Go to "Credentials" > "Create Credentials" > "OAuth client ID"
2. Application type: Web application
3. Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:8080
   https://your-production-domain.com
   ```
4. Authorized redirect URIs:
   ```
   http://localhost:3000/auth/google-fit/callback
   https://your-production-domain.com/auth/google-fit/callback
   ```
5. Save the Client ID

**D. Add to Environment Variables**
```env
# .env file
VITE_GOOGLE_FIT_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

---

### 2. Fitbit Integration

#### Prerequisites:
- Fitbit Developer Account
- OAuth 2.0 Application

#### Steps:

**A. Register Application**
1. Go to [Fitbit Dev Portal](https://dev.fitbit.com/apps/new)
2. Fill in details:
   - Application Name: MediPulse AI
   - Description: Clinical disease prediction platform
   - Application Website: https://your-domain.com
   - Organization: Your Organization
   - OAuth 2.0 Application Type: **Personal**
   - Callback URL: `http://localhost:3000/auth/fitbit/callback`
   - Default Access Type: **Read Only**

**B. Required Scopes**
- Heart Rate
- Activity & Exercise
- Sleep
- Nutrition
- Weight

**C. Add to Environment Variables**
```env
VITE_FITBIT_CLIENT_ID=your-fitbit-client-id
VITE_FITBIT_CLIENT_SECRET=your-fitbit-client-secret
```

---

### 3. Apple HealthKit Integration (iOS Only)

#### Prerequisites:
- iOS device (iPhone/iPad)
- Native iOS app or Progressive Web App (PWA)
- Xcode project with HealthKit capability

#### Steps:

**A. Enable HealthKit in Xcode**
1. Open your iOS project in Xcode
2. Select your target
3. Go to "Signing & Capabilities"
4. Click "+ Capability" and add "HealthKit"

**B. Configure Info.plist**
```xml
<key>NSHealthShareUsageDescription</key>
<string>MediPulse AI needs access to your health data to provide accurate disease risk predictions and clinical insights.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>MediPulse AI may write assessment results to your Health app for your records.</string>
```

**C. Request Authorization (Swift)**
```swift
import HealthKit

let healthStore = HKHealthStore()

let typesToRead: Set<HKObjectType> = [
    HKObjectType.quantityType(forIdentifier: .heartRate)!,
    HKObjectType.quantityType(forIdentifier: .bloodPressureSystolic)!,
    HKObjectType.quantityType(forIdentifier: .bloodPressureDiastolic)!,
    HKObjectType.quantityType(forIdentifier: .bloodGlucose)!,
    HKObjectType.quantityType(forIdentifier: .stepCount)!,
    HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
]

healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
    if success {
        print("HealthKit authorization granted")
    }
}
```

**D. WebView Bridge (React Native / Capacitor)**
```javascript
// In your WebView
window.webkit.messageHandlers.healthKit.postMessage({
  action: 'authorize',
  types: ['heartRate', 'bloodPressure', 'bloodGlucose']
});
```

---

### 4. Backend API Setup

Create a backend endpoint to securely exchange OAuth codes for tokens.

**Example: Node.js + Express**

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const app = express();

app.post('/api/auth/wearable/exchange', async (req, res) => {
  const { provider, code, redirectUri } = req.body;

  try {
    if (provider === 'google-fit') {
      // Exchange Google Fit code
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code: code,
        client_id: process.env.GOOGLE_FIT_CLIENT_ID,
        client_secret: process.env.GOOGLE_FIT_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      return res.json({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      });
    }

    if (provider === 'fitbit') {
      // Exchange Fitbit code
      const auth = Buffer.from(
        `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
      ).toString('base64');

      const response = await axios.post(
        'https://api.fitbit.com/oauth2/token',
        new URLSearchParams({
          code: code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return res.json({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      });
    }

    res.status(400).json({ error: 'Unsupported provider' });

  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

app.listen(8080, () => console.log('Server running on port 8080'));
```

---

## Frontend Usage

### Connect Device

```javascript
import { wearableService } from './services/wearableService';

// Authenticate with Google Fit
try {
  const result = await wearableService.authenticateProvider('google');
  console.log('Connected!', result);
} catch (error) {
  console.error('Connection failed:', error);
}
```

### Fetch Health Data

```javascript
// Get last 7 days of data
const healthData = await wearableService.fetchHealthData('google', {
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  end: new Date()
});

console.log('Heart Rate:', healthData.heartRate);
console.log('Steps:', healthData.steps);
```

### Map to Clinical Format

```javascript
// Convert wearable data to clinical prediction format
const clinicalData = wearableService.mapToClinicalFormat(healthData);

// Use in prediction API
const prediction = await api.predictDisease({
  ...clinicalData,
  target: 'diabetes'
});
```

---

## Security Best Practices

### 1. **Never Store Client Secrets in Frontend**
✅ Use backend proxy for OAuth token exchange
❌ Do NOT expose `client_secret` in frontend code

### 2. **Secure Token Storage**
- Use `localStorage` with encryption
- Clear tokens on logout
- Implement token refresh logic

### 3. **HIPAA Compliance**
- Encrypt data in transit (HTTPS)
- Encrypt data at rest
- Log all access to health data
- Implement audit trails

### 4. **User Consent**
- Always request explicit user consent
- Explain what data is being collected
- Allow users to disconnect devices
- Provide data deletion options

---

## Testing

### Test with Mock Data (No API Keys Required)

The existing `WearableSyncModal` component provides mock data for testing without real API integration.

### Test with Real Devices

1. Follow setup instructions above
2. Add environment variables
3. Deploy backend proxy
4. Test OAuth flow on real device

---

## Troubleshooting

### Issue: "HealthKit is only available on iOS devices"
**Solution:** Apple HealthKit only works on native iOS apps. For web apps, use Google Fit or Fitbit instead.

### Issue: OAuth popup blocked
**Solution:** Users must allow popups for the OAuth flow. Add instructions to enable popups.

### Issue: CORS errors
**Solution:** Configure CORS on your backend:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
}));
```

### Issue: Token expired
**Solution:** Implement token refresh logic:
```javascript
async refreshToken(provider) {
  // Call backend to refresh token
  const newToken = await fetch('/api/auth/wearable/refresh', {
    method: 'POST',
    body: JSON.stringify({ provider, refreshToken })
  });
  
  this.accessTokens[provider] = newToken;
  this.saveTokensToStorage();
}
```

---

## API Rate Limits

| Provider | Rate Limit | Notes |
|----------|------------|-------|
| Google Fit | 1,000 requests/day | Per user |
| Fitbit | 150 requests/hour | Per user |
| Apple HealthKit | No API limit | Local device only |
| Garmin | 10,000 requests/day | Requires paid plan |

---

## Next Steps

1. ✅ Set up OAuth credentials for desired providers
2. ✅ Add environment variables to `.env`
3. ✅ Deploy backend token exchange endpoint
4. ✅ Test with real wearable device
5. ✅ Implement token refresh logic
6. ✅ Add error handling and user feedback
7. ✅ Monitor API usage and costs

---

## Support

For issues or questions:
- GitHub Issues: [Your Repo]
- Email: support@medipulse.ai
- Documentation: [Your Docs URL]

---

## License

Wearable integration follows the same license as the main MediPulse AI project.
