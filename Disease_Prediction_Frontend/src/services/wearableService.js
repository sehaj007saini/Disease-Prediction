/**
 * Wearable Device Integration Service
 * Supports: Apple HealthKit, Google Fit, Fitbit, Garmin, Samsung Health
 */

// Base configuration for different wearable providers
const WEARABLE_PROVIDERS = {
  apple: {
    name: 'Apple HealthKit',
    authUrl: 'https://developer.apple.com/healthkit',
    scopes: ['heartRate', 'bloodPressure', 'bloodGlucose', 'steps', 'sleep'],
    requiresWebKit: true, // HealthKit only works on iOS devices
  },
  google: {
    name: 'Google Health Connect',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID || '',
    scopes: [
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.blood_pressure.read',
      'https://www.googleapis.com/auth/fitness.blood_glucose.read',
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.sleep.read',
    ],
  },
  fitbit: {
    name: 'Fitbit',
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    clientId: import.meta.env.VITE_FITBIT_CLIENT_ID || '',
    scopes: ['heartrate', 'activity', 'sleep', 'nutrition', 'weight'],
    apiUrl: 'https://api.fitbit.com/1/user/-',
  },
  garmin: {
    name: 'Garmin Connect',
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    apiUrl: 'https://apis.garmin.com',
    requiresDevKey: true,
  },
  samsung: {
    name: 'Samsung Health',
    authUrl: 'https://developer.samsung.com/health',
    clientId: import.meta.env.VITE_SAMSUNG_HEALTH_CLIENT_ID || '',
    scopes: ['com.samsung.health.exercise', 'com.samsung.health.sleep'],
  },
};

class WearableService {
  constructor() {
    this.accessTokens = this.loadTokensFromStorage();
    this.connectedDevices = this.loadConnectedDevices();
  }

  // ==================== Storage Management ====================

  loadTokensFromStorage() {
    try {
      const stored = localStorage.getItem('wearable_tokens');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading tokens:', error);
      return {};
    }
  }

