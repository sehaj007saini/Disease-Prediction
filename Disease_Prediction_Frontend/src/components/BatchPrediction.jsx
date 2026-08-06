import React, { useState } from 'react';
import { Layers, Play, CheckCircle2, AlertTriangle, FileCode, RefreshCw, ArrowRight, FileText } from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_BATCH_JSON = JSON.stringify({
  predictions: [
    {
      patientName: "Robert Vance",
      patientAge: 58,
      patientGender: "Male",
      diseaseTarget: "diabetes",
      features: { glucose: 175, bmi: 31.4, bloodPressure: 88, insulin: 190, age: 58 }
    },
    {
      patientName: "Elena Rostova",
      patientAge: 32,
      patientGender: "Female",
      diseaseTarget: "heart_disease",
      features: { cholesterol: 180, restingBP: 115, maxHR: 172, chestPainType: 0 }
    },
    {
      patientName: "Charles Montgomery",
      patientAge: 67,
      patientGender: "Male",
      diseaseTarget: "parkinsons",
      features: { fo_hz: 110.2, jitter_pct: 0.018, shimmer: 0.075, nhr: 0.12, hnr: 14.2 }
    }
  ]
}, null, 2);

export default function BatchPrediction({ onSelectPrediction }) {
  const [jsonInput, setJsonInput] = useState(SAMPLE_BATCH_JSON);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunBatch = async () => {
    setIsProcessing(true);
    setError(null);
    setBatchResult(null);

    try {
      const parsedPayload = JSON.parse(jsonInput);
      if (!parsedPayload.predictions || !Array.isArray(parsedPayload.predictions)) {
        throw new Error("Payload must contain a 'predictions' array of objects.");
      }

      const response = await api.createBatchPredictions(parsedPayload);
      setBatchResult(response);
    } catch (err) {
      setError(err.message || "Invalid JSON syntax or batch engine processing failure.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="clinical-card p-6 border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Bulk Diagnostic Batch Ingestion</h2>
            <p className="text-xs text-[#64748B]">Parallel feature vector inference engine (`/api/v1/predictions/batch`).</p>
          </div>
        </div>

        <button
          onClick={() => setJsonInput(SAMPLE_BATCH_JSON)}
          className="flex items-center space-x-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#2563EB] hover:bg-slate-50 transition-colors shadow-xs"
        >
          <FileCode className="h-4 w-4" />
          <span>Load Standard Sample Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input JSON Editor */}
        <div className="clinical-card p-6 border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Ingestion Payload Editor (JSON Format)
            </label>
            <span className="text-[10px] font-mono text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-semibold">
              Array of Patient Objects
            </span>
          </div>

          <textarea
            rows={14}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full rounded-xl clinical-input p-4 text-xs font-mono leading-relaxed bg-slate-50/70 border border-[#E2E8F0] text-[#0F172A] focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
            placeholder="Paste your JSON payload here..."
          ></textarea>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleRunBatch}
            disabled={isProcessing}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#2563EB] px-4 py-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 hover:shadow-md disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running Multi-Patient Inference...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Execute Batch Ingestion</span>
              </>
            )}
          </button>
        </div>

        {/* Batch Output Stream */}
        <div className="clinical-card p-6 border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Diagnostic Batch Output Results
            </h3>
            {batchResult && (
              <span className="text-[11px] font-mono text-[#10B981] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-semibold">
                Processed {batchResult.processedCount || batchResult.length || 0} Records
              </span>
            )}
          </div>

          {!batchResult ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#64748B] text-xs border border-dashed border-[#E2E8F0] rounded-xl bg-slate-50/50">
              <FileText className="h-8 w-8 text-[#94A3B8] mb-2" />
              <p className="font-semibold text-[#0F172A]">No batch results generated yet.</p>
              <p className="text-[11px] text-[#64748B] mt-1 max-w-xs">Submit a valid JSON payload on the left to execute multi-patient diagnostic evaluation.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {(Array.isArray(batchResult) ? batchResult : batchResult.results || []).map((res, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A]">{res.patientName || `Patient #${i+1}`}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                      res.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      res.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {res.riskLevel || 'Analyzed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Diagnostic Result: <strong className="text-[#0F172A]">{res.predictedDisease}</strong></span>
                    <span className="font-mono font-semibold text-[#2563EB]">{((res.confidenceScore || 0) * 100).toFixed(1)}%</span>
                  </div>

                  <button
                    onClick={() => onSelectPrediction && onSelectPrediction(res)}
                    className="text-[11px] text-[#2563EB] hover:underline flex items-center font-semibold mt-1 pt-2 border-t border-[#E2E8F0]"
                  >
                    <span>View Full Clinical Report</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
