import React from 'react';
import { 
  CheckCircle2, AlertTriangle, ShieldAlert, X, FileText, Printer, Stethoscope, Award, ArrowRight 
} from 'lucide-react';

export default function PredictionResultModal({ prediction, onClose, onNewPrediction }) {
  if (!prediction) return null;

  const {
    predictionId,
    patientName,
    diseaseTarget,
    predictedDisease,
    confidenceScore = 0,
    riskLevel = 'Low',
    recommendations,
    predictionDate
  } = prediction;

  const scorePct = Math.round((confidenceScore || 0) * 100);

  const getRiskBadgeClass = () => {
    switch (riskLevel?.toUpperCase()) {
      case 'LOW':
        return 'clinical-badge-low';
      case 'MEDIUM':
        return 'clinical-badge-medium';
      case 'HIGH':
        return 'clinical-badge-high';
      case 'CRITICAL':
        return 'clinical-badge-critical';
      default:
        return 'clinical-badge-low';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden text-[#0F172A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Metadata */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-mono font-semibold text-[#2563EB] border border-blue-200">
            Diagnostic Report #{predictionId || 'REC-892'}
          </span>
          <span className="text-xs text-[#64748B] font-mono">
            {predictionDate ? new Date(predictionDate).toLocaleString() : new Date().toLocaleString()}
          </span>
        </div>

        {/* Diagnostic Outcome Header */}
        <div className="space-y-1.5 border-b border-[#E2E8F0] pb-4 mb-5">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Patient: {patientName}</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-heading">
            {predictedDisease}
          </h2>
          <p className="text-xs text-[#2563EB] font-semibold">Target Classification: {diseaseTarget?.replace('_', ' ')?.toUpperCase()}</p>
        </div>

        {/* Metric Gauges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          
          {/* Risk Level Badge */}
          <div className="bg-slate-50 rounded-xl p-4 border border-[#E2E8F0] flex items-center space-x-3.5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${getRiskBadgeClass()}`}>
              {riskLevel === 'Low' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Diagnostic Triage Risk</p>
              <h4 className="text-base font-extrabold text-[#0F172A] uppercase mt-0.5">{riskLevel} Risk</h4>
            </div>
          </div>

          {/* Model Confidence Score */}
          <div className="bg-slate-50 rounded-xl p-4 border border-[#E2E8F0] flex items-center space-x-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-[#2563EB] font-mono font-extrabold text-sm shadow-xs">
              {scorePct}%
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Model Confidence Score</p>
              <h4 className="text-base font-extrabold text-[#0F172A] mt-0.5">{scorePct}% Probability</h4>
            </div>
          </div>

        </div>

        {/* Clinical Recommendations */}
        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Recommended Clinical Protocol
          </h4>
          <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#0F172A] space-y-1.5 leading-relaxed">
            {recommendations ? (
              <p>{recommendations}</p>
            ) : riskLevel === 'Low' ? (
              <p>Biomarker profile falls within standard reference bounds. Schedule routine annual physical examination and maintain standard preventative dietary lifestyle.</p>
            ) : (
              <p>Elevated risk biomarkers detected. Prompt secondary diagnostic lab panel evaluation recommended. Consult attending specialist for comprehensive clinical review.</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 text-xs text-[#64748B] hover:text-[#0F172A] font-semibold transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Clinical Summary Report</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onNewPrediction();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Stethoscope className="h-4 w-4" />
              <span>Run Another Test</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