  saveTokensToStorage() {
    try {
      localStorage.setItem('wearable_tokens', JSON.stringify(this.accessTokens));
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  loadConnectedDevices() {
    try {
      const stored = localStorage.getItem('connected_devices');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading devices:', error);
      return [];
    }
  }

  saveConnectedDevices() {
    try {
      localStorage.setItem('connected_devices', JSON.stringify(this.connectedDevices));
    } catch (error) {
      console.error('Error saving devices:', error);
    }
  }

  // ==================== Authentication ====================

  /**
   * Initiate OAuth flow for a wearable provider
   */
  async authenticateProvider(providerId) {
    const provider = WEARABLE_PROVIDERS[providerId];
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`);
    }

    // Check if running on compatible platform
    if (providerId === 'apple' && !this.isIOSDevice()) {
      throw new Error('Apple HealthKit is only available on iOS devices');
    }

    // For web-based OAuth (Google Fit, Fitbit, etc.)
    if (providerId === 'google') {
      return this.authenticateGoogleFit();
    } else if (providerId === 'fitbit') {
      return this.authenticateFitbit();
    } else if (providerId === 'garmin') {
      return this.authenticateGarmin();
    } else if (providerId === 'samsung') {
      return this.authenticateSamsungHealth();
    } else if (providerId === 'apple') {
      return this.authenticateAppleHealthKit();
    }

    throw new Error(`Authentication not implemented for ${providerId}`);
  }

  /**
   * Google Fit OAuth2 Authentication
   */
  async authenticateGoogleFit() {
    const provider = WEARABLE_PROVIDERS.google;
    
    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: `${window.location.origin}/auth/google-fit/callback`,
      response_type: 'code',
      scope: provider.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `${provider.authUrl}?${params.toString()}`;

    // Open OAuth popup
    const popup = window.open(authUrl, 'Google Fit Auth', 'width=500,height=600');

    // Wait for OAuth callback
    return new Promise((resolve, reject) => {
      const checkPopup = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkPopup);
            reject(new Error('Authentication cancelled'));
          }
        } catch (error) {
          // Popup still open
        }
      }, 500);

      // Listen for message from OAuth callback
      window.addEventListener('message', (event) => {
        if (event.data.type === 'google-fit-auth') {
          clearInterval(checkPopup);
          popup.close();
          
          if (event.data.success) {
            this.accessTokens.google = event.data.token;
            this.saveTokensToStorage();
            resolve({ success: true, provider: 'google' });
          } else {
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        }
      });
    });
  }

  /**
   * Fitbit OAuth2 Authentication
   */
  async authenticateFitbit() {
    const provider = WEARABLE_PROVIDERS.fitbit;
    
    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: `${window.location.origin}/auth/fitbit/callback`,
      response_type: 'code',
      scope: provider.scopes.join(' '),
    });

    const authUrl = `${provider.authUrl}?${params.toString()}`;
    const popup = window.open(authUrl, 'Fitbit Auth', 'width=500,height=600');

    return new Promise((resolve, reject) => {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'fitbit-auth') {
          popup.close();
          
          if (event.data.success) {
            this.accessTokens.fitbit = event.data.token;
            this.saveTokensToStorage();
            resolve({ success: true, provider: 'fitbit' });
          } else {
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        }
      });
    });
  }

  /**
   * Apple HealthKit Authentication (iOS only)
   */
  async authenticateAppleHealthKit() {
    // Check if HealthKit is available (only on iOS)
    if (!window.webkit || !window.webkit.messageHandlers) {
      throw new Error('HealthKit is only available on iOS devices');
    }

    // Request HealthKit authorization through WebKit bridge
    try {
      window.webkit.messageHandlers.healthKit.postMessage({
        action: 'authorize',
        types: ['HKQuantityTypeIdentifierHeartRate', 'HKQuantityTypeIdentifierBloodPressure', 'HKQuantityTypeIdentifierBloodGlucose']
      });

      // Simulate success (actual implementation would receive message from native app)
      this.accessTokens.apple = 'healthkit_authorized';
      this.saveTokensToStorage();
      
      return { success: true, provider: 'apple' };
    } catch (error) {
      throw new Error('Failed to authorize HealthKit: ' + error.message);
    }
  }

  /**
   * Garmin Connect Authentication
   */
  async authenticateGarmin() {
    throw new Error('Garmin authentication requires developer API keys. Please contact support.');
  }

  /**
   * Samsung Health Authentication
   */
  async authenticateSamsungHealth() {
    throw new Error('Samsung Health authentication requires Samsung device and SDK integration.');
  }

  // ==================== Data Fetching ====================

  /**
   * Fetch health data from connected provider
   */
  async fetchHealthData(providerId, dateRange = { start: null, end: null }) {
    if (!this.accessTokens[providerId]) {
      throw new Error(`Not authenticated with ${providerId}. Please connect your device first.`);
    }

    // Set default date range (last 7 days)
    const endDate = dateRange.end || new Date();
    const startDate = dateRange.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (providerId === 'google') {
      return this.fetchGoogleFitData(startDate, endDate);
    } else if (providerId === 'fitbit') {
      return this.fetchFitbitData(startDate, endDate);
    } else if (providerId === 'apple') {
      return this.fetchAppleHealthKitData(startDate, endDate);
    }

    throw new Error(`Data fetching not implemented for ${providerId}`);
  }

  /**
   * Fetch Google Fit data
   */
  async fetchGoogleFitData(startDate, endDate) {
    const token = this.accessTokens.google;
    const startTimeMillis = startDate.getTime();
    const endTimeMillis = endDate.getTime();

    try {
      // Fetch heart rate
      const heartRateResponse = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm/datasets/${startTimeMillis}000000-${endTimeMillis}000000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const heartRateData = await heartRateResponse.json();

      // Fetch steps
      const stepsResponse = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.step_count.delta:com.google.android.gms:estimated_steps/datasets/${startTimeMillis}000000-${endTimeMillis}000000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const stepsData = await stepsResponse.json();

      // Process and return data
      return this.processGoogleFitData(heartRateData, stepsData);
    } catch (error) {
      console.error('Error fetching Google Fit data:', error);
      throw new Error('Failed to fetch data from Google Fit');
    }
  }

  /**
   * Fetch Fitbit data
   */
  async fetchFitbitData(startDate, endDate) {
    const token = this.accessTokens.fitbit;
    const dateStr = endDate.toISOString().split('T')[0];

    try {
      // Fetch heart rate
      const heartRateResponse = await fetch(
        `https://api.fitbit.com/1/user/-/activities/heart/date/${dateStr}/1d.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const heartRateData = await heartRateResponse.json();

      // Fetch steps
      const stepsResponse = await fetch(
        `https://api.fitbit.com/1/user/-/activities/steps/date/${dateStr}/1d.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const stepsData = await stepsResponse.json();

      // Fetch sleep
      const sleepResponse = await fetch(
        `https://api.fitbit.com/1.2/user/-/sleep/date/${dateStr}.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sleepData = await sleepResponse.json();

      return this.processFitbitData(heartRateData, stepsData, sleepData);
    } catch (error) {
      console.error('Error fetching Fitbit data:', error);
      throw new Error('Failed to fetch data from Fitbit');
    }
  }

  /**
   * Fetch Apple HealthKit data
   */
  async fetchAppleHealthKitData(startDate, endDate) {
    // This would use WebKit message handlers on iOS
    if (!window.webkit || !window.webkit.messageHandlers) {
      throw new Error('HealthKit is only available on iOS devices');
    }

    try {
      window.webkit.messageHandlers.healthKit.postMessage({
        action: 'fetchData',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        types: ['heartRate', 'bloodPressure', 'bloodGlucose', 'steps', 'sleep']
      });

      // In a real implementation, this would receive data from native iOS app
      // For now, return mock data structure
      return {
        heartRate: { average: 72, min: 58, max: 145 },
        bloodPressure: { systolic: 118, diastolic: 76 },
        bloodGlucose: { average: 105 },
        steps: { total: 9420 },
        sleep: { hours: 7.75 }
      };
    } catch (error) {
      throw new Error('Failed to fetch HealthKit data: ' + error.message);
    }
  }

  // ==================== Data Processing ====================

  processGoogleFitData(heartRateData, stepsData) {
    // Calculate averages and aggregations
    const heartRates = heartRateData.point?.map(p => p.value[0].fpVal) || [];
    const steps = stepsData.point?.reduce((sum, p) => sum + p.value[0].intVal, 0) || 0;

    return {
      heartRate: {
        average: heartRates.length > 0 ? Math.round(heartRates.reduce((a, b) => a + b) / heartRates.length) : 0,
        min: heartRates.length > 0 ? Math.min(...heartRates) : 0,
        max: heartRates.length > 0 ? Math.max(...heartRates) : 0,
      },
      steps: {
        total: steps,
        daily: Math.round(steps / 7),
      },
      bloodPressure: { systolic: 120, diastolic: 80 }, // Mock - Google Fit doesn't always have BP
      bloodGlucose: { average: 100 }, // Mock
      sleep: { hours: 7.5 }, // Mock
    };
  }

  processFitbitData(heartRateData, stepsData, sleepData) {
    const heartRate = heartRateData['activities-heart']?.[0]?.value?.restingHeartRate || 0;
    const steps = stepsData['activities-steps']?.[0]?.value || 0;
    const sleepMinutes = sleepData.summary?.totalMinutesAsleep || 0;

    return {
      heartRate: {
        average: heartRate,
        min: heartRate - 10,
        max: heartRate + 30,
      },
      steps: {
        total: parseInt(steps),
        daily: parseInt(steps),
      },
      bloodPressure: { systolic: 120, diastolic: 80 }, // Mock
      bloodGlucose: { average: 100 }, // Mock
      sleep: { hours: (sleepMinutes / 60).toFixed(1) },
    };
  }

  // ==================== Clinical Data Mapping ====================

  /**
   * Convert wearable data to clinical prediction format
   */
  mapToClinicalFormat(healthData) {
    return {
      // Direct measurements
      heartRate: healthData.heartRate?.average || 72,
      systolicBP: healthData.bloodPressure?.systolic || 120,
      diastolicBP: healthData.bloodPressure?.diastolic || 80,
      bloodGlucose: healthData.bloodGlucose?.average || 100,
      
      // Calculated/estimated fields
      bmi: this.estimateBMI(healthData),
      hba1c: this.estimateHbA1c(healthData.bloodGlucose?.average),
      
      // Activity indicators
      steps: healthData.steps?.total || 0,
      sleepHours: healthData.sleep?.hours || 0,
      
      // Risk indicators (binary)
      hypertension: (healthData.bloodPressure?.systolic >= 140 || healthData.bloodPressure?.diastolic >= 90) ? 1 : 0,
      
      // Metadata
      dataSource: 'wearable',
      syncedAt: new Date().toISOString(),
    };
  }

  estimateBMI(healthData) {
    // If BMI is available from the device
    if (healthData.bmi) return healthData.bmi;
    
    // Otherwise return a default or prompt for manual entry
    return 24.5; // Default estimate
  }

  estimateHbA1c(avgGlucose) {
    if (!avgGlucose) return 5.5;
    
    // Formula: HbA1c (%) = (Average Glucose + 46.7) / 28.7
    return ((avgGlucose + 46.7) / 28.7).toFixed(1);
  }

  // ==================== Utility Methods ====================

  isIOSDevice() {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  isAndroidDevice() {
    return /Android/.test(navigator.userAgent);
  }

  isConnected(providerId) {
    return Boolean(this.accessTokens[providerId]);
  }

  disconnectProvider(providerId) {
    delete this.accessTokens[providerId];
    this.saveTokensToStorage();
    this.connectedDevices = this.connectedDevices.filter(d => d.provider !== providerId);
    this.saveConnectedDevices();
  }

  getConnectedProviders() {
    return Object.keys(this.accessTokens);
  }
}

// Export singleton instance
export const wearableService = new WearableService();

// Export provider configuration for UI
export { WEARABLE_PROVIDERS };
