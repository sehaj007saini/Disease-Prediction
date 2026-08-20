import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, TrendingDown, ArrowRight, ShieldAlert, CheckCircle2, RotateCcw, Activity } from 'lucide-react';
import { api } from '../services/api';

export default function CounterfactualSimulation() {
  const [diseaseTarget, setDiseaseTarget] = useState('diabetes');
  const [loading, setLoading] = useState(false);

  // Baseline patient parameters
  const [baseline, setBaseline] = useState({
    age: 58,
    gender: 'Male',
    hypertension: 1,
    heart_disease: 0,
    smoking_history: 'current',
    bmi: 33.5,
    HbA1c_level: 7.8,
    blood_glucose_level: 185
  });

  // Target scenario parameters (modifiable via sliders)
  const [targetParams, setTargetParams] = useState({
    age: 58,
    gender: 'Male',
    hypertension: 0,
    heart_disease: 0,
    smoking_history: 'never',
    bmi: 24.5,
    HbA1c_level: 5.5,
    blood_glucose_level: 98
  });

  const [simulationResult, setSimulationResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.simulateCounterfactual({
        diseaseTarget,
        baselineFeatures: baseline,
        targetFeatures: targetParams
      });
      setSimulationResult(res);
    } catch (err) {
      console.error('Error running counterfactual simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [diseaseTarget, targetParams]);

  const resetTargetParams = () => {
    setTargetParams({ ...baseline });
  };

  const pctRed = simulationResult?.percentageRiskReduction || 0;
  const baseProb = simulationResult?.baselineRiskProbability || 74;
  const simProb = simulationResult?.simulatedRiskProbability || 28;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Counterfactual AI Simulation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interactive "What-If" Risk Studio</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Simulate real-time physiological parameter changes to quantify preventive risk reduction deltas and construct personalized clinical care plans.
            </p>
          </div>
          <div className="flex items-center space-x-3 relative z-10">
            <select
              value={diseaseTarget}
              onChange={(e) => setDiseaseTarget(e.target.value)}
              className="bg-slate-800/90 text-white border border-slate-700 text-xs font-bold rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-md"
            >
              <option value="diabetes">Type-2 Diabetes Risk</option>
              <option value="stroke">Cerebrovascular Stroke Risk</option>
              <option value="heart_disease">Heart Disease Risk</option>
              <option value="hypertension">Vascular Hypertension Risk</option>
              <option value="kidney_disease">Renal Complication Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Parameter Sliders Studio (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Target Scenario Parameter Sliders</h2>
            </div>
            <button
              onClick={resetTargetParams}
              className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center space-x-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sliders</span>
            </button>
          </div>

          {/* Sliders Form */}
          <div className="space-y-5">
            {/* HbA1c Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                <span>HbA1c Level</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{targetParams.HbA1c_level}%</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="12.0"
                step="0.1"
                value={targetParams.HbA1c_level}
                onChange={(e) => setTargetParams({ ...targetParams, HbA1c_level: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>4.0% (Healthy)</span>
                <span>7.0% (Pre-diabetic)</span>
                <span>12.0% (Critical)</span>
              </div>
            </div>

            {/* Blood Glucose Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                <span>Fasting Blood Glucose</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{targetParams.blood_glucose_level} mg/dL</span>
              </div>
              <input
                type="range"
                min="70"
                max="260"
                step="1"
                value={targetParams.blood_glucose_level}
                onChange={(e) => setTargetParams({ ...targetParams, blood_glucose_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>70 mg/dL</span>
                <span>140 mg/dL</span>
                <span>260 mg/dL</span>
              </div>
            </div>

            {/* BMI Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                <span>Body Mass Index (BMI)</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{targetParams.bmi} kg/m²</span>
              </div>
              <input
                type="range"
                min="18.5"
                max="45.0"
                step="0.5"
                value={targetParams.bmi}
                onChange={(e) => setTargetParams({ ...targetParams, bmi: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>18.5 (Normal)</span>
                <span>25.0 (Overweight)</span>
                <span>30.0+ (Obese)</span>
              </div>
            </div>

            {/* Age Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                <span>Age Parameter</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{targetParams.age} Yrs</span>
              </div>
              <input
                type="range"
                min="20"
                max="85"
                step="1"
                value={targetParams.age}
                onChange={(e) => setTargetParams({ ...targetParams, age: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Toggles & Selects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Vascular Pressure (Hypertension)</label>
                <select
                  value={targetParams.hypertension}
                  onChange={(e) => setTargetParams({ ...targetParams, hypertension: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl p-2.5 dark:text-white"
                >
                  <option value={0}>Normal Blood Pressure (0)</option>
                  <option value={1}>Hypertensive Diagnosis (1)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Smoking History</label>
                <select
                  value={targetParams.smoking_history}
                  onChange={(e) => setTargetParams({ ...targetParams, smoking_history: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-xl p-2.5 dark:text-white"
                >
                  <option value="never">Never Smoked</option>
                  <option value="former">Former Smoker</option>
                  <option value="current">Current Smoker</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Risk Delta Visualizer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Risk Delta Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-indigo-900/50 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Live Risk Delta Simulation</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <TrendingDown className="w-3 h-3 mr-1" />
                {pctRed > 0 ? `-${pctRed}% Risk Reduction` : 'No Change'}
              </span>
            </div>

            {/* Baseline vs Target Risk Bars */}
            <div className="space-y-4">
              {/* Baseline */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Baseline Patient Risk</span>
                  <span className="font-mono font-bold text-red-400">{baseProb}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full transition-all duration-500" style={{ width: `${baseProb}%` }} />
                </div>
              </div>

              {/* Target Scenario */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Simulated Scenario Risk</span>
                  <span className="font-mono font-bold text-emerald-400">{simProb}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${simProb}%` }} />
                </div>
              </div>
            </div>

            {/* Large Highlight Box */}
            <div className="bg-indigo-900/40 border border-indigo-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-300 mb-1">Preventative Risk Optimization Potential</p>
              <h3 className="text-3xl font-black text-emerald-400 tracking-tight">
                {pctRed > 0 ? `-${pctRed}%` : '0%'}
              </h3>
              <p className="text-[11px] text-indigo-200 mt-1">
                Modifying physiological parameters yields {baseProb - simProb}% point absolute probability reduction.
              </p>
            </div>
          </div>

          {/* Actionable Clinical Roadmap */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> Actionable Patient Roadmap
            </h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                • Target HbA1c level of <strong className="text-blue-600 dark:text-blue-400">{targetParams.HbA1c_level}%</strong> reduces microvascular complications.
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                • Maintaining BMI under <strong className="text-blue-600 dark:text-blue-400">25.0 kg/m²</strong> improves insulin sensitivity.
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                • Eliminating active tobacco use stabilizes arterial wall elasticity.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
