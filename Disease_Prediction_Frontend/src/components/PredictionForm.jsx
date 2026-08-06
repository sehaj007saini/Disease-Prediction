import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, UserPlus, Send, RefreshCw, AlertCircle, Droplet, HeartPulse, Brain, Activity, CheckCircle2, User, Sliders
} from 'lucide-react';
import { api } from '../services/api';

const DISEASE_PRESETS = {
  diabetes: {
    title: 'Type-2 Diabetes Diagnosis',
    icon: Droplet,
    color: 'text-blue-600',
    fields: [
      { name: 'glucose', label: 'Glucose Level', unit: 'mg/dL', min: 50, max: 300, default: 120, normal: 95, elevated: 185 },
      { name: 'bmi', label: 'Body Mass Index (BMI)', unit: 'kg/m²', min: 10, max: 60, default: 24.5, normal: 22.0, elevated: 34.2 },
      { name: 'bloodPressure', label: 'Diastolic BP', unit: 'mm Hg', min: 40, max: 140, default: 72, normal: 70, elevated: 92 },
      { name: 'insulin', label: '2-Hour Serum Insulin', unit: 'mu U/ml', min: 0, max: 800, default: 85, normal: 40, elevated: 220 },
      { name: 'pregnancies', label: 'Pregnancies Count', unit: 'count', min: 0, max: 20, default: 1, normal: 0, elevated: 4 },
      { name: 'skinThickness', label: 'Triceps Skin Fold', unit: 'mm', min: 0, max: 99, default: 20, normal: 18, elevated: 38 },
      { name: 'age', label: 'Patient Age', unit: 'years', min: 1, max: 120, default: 42, normal: 30, elevated: 58 },
    ]
  },
  heart_disease: {
    title: 'Cardiovascular Risk Assessment',
    icon: HeartPulse,
    color: 'text-rose-600',
    fields: [
      { name: 'cholesterol', label: 'Serum Cholesterol', unit: 'mg/dL', min: 100, max: 600, default: 210, normal: 175, elevated: 295 },
      { name: 'restingBP', label: 'Resting Blood Pressure', unit: 'mm Hg', min: 80, max: 220, default: 128, normal: 118, elevated: 165 },
      { name: 'maxHR', label: 'Maximum Heart Rate', unit: 'bpm', min: 60, max: 220, default: 150, normal: 165, elevated: 105 },
      { name: 'chestPainType', label: 'Chest Pain Severity', unit: 'scale 0-3', min: 0, max: 3, default: 1, normal: 0, elevated: 3 },
      { name: 'exerciseAngina', label: 'Exercise Induced Angina', unit: 'binary 0/1', min: 0, max: 1, default: 0, normal: 0, elevated: 1 },
      { name: 'oldpeak', label: 'ST Depression (Oldpeak)', unit: 'mm', min: 0, max: 6, default: 1.0, normal: 0.2, elevated: 3.5 },
    ]
  },
  parkinsons: {
    title: "Parkinson's Voice Metric Analysis",
    icon: Brain,
    color: 'text-purple-600',
    fields: [
      { name: 'fo_hz', label: 'MDVP:Fo Vocal Frequency', unit: 'Hz', min: 80, max: 300, default: 150, normal: 195, elevated: 112 },
      { name: 'jitter_pct', label: 'MDVP:Jitter Frequency', unit: '%', min: 0, max: 0.1, default: 0.005, normal: 0.002, elevated: 0.025 },
      { name: 'shimmer', label: 'MDVP:Shimmer Amplitude', unit: 'dB', min: 0, max: 0.2, default: 0.03, normal: 0.015, elevated: 0.095 },
      { name: 'nhr', label: 'Noise-to-Harmonic Ratio', unit: 'NHR', min: 0, max: 1, default: 0.02, normal: 0.008, elevated: 0.18 },
      { name: 'hnr', label: 'Harmonic-to-Noise Ratio', unit: 'HNR', min: 0, max: 40, default: 22, normal: 28, elevated: 12 },
    ]
  },
  general: {
    title: 'General Clinical Panel Assessment',
    icon: Activity,
    color: 'text-emerald-600',
    fields: [
      { name: 'hemoglobin', label: 'Hemoglobin Concentration', unit: 'g/dL', min: 5, max: 20, default: 14.2, normal: 14.5, elevated: 9.8 },
      { name: 'wbcCount', label: 'WBC Count', unit: 'cells/mcL', min: 2000, max: 30000, default: 7200, normal: 6500, elevated: 16800 },
      { name: 'temperature', label: 'Body Temperature', unit: '°F', min: 95, max: 106, default: 98.6, normal: 98.6, elevated: 102.4 },
      { name: 'heartRate', label: 'Resting Pulse Rate', unit: 'bpm', min: 40, max: 180, default: 72, normal: 68, elevated: 115 },
    ]
  }
};

