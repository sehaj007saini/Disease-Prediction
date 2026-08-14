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
      { name: 'glucose', label: 'Blood Glucose Level', unit: 'mg/dL', min: 50, max: 300, default: 120, normal: 95, elevated: 185 },
      { name: 'hba1c', label: 'HbA1c Level', unit: '%', min: 3, max: 15, default: 5.5, normal: 5.0, elevated: 7.5 },
      { name: 'bmi', label: 'Body Mass Index (BMI)', unit: 'kg/m²', min: 10, max: 60, default: 24.5, normal: 22.0, elevated: 34.2 },
      { name: 'hypertension', label: 'Hypertension History', unit: '0 (No) / 1 (Yes)', min: 0, max: 1, default: 0, normal: 0, elevated: 1 },
      { name: 'heart_disease', label: 'Heart Disease History', unit: '0 (No) / 1 (Yes)', min: 0, max: 1, default: 0, normal: 0, elevated: 1 },
      { name: 'age', label: 'Patient Age', unit: 'years', min: 1, max: 120, default: 42, normal: 30, elevated: 58 },
    ]
  },
  heart_disease: {
    title: 'Cardiovascular Risk Assessment',
    icon: HeartPulse,
    color: 'text-rose-600',
    fields: [
      { name: 'age', label: 'Patient Age', unit: 'years', min: 1, max: 120, default: 55, normal: 35, elevated: 68 },
      { name: 'hypertension', label: 'Hypertension History', unit: '0 (No) / 1 (Yes)', min: 0, max: 1, default: 0, normal: 0, elevated: 1 },
      { name: 'bmi', label: 'Body Mass Index (BMI)', unit: 'kg/m²', min: 10, max: 60, default: 27.5, normal: 22.0, elevated: 33.0 },
      { name: 'glucose', label: 'Blood Glucose Level', unit: 'mg/dL', min: 50, max: 300, default: 110, normal: 95, elevated: 160 },
      { name: 'hba1c', label: 'HbA1c Level', unit: '%', min: 3, max: 15, default: 5.8, normal: 5.2, elevated: 7.0 },
    ]
  },
  hypertension: {
    title: 'Hypertension & Vascular Risk',
    icon: Activity,
    color: 'text-amber-600',
    fields: [
      { name: 'age', label: 'Patient Age', unit: 'years', min: 1, max: 120, default: 50, normal: 35, elevated: 62 },
      { name: 'heart_disease', label: 'Heart Disease History', unit: '0 (No) / 1 (Yes)', min: 0, max: 1, default: 0, normal: 0, elevated: 1 },
      { name: 'bmi', label: 'Body Mass Index (BMI)', unit: 'kg/m²', min: 10, max: 60, default: 28.0, normal: 22.5, elevated: 34.0 },
      { name: 'glucose', label: 'Blood Glucose Level', unit: 'mg/dL', min: 50, max: 300, default: 115, normal: 95, elevated: 170 },
      { name: 'hba1c', label: 'HbA1c Level', unit: '%', min: 3, max: 15, default: 5.7, normal: 5.1, elevated: 7.2 },
    ]
  },
  kidney_disease: {
    title: 'Chronic Kidney Disease Assessment',
    icon: Brain,
    color: 'text-purple-600',
    fields: [
      { name: 'age', label: 'Patient Age', unit: 'years', min: 1, max: 120, default: 60, normal: 40, elevated: 72 },
      { name: 'hypertension', label: 'Hypertension History', unit: '0 (No) / 1 (Yes)', min: 0, max: 1, default: 1, normal: 0, elevated: 1 },
      { name: 'glucose', label: 'Blood Glucose Level', unit: 'mg/dL', min: 50, max: 300, default: 145, normal: 95, elevated: 190 },
      { name: 'hba1c', label: 'HbA1c Level', unit: '%', min: 3, max: 15, default: 6.8, normal: 5.2, elevated: 8.0 },
      { name: 'bmi', label: 'Body Mass Index (BMI)', unit: 'kg/m²', min: 10, max: 60, default: 29.5, normal: 22.0, elevated: 35.0 },
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
