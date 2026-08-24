import React, { useState } from 'react';
import { 
  Watch, Activity, Heart, Zap, CheckCircle2, RefreshCw, X, ShieldCheck, Flame, Moon, Droplet, Smartphone, Apple, TrendingUp, Battery, Signal
} from 'lucide-react';

export default function WearableSyncModal({ isOpen, onClose, onApplyTelemetry }) {
  const [selectedProvider, setSelectedProvider] = useState('apple');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedData, setSyncedData] = useState(null);

  if (!isOpen) return null;

  const PROVIDERS = [
    { 
      id: 'apple', 
      name: 'Apple Health', 
      icon: Apple, 
      color: 'text-slate-900 dark:text-white',
      gradient: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'
    },
    { 
      id: 'google', 
      name: 'Google Fit', 
      icon: Smartphone, 
      color: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50'
    },
    { 
      id: 'fitbit', 
      name: 'Fitbit', 
      icon: Activity, 
      color: 'text-teal-600 dark:text-teal-400',
      gradient: 'from-teal-50 to-emerald-50 dark:from-teal-950/50 dark:to-emerald-950/50'
    },
    { 
      id: 'garmin', 
      name: 'Garmin', 
      icon: Zap, 
      color: 'text-cyan-600 dark:text-cyan-400',
      gradient: 'from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50'
    }
  ];

  const MOCK_DEVICE_METRICS = {
    apple: {
      deviceName: "Apple Watch Series 9",
      model: "watchOS 10.4",
      batteryLevel: 88,
      lastSyncTime: "Just now",
      connectionStatus: "Connected",
      metrics: {
        glucose: 118,
        hba1c: 5.6,
        bmi: 24.2,
        hypertension: 0,
        heart_disease: 0,
        age: 42,
        heartRate: 72,
        heartRateVariability: 45,
        systolicBP: 118,
        diastolicBP: 76,
        steps: 9420,
        calories: 1850,
        distance: 6.8,
        sleepHours: 7.75,
        sleepQuality: 85,
        oxygenSaturation: 98
      }
    },
    google: {
      deviceName: "Pixel Watch 2",
      model: "Wear OS 4.0",
      batteryLevel: 94,
      lastSyncTime: "2 mins ago",
      connectionStatus: "Connected",
      metrics: {
        glucose: 124,
        hba1c: 5.7,
        bmi: 25.8,
        hypertension: 0,
        heart_disease: 0,
        age: 45,
        heartRate: 75,
        heartRateVariability: 42,
        systolicBP: 122,
        diastolicBP: 80,
        steps: 11200,
        calories: 2100,
        distance: 8.2,
        sleepHours: 8.1,
        sleepQuality: 88,
        oxygenSaturation: 97
      }
    },
    fitbit: {
      deviceName: "Fitbit Sense 2",
      model: "Fitbit OS 5.3",
      batteryLevel: 76,
      lastSyncTime: "5 mins ago",
      connectionStatus: "Connected",
      metrics: {
        glucose: 142,
        hba1c: 6.4,
        bmi: 28.5,
        hypertension: 1,
        heart_disease: 0,
        age: 54,
        heartRate: 82,
        heartRateVariability: 38,
        systolicBP: 135,
        diastolicBP: 88,
        steps: 6150,
        calories: 1650,
        distance: 4.5,
        sleepHours: 6.3,
        sleepQuality: 72,
        oxygenSaturation: 96
      }
    },
    garmin: {
      deviceName: "Garmin Fenix 7 Pro",
      model: "Software 10.23",
      batteryLevel: 91,
      lastSyncTime: "1 min ago",
      connectionStatus: "Connected",
      metrics: {
        glucose: 108,
        hba1c: 5.3,
        bmi: 22.8,
        hypertension: 0,
        heart_disease: 0,
        age: 38,
        heartRate: 64,
        heartRateVariability: 52,
        systolicBP: 114,
        diastolicBP: 72,
        steps: 14800,
        calories: 2400,
        distance: 11.2,
        sleepHours: 8.5,
        sleepQuality: 92,
        oxygenSaturation: 99
      }
    }
  };

  const currentDevice = MOCK_DEVICE_METRICS[selectedProvider];
  const currentProvider = PROVIDERS.find(p => p.id === selectedProvider);

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

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className={`relative w-full max-w-4xl rounded-2xl border overflow-hidden max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b ${isDark ? 'border-[#1E293B] bg-gradient-to-r from-[#1E293B] to-[#0F172A]' : 'border-[#E2E8F0] bg-gradient-to-r from-slate-50 to-blue-50'}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25">
                  <Watch className="h-5 w-5" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    Wearable Device Sync
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    Connect your health devices for real-time biometric data
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-[#1E293B] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Provider Selection */}
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Select Device Provider
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 scale-[1.02]'
                        : isDark
                          ? 'border-[#1E293B] bg-[#0F172A] hover:border-[#334155] hover:bg-[#1E293B]'
                          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white' : isDark ? 'bg-[#1E293B]' : 'bg-slate-100'}`}>
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : prov.color}`} />
                      </div>
                      {isSelected && (
                        <div className="flex-1 flex justify-end">
                          <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                        </div>
                      )}
                    </div>
                    <div className={`text-sm font-semibold ${isSelected ? isDark ? 'text-white' : 'text-[#0F172A]' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {prov.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Status Card */}
          <div className={`rounded-xl p-5 border ${isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-gradient-to-br from-slate-50 to-blue-50 border-[#E2E8F0]'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Signal className="h-4 w-4 text-green-500" />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    {currentDevice.connectionStatus}
                  </span>
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {currentDevice.deviceName}
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                  {currentDevice.model}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <Battery className={`h-4 w-4 ${currentDevice.batteryLevel > 80 ? 'text-green-500' : currentDevice.batteryLevel > 30 ? 'text-amber-500' : 'text-red-500'}`} />
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {currentDevice.batteryLevel}%
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    {currentDevice.lastSyncTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Heart Rate */}
              <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0F172A]' : 'bg-white'} border ${isDark ? 'border-[#1E293B]' : 'border-[#E2E8F0]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-red-500/10">
                    <Heart className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Heart Rate</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {currentDevice.metrics.heartRate}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>bpm</div>
              </div>

              {/* Blood Pressure */}
              <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0F172A]' : 'bg-white'} border ${isDark ? 'border-[#1E293B]' : 'border-[#E2E8F0]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Activity className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Blood Pressure</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {currentDevice.metrics.systolicBP}/{currentDevice.metrics.diastolicBP}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>mmHg</div>
              </div>

              {/* Steps */}
              <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0F172A]' : 'bg-white'} border ${isDark ? 'border-[#1E293B]' : 'border-[#E2E8F0]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Steps Today</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {currentDevice.metrics.steps.toLocaleString()}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>{currentDevice.metrics.distance} km</div>
              </div>

              {/* Sleep */}
              <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0F172A]' : 'bg-white'} border ${isDark ? 'border-[#1E293B]' : 'border-[#E2E8F0]'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10">
                    <Moon className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Sleep</span>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {currentDevice.metrics.sleepHours.toFixed(1)}h
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Quality: {currentDevice.metrics.sleepQuality}%</div>
              </div>

            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`rounded-xl p-4 border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Glucose</div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {currentDevice.metrics.glucose} <span className="text-sm font-normal">mg/dL</span>
              </div>
            </div>
            <div className={`rounded-xl p-4 border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>HbA1c Est.</div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {currentDevice.metrics.hba1c} <span className="text-sm font-normal">%</span>
              </div>
            </div>
            <div className={`rounded-xl p-4 border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'}`}>
              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>SpO₂</div>
              <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                {currentDevice.metrics.oxygenSaturation} <span className="text-sm font-normal">%</span>
              </div>
            </div>
          </div>

          {/* HIPAA Compliance Badge */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${isDark ? 'bg-blue-950/30 border-blue-900/30' : 'bg-blue-50 border-blue-200'}`}>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            <span className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              HIPAA Compliant • OAuth 2.0 Secure Connection • Data encrypted end-to-end
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? 'border-[#1E293B] bg-[#0F172A]' : 'border-[#E2E8F0] bg-slate-50'}`}>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isDark 
                ? 'bg-[#1E293B] border border-[#334155] text-slate-200 hover:bg-[#334155]' 
                : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Refresh Data'}</span>
          </button>

          <button
            onClick={handleApplyToForm}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Auto-Fill Assessment</span>
          </button>
        </div>

      </div>
    </div>
  );
}