export default function PredictionForm({ initialTarget = 'diabetes', onPredictionComplete }) {
  const [target, setTarget] = useState(initialTarget);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [createNewPatient, setCreateNewPatient] = useState(false);
  
  // Patient details for quick registration
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(45);
  const [patientGender, setPatientGender] = useState('Female');

  // Feature map state
  const [features, setFeatures] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load patient list
  useEffect(() => {
    async function loadPatients() {
      try {
        const list = await api.getAllPatients();
        setPatients(list || []);
      } catch (err) {
        console.error('Failed to load patients list', err);
      }
    }
    loadPatients();
  }, []);

  // Sync default form features when target changes
  useEffect(() => {
    const config = DISEASE_PRESETS[target];
    if (config) {
      const initialMap = {};
      config.fields.forEach(f => {
        initialMap[f.name] = f.default;
      });
      setFeatures(initialMap);
    }
  }, [target]);

  const handleInputChange = (fieldName, value) => {
    setFeatures(prev => ({
      ...prev,
      [fieldName]: Number(value)
    }));
  };

  const handlePresetLoad = (type) => {
    const config = DISEASE_PRESETS[target];
    if (!config) return;

    const newMap = {};
    config.fields.forEach(f => {
      newMap[f.name] = type === 'normal' ? f.normal : f.elevated;
    });
    setFeatures(newMap);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let finalPatientId = selectedPatientId ? Number(selectedPatientId) : null;
      let finalPatientName = patientName;

      // If registered patient selected, pull name
      if (selectedPatientId) {
        const p = patients.find(x => String(x.id) === String(selectedPatientId));
        if (p) {
          finalPatientName = p.name;
          setPatientAge(p.age);
          setPatientGender(p.gender);
        }
      }

      // If user selected create new patient Inline
      if (createNewPatient && patientName) {
        const newP = await api.createPatient({
          name: patientName,
          age: Number(patientAge),
          gender: patientGender,
          email: `${patientName.toLowerCase().replace(/\s+/g, '.')}@patient.ehr`,
          phone: '+1 555-0192'
        });
        if (newP && newP.id) {
          finalPatientId = newP.id;
        }
      }

      const payload = {
        patientId: finalPatientId,
        patientName: finalPatientName || 'Anonymous Intake Patient',
        patientAge: Number(patientAge),
        patientGender: patientGender,
        diseaseTarget: target,
        features: features
      };

      const result = await api.createPrediction(payload);
      if (onPredictionComplete) {
        onPredictionComplete(result);
      }
    } catch (err) {
      console.error('Diagnostic inference error:', err);
      setError(err.message || 'Failed to submit diagnostic vector to machine learning engine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConfig = DISEASE_PRESETS[target] || DISEASE_PRESETS.diabetes;

  return (
    <div className="space-y-6">
      
      {/* Target Category Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {Object.entries(DISEASE_PRESETS).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = target === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTarget(key)}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all border ${
                isActive
                  ? 'bg-[#2563EB] text-white border-blue-600 shadow-sm'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-50 hover:text-[#0F172A]'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : config.color}`} />
              <span>{config.title}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Patient Demographic Intake Section */}
        <div className="clinical-card p-6 border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Patient Identification & EHR Profile</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateNewPatient(!createNewPatient);
                setSelectedPatientId('');
              }}
              className="text-xs text-[#2563EB] hover:underline flex items-center font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              <span>{createNewPatient ? 'Select Existing Patient' : '+ Register New Patient'}</span>
            </button>
          </div>

          {!createNewPatient ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#64748B] mb-1">
                  Select Registered Patient
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full clinical-input px-3 py-2 text-xs"
                >
                  <option value="">-- Quick Intake (Anonymous / Unregistered) --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      PAT-{p.id} — {p.name} ({p.gender}, Age {p.age})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedPatientId && (
                <div>
                  <label className="block text-xs font-bold text-[#64748B] mb-1">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full clinical-input px-3 py-2 text-xs"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full clinical-input px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full clinical-input px-3 py-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1">Biological Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full clinical-input px-3 py-2 text-xs"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Feature Vector Input Matrix */}
        <div className="clinical-card p-6 border-[#E2E8F0] space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Clinical Biomarker Feature Matrix
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Adjust clinical parameters or select a reference baseline below.
              </p>
            </div>

            {/* Quick Test Presets */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handlePresetLoad('normal')}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-[#10B981] hover:bg-emerald-100 transition-colors"
              >
                Load Normal Baseline
              </button>
              <button
                type="button"
                onClick={() => handlePresetLoad('elevated')}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                Load Elevated Risk Vector
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentConfig.fields.map((field) => {
              const val = features[field.name] !== undefined ? features[field.name] : field.default;
              return (
                <div key={field.name} className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-[#0F172A]">
                      {field.label}
                    </label>
                    <div className="flex items-center space-x-1.5 font-mono">
                      <span className="text-[#2563EB] font-bold">{val}</span>
                      <span className="text-[#64748B] text-[10px] uppercase">{field.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.max <= 1 ? "0.001" : "1"}
                      value={val}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full accent-[#2563EB] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.max <= 1 ? "0.001" : "1"}
                      value={val}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-20 clinical-input px-2.5 py-1 text-xs text-right font-mono"
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
                    <span>Min: {field.min}</span>
                    <span>Normal: {field.normal}</span>
                    <span>Max: {field.max}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center space-x-3 text-rose-700 text-xs">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => handlePresetLoad('normal')}
            className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Reset Vector
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 rounded-xl bg-[#2563EB] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 hover:shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Executing Diagnostic Inference...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Evaluate Risk Classification</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
