import React, { useState } from 'react';
import { Activity, ShieldAlert, FileText, CheckCircle2, Heart, ArrowRight, Zap, RefreshCw, BarChart2 } from 'lucide-react';
import { api } from '../services/api';
import ClinicalReportPdf from './ClinicalReportPdf';

export default function MultiDiseaseScreen() {
  const [patientForm, setPatientForm] = useState({
    name: 'Eleanor Vance',
    age: 52,
    gender: 'Female',
    hypertension: 1,
    heart_disease: 0,
    smoking_history: 'former',
    bmi: 29.4,
    HbA1c_level: 6.8,
    blood_glucose_level: 155
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const handleRunScreening = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.runMultiDiseasePrediction({
        patientName: patientForm.name,
        features: patientForm
      });
      setResults(res);
    } catch (err) {
      console.error('Error running 5-disease screening:', err);
    } finally {
      setLoading(false);
    }
  };

  const diseaseMap = results?.diseases || {
    diabetes: { diseaseTarget: 'diabetes', predictedDisease: 'Diabetes Positive', riskProbability: 76, riskLevel: 'High' },
    heart_disease: { diseaseTarget: 'heart_disease', predictedDisease: 'Low Heart Risk', riskProbability: 28, riskLevel: 'Low' },
    hypertension: { diseaseTarget: 'hypertension', predictedDisease: 'Hypertension High', riskProbability: 72, riskLevel: 'High' },
    kidney_disease: { diseaseTarget: 'kidney_disease', predictedDisease: 'Renal Risk Low', riskProbability: 32, riskLevel: 'Low' },
    stroke: { diseaseTarget: 'stroke', predictedDisease: 'Cerebrovascular Stroke Risk', riskProbability: 45, riskLevel: 'Moderate' }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Full-Body Diagnostic AI Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">5-Disease Comprehensive Risk Screening</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Simultaneous multi-model inference across Diabetes, Heart Disease, Hypertension, Kidney Disease, and Stroke parameters.
          </p>
        </div>
        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={handleRunScreening}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            <span>{loading ? 'Evaluating ML Models...' : 'Run Full-Body Screen'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Patient Physiological Profile
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Patient Full Name</label>
              <input
                type="text"
                value={patientForm.name}
                onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Age</label>
                <input
                  type="number"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm({ ...patientForm, age: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Gender</label>
                <select
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">HbA1c Level (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={patientForm.HbA1c_level}
                  onChange={(e) => setPatientForm({ ...patientForm, HbA1c_level: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Glucose (mg/dL)</label>
                <input
                  type="number"
                  value={patientForm.blood_glucose_level}
                  onChange={(e) => setPatientForm({ ...patientForm, blood_glucose_level: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Body Mass Index</label>
                <input
                  type="number"
                  step="0.1"
                  value={patientForm.bmi}
                  onChange={(e) => setPatientForm({ ...patientForm, bmi: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hypertension</label>
                <select
                  value={patientForm.hypertension}
                  onChange={(e) => setPatientForm({ ...patientForm, hypertension: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 dark:text-white font-medium"
                >
                  <option value={0}>No (0)</option>
                  <option value={1}>Yes (1)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunScreening}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition mt-2"
            >
              {loading ? 'Executing Models...' : 'Evaluate 5 Models'}
            </button>
          </div>
        </div>

        {/* Right Results Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Overall Index Card */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Aggregated Patient Risk Index</span>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {results?.overallRiskIndex || 51}%
                </span>
                <span className="text-xs font-bold text-amber-500 uppercase bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full">
                  Moderate Risk Profile
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <FileText className="w-4 h-4" />
              <span>Export Official Clinical PDF</span>
            </button>
          </div>

          {/* 5-Disease Cards Grid */}
          <div className="space-y-3">
            {Object.entries(diseaseMap).map(([key, item]) => {
              const prob = item.riskProbability || 30;
              const isHigh = prob > 60;
              const isMed = prob > 35 && prob <= 60;

              return (
                <div
                  key={key}
                  className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-blue-500 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      isHigh ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' :
                      isMed ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                      'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-slate-500">{item.predictedDisease}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <span className="font-mono font-bold text-base text-slate-900 dark:text-white">{prob}%</span>
                      <span className={`block text-[10px] font-bold uppercase ${
                        isHigh ? 'text-red-500' : isMed ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {isHigh ? 'High Risk' : isMed ? 'Moderate' : 'Optimal'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* PDF Modal Trigger */}
      {showPdfModal && (
        <ClinicalReportPdf
          data={{
            patientName: patientForm.name,
            patientAge: patientForm.age,
            patientGender: patientForm.gender,
            overallRiskIndex: results?.overallRiskIndex || 51,
            diseases: diseaseMap
          }}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
