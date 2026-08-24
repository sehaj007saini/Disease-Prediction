import React, { useState } from 'react';
import { 
  Watch, Activity, Heart, Zap, CheckCircle2, RefreshCw, X, ShieldCheck, Flame, Moon, Sliders, Smartphone 
} from 'lucide-react';

export default function WearableSyncModal({ isOpen, onClose, onApplyTelemetry }) {
  const [selectedProvider, setSelectedProvider] = useState('apple');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedData, setSyncedData] = useState(null);

  if (!isOpen) return null;

  const PROVIDERS = [
    { id: 'apple', name: 'Apple HealthKit', icon: Watch, color: 'text-[#0F172A] dark:text-white', bg: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'google', name: 'Google Health Connect', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { id: 'fitbit', name: 'Fitbit OS', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { id: 'garmin', name: 'Garmin Connect', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/50' }
  ];

  const MOCK_DEVICE_METRICS = {
    apple: {
      deviceName: "Apple Watch Series 9 (watchOS 10.4)",
      batteryLevel: "88%",
      lastSyncTime: "Just now",
      metrics: {
        glucose: 118,
        hba1c: 5.6,
        bmi: 24.2,
        hypertension: 0,
        heart_disease: 0,
        age: 42,
        heartRate: 72,
        bloodPressure: "118/76 mmHg",
        steps: "9,420 steps",
        sleep: "7h 45m"
      }
    },
    google: {
      deviceName: "Pixel Watch 2 (Wear OS 4.0)",
      batteryLevel: "94%",
      lastSyncTime: "2 mins ago",
      metrics: {
        glucose: 124,
        hba1c: 5.7,
        bmi: 25.8,
        hypertension: 0,
        heart_disease: 0,
        age: 45,
        heartRate: 75,
        bloodPressure: "122/80 mmHg",
        steps: "11,200 steps",
        sleep: "8h 10m"
      }
    },
    fitbit: {
      deviceName: "Fitbit Sense 2",
      batteryLevel: "76%",
      lastSyncTime: "5 mins ago",
      metrics: {
        glucose: 142,
        hba1c: 6.4,
        bmi: 28.5,
        hypertension: 1,
        heart_disease: 0,
        age: 54,
        heartRate: 82,
        bloodPressure: "135/88 mmHg",
        steps: "6,150 steps",
        sleep: "6h 20m"
      }
    },
    garmin: {
      deviceName: "Garmin Fenix 7 Pro",
      batteryLevel: "91%",
      lastSyncTime: "1 min ago",
      metrics: {
        glucose: 108,
        hba1c: 5.3,
        bmi: 22.8,
        hypertension: 0,
        heart_disease: 0,
        age: 38,
        heartRate: 64,
        bloodPressure: "114/72 mmHg",
        steps: "14,800 steps",
        sleep: "8h 30m"
      }
    }
  };

  const currentDevice = MOCK_DEVICE_METRICS[selectedProvider];

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncedData(currentDevice);
      setIsSyncing(false);
    }, 1100);
  };

  const handleApplyToForm = () => {
    if (!syncedData) {
      handleSyncNow();
      setTimeout(() => {
        if (onApplyTelemetry) {
          onApplyTelemetry(currentDevice.metrics);
        }
        onClose();
      }, 1200);
    } else {
      if (onApplyTelemetry) {
        onApplyTelemetry(syncedData.metrics);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-2xl overflow-hidden text-[#0F172A] dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
            <Watch className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 uppercase">
              <ShieldCheck className="h-3 w-3" />
              <span>HIPAA Compliant Health OAuth2</span>
            </div>
            <h2 className="text-xl font-bold font-heading mt-1">Wearable Telemetry Sync Hub</h2>
          </div>
        </div>

        {/* Provider Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {PROVIDERS.map((prov) => {
            const Icon = prov.icon;
            const isSelected = selectedProvider === prov.id;
            return (
              <button
                key={prov.id}
                onClick={() => {
                  setSelectedProvider(prov.id);
                  setSyncedData(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-1.5 rounded-xl inline-block mb-1.5 ${isSelected ? 'bg-white/20 text-white' : prov.bg}`}>
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : prov.color}`} />
                </div>
                <div className="text-xs font-bold truncate">{prov.name.split(' ')[0]}</div>
              </button>
            );
          })}
        </div>

        {/* Active Connected Device Card */}
        <div className="clinical-card p-5 border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connected Smartwatch</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 mt-0.5">
                <span>{currentDevice.deviceName}</span>
              </h4>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>

          {/* Telemetry Metrics Display Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-1.5 text-rose-500 font-bold mb-1">
                <Heart className="h-3.5 w-3.5" />
                <span>Resting HR</span>
              </div>
              <p className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                {currentDevice.metrics.heartRate} <span className="text-[10px] text-slate-400 font-normal">bpm</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-1.5 text-blue-500 font-bold mb-1">
                <Activity className="h-3.5 w-3.5" />
                <span>Blood Pressure</span>
              </div>
              <p className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                {currentDevice.metrics.bloodPressure}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-1.5 text-amber-500 font-bold mb-1">
                <Flame className="h-3.5 w-3.5" />
                <span>Daily Steps</span>
              </div>
              <p className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                {currentDevice.metrics.steps}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-1.5 text-indigo-500 font-bold mb-1">
                <Moon className="h-3.5 w-3.5" />
                <span>Sleep Duration</span>
              </div>
              <p className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                {currentDevice.metrics.sleep}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
            <span>Glucose Estimate: <strong className="text-blue-600 dark:text-blue-400">{currentDevice.metrics.glucose} mg/dL</strong></span>
            <span>Est. HbA1c: <strong className="text-emerald-600 dark:text-emerald-400">{currentDevice.metrics.hba1c}%</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isSyncing ? 'Fetching API Telemetry...' : 'Refresh Device Data'}</span>
          </button>

          <button
            onClick={handleApplyToForm}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition"
          >
            <Sliders className="h-4 w-4" />
            <span>Auto-Fill Clinical Matrix</span>
          </button>
        </div>

      </div>
    </div>
  );
}
