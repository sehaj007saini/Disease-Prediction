import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PredictionForm from './components/PredictionForm';
import PredictionResultModal from './components/PredictionResultModal';
import PatientRegistry from './components/PatientRegistry';
import BatchPrediction from './components/BatchPrediction';
import SystemHealth from './components/SystemHealth';
import { api } from './services/api';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mediPulseTheme') || 'light';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [mlStatus, setMlStatus] = useState(null);
  const [backendStatus, setBackendStatus] = useState(false);
  const [initialPredictionTarget, setInitialPredictionTarget] = useState('diabetes');
  const [activePredictionResult, setActivePredictionResult] = useState(null);

  useEffect(() => {
    localStorage.setItem('mediPulseTheme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const refreshSystemStats = async () => {
    try {
      const [analyticsData, statusData] = await Promise.all([
        api.getAnalytics(),
        api.getMlServiceStatus()
      ]);
      setAnalytics(analyticsData);
      setMlStatus(statusData);
      setBackendStatus(Boolean(api.getBackendStatus()));
    } catch (err) {
      console.error('Error loading application system metrics:', err);
    }
  };

  useEffect(() => {
    refreshSystemStats();
    // Periodically refresh telemetry
    const interval = setInterval(refreshSystemStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStartPredictionWithTarget = (targetKey = 'diabetes') => {
    setInitialPredictionTarget(targetKey);
    setActiveTab('predict');
  };

  const handlePredictionComplete = (result) => {
    setActivePredictionResult(result);
    refreshSystemStats(); // Refresh dashboard stats with new prediction count
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#090D16] text-[#F8FAFC] selection:bg-[#2563EB] selection:text-white' : 'bg-[#F8FAFC] text-[#0F172A] selection:bg-[#2563EB] selection:text-white'
    }`}>
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendStatus={backendStatus}
        mlStatus={mlStatus}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            analytics={analytics}
            theme={theme}
            onNewPrediction={handleStartPredictionWithTarget}
            onSelectPatient={() => setActiveTab('patients')}
          />
        )}

        {activeTab === 'predict' && (
          <PredictionForm 
            initialTarget={initialPredictionTarget}
            onPredictionComplete={handlePredictionComplete}
          />
        )}

        {activeTab === 'patients' && (
          <PatientRegistry 
            onRunPredictionForPatient={(patientId) => {
              setActiveTab('predict');
            }}
          />
        )}

        {activeTab === 'batch' && (
          <BatchPrediction 
            onSelectPrediction={(result) => setActivePredictionResult(result)}
          />
        )}

        {activeTab === 'system' && (
          <SystemHealth 
            mlStatus={mlStatus}
          />
        )}

      </main>

      {/* Global Diagnostic Result Modal */}
      {activePredictionResult && (
        <PredictionResultModal
          prediction={activePredictionResult}
          onClose={() => setActivePredictionResult(null)}
          onNewPrediction={() => handleStartPredictionWithTarget('diabetes')}
        />
      )}

      {/* Enterprise SaaS Healthcare Footer */}
      <footer className={`border-t py-5 text-xs transition-colors duration-200 mt-auto ${
        theme === 'dark' ? 'border-[#1E293B] bg-[#0F172A]/80 text-[#94A3B8]' : 'border-[#E2E8F0] bg-white text-[#64748B] shadow-xs'
      }`}>
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>
              MediPulse Clinical AI Workspace
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span>Spring Boot & Scikit-Learn Microservice Architecture</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span>REST API: <strong className="text-[#2563EB] font-medium">Port 8080</strong></span>
            <span>ML Server: <strong className="text-[#10B981] font-medium">Port 5000</strong></span>
            <span>PostgreSQL: <strong className="text-purple-500 font-medium">Port 5432</strong></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
