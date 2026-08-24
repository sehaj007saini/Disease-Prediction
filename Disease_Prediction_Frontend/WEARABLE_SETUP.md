# 🔗 Wearable Device Integration - Quick Start

## Overview
MediPulse AI can sync health data directly from your smartwatch or fitness tracker to pre-fill clinical assessments with real-time biometric data.

---

## 🚀 Quick Start (Development)

### 1. **Use Mock Data (No Setup Required)**

The wearable sync feature works out-of-the-box with realistic mock data for testing:

```bash
npm run dev
```

Click "Sync Devices" button → Select provider → Click "Auto-Fill Clinical Matrix"

### 2. **Connect Real Devices (Optional)**

Follow the full [WEARABLE_INTEGRATION_GUIDE.md](../../WEARABLE_INTEGRATION_GUIDE.md) in the project root.

---

## 📱 Supported Devices

| Device/Platform | Status | Setup Required |
|----------------|--------|----------------|
| **Google Fit** | ✅ Ready | OAuth credentials |
| **Fitbit** | ✅ Ready | OAuth credentials |
| **Apple HealthKit** | ✅ Ready | iOS app only |
| Garmin Connect | 🔄 Planned | API keys |
| Samsung Health | 🔄 Planned | API keys |
| Oura Ring | 🔄 Planned | API keys |

---

## 🎯 Features

### Current:
- ✅ Mock data for all providers
- ✅ Real-time heart rate display
- ✅ Blood pressure monitoring
- ✅ Activity tracking (steps)
- ✅ Sleep duration
- ✅ Auto-fill prediction forms
- ✅ Multi-provider support

### With Real Integration:
- 📊 Live data sync from devices
- 🔄 Continuous background sync
- 📈 Historical trend analysis
- 🔔 Alerts for abnormal readings
- 💾 Automatic clinical record updates

---

## 🛠️ Development Setup

### File Structure

```
Disease_Prediction_Frontend/
├── src/
│   ├── services/
│   │   └── wearableService.js      # Main integration logic
│   ├── components/
│   │   ├── WearableSyncModal.jsx   # UI modal
│   │   └── OAuthCallback.jsx       # OAuth handler
│   └── .env.example                 # Config template
```

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your OAuth credentials (optional for development):

```env
VITE_GOOGLE_FIT_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_FITBIT_CLIENT_ID=your-fitbit-client-id
```

---

## 📖 Usage in Code

### Import Service

```javascript
import { wearableService } from './services/wearableService';
```

### Connect Device

```javascript
// Authenticate with provider
try {
  await wearableService.authenticateProvider('google');
  console.log('✅ Connected to Google Fit');
} catch (error) {
  console.error('❌ Connection failed:', error);
}
```

### Fetch Health Data

```javascript
// Get last 7 days of data
const healthData = await wearableService.fetchHealthData('google');

console.log('Heart Rate:', healthData.heartRate.average);
console.log('Steps:', healthData.steps.total);
console.log('Blood Pressure:', healthData.bloodPressure);
```

### Map to Clinical Format

```javascript
// Convert wearable data to prediction format
const clinicalData = wearableService.mapToClinicalFormat(healthData);

// Returns:
// {
//   heartRate: 72,
//   systolicBP: 120,
//   diastolicBP: 80,
//   bloodGlucose: 105,
//   bmi: 24.5,
//   hba1c: 5.6,
//   steps: 9420,
//   sleepHours: 7.5,
//   hypertension: 0,
//   dataSource: 'wearable'
// }
```

---

## 🔐 Security & Privacy

### Data Handling
- ✅ All health data encrypted in transit (HTTPS)
- ✅ OAuth 2.0 for secure authentication
- ✅ No passwords stored
- ✅ Tokens stored locally, never sent to backend
- ✅ HIPAA-compliant architecture

### User Control
- ✅ Users can disconnect devices anytime
- ✅ Explicit consent required
- ✅ Data deletion on demand
- ✅ Audit logs for all access

---

## 🧪 Testing

### Test Mock Data

```bash
npm run dev
```

1. Click "Sync Devices"
2. Select any provider (Apple, Google, Fitbit, Garmin)
3. Click "Auto-Fill Clinical Matrix"
4. View pre-filled form with realistic biometric data

### Test Real Integration

1. Set up OAuth credentials (see main guide)
2. Add credentials to `.env`
3. Deploy backend proxy
4. Test with real device

---

## 🐛 Troubleshooting

### "OAuth popup blocked"
**Solution:** Allow popups in browser settings

### "HealthKit only available on iOS"
**Solution:** Use Google Fit or Fitbit for web testing

### "Failed to fetch data"
**Solution:** Check OAuth tokens and API quotas

### "CORS errors"
**Solution:** Configure CORS on backend

---

## 📚 API Reference

### `wearableService.authenticateProvider(providerId)`
Initiate OAuth flow for a provider.

**Parameters:**
- `providerId`: `'google'` | `'fitbit'` | `'apple'` | `'garmin'`

**Returns:** `Promise<{ success: boolean, provider: string }>`

---

### `wearableService.fetchHealthData(providerId, dateRange?)`
Fetch health data from provider.

**Parameters:**
- `providerId`: Provider ID
- `dateRange`: `{ start: Date, end: Date }` (optional, defaults to last 7 days)

**Returns:** `Promise<HealthData>`

---

### `wearableService.mapToClinicalFormat(healthData)`
Convert wearable data to clinical prediction format.

**Parameters:**
- `healthData`: Raw health data object

**Returns:** Clinical data object ready for prediction API

---

### `wearableService.isConnected(providerId)`
Check if provider is connected.

**Returns:** `boolean`

---

### `wearableService.disconnectProvider(providerId)`
Disconnect and remove tokens for provider.

---

## 🚀 Production Deployment

### Requirements:
1. ✅ OAuth credentials configured
2. ✅ Backend proxy deployed
3. ✅ HTTPS enabled
4. ✅ CORS configured
5. ✅ Rate limiting implemented

### Checklist:
- [ ] Environment variables set
- [ ] OAuth redirect URIs updated
- [ ] Token refresh logic implemented
- [ ] Error handling added
- [ ] User notifications configured
- [ ] Analytics tracking added
- [ ] HIPAA compliance verified

---

## 📞 Support

Questions or issues?
- 📖 [Full Integration Guide](../../WEARABLE_INTEGRATION_GUIDE.md)
- 🐛 [Report Bug](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

---

## 📄 License

Same as MediPulse AI main project.
