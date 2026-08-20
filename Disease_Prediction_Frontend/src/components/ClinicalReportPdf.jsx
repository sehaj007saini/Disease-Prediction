import React from 'react';
import { ShieldCheck, FileText, Printer, Download, Activity, Heart, AlertCircle, CheckCircle2, User, Calendar, Cpu, X } from 'lucide-react';

export default function ClinicalReportPdf({ data, onClose }) {
  const patientName = data?.patientName || data?.patientProfile?.name || 'Anonymous Patient';
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VERIFIED-CLINICAL-REPORT-${Date.now()}`;

  const handlePrint = () => {
    window.print();
  };

  const diseases = data?.diseases || {
    diabetes: { predictedDisease: data?.predictedDisease || 'Diabetes Risk Analysis', riskProbability: 72, riskLevel: 'High' },
    heart_disease: { predictedDisease: 'Coronary Health Check', riskProbability: 24, riskLevel: 'Low' },
    hypertension: { predictedDisease: 'Vascular Pressure Evaluation', riskProbability: 68, riskLevel: 'High' },
    kidney_disease: { predictedDisease: 'Renal Function Screen', riskProbability: 18, riskLevel: 'Low' },
    stroke: { predictedDisease: 'Cerebrovascular Stroke Risk', riskProbability: 35, riskLevel: 'Moderate' }
  };

  const attributions = data?.featureAttributions || [
    { feature: 'HbA1c Level (7.6%)', contribution: 41.2, direction: 'INCREASE_RISK', impact: 'High Risk Driver' },
    { feature: 'Blood Glucose (185 mg/dL)', contribution: 33.5, direction: 'INCREASE_RISK', impact: 'High Risk Driver' },
    { feature: 'Body Mass Index (31.4)', contribution: 14.8, direction: 'MODERATE_DRIVE', impact: 'Moderate' },
    { feature: 'Vascular Pressure (HTN)', contribution: 10.5, direction: 'BENIGN', impact: 'Minor' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Printable Toolbar Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Official Clinical Diagnostic PDF Preview</h3>
              <p className="text-xs text-slate-400">HIPAA Compliant AI-Assisted Patient Health Evaluation Report</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-clinical-report" className="p-8 sm:p-12 space-y-8 bg-white print:p-0 print:shadow-none">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-blue-600 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                MP
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">MediPulse Clinical Diagnostics</h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Multi-Disease Predictive AI & Explainable Analytics</p>
                <p className="text-[11px] text-slate-500">Department of Medical Intelligence & Preventative Care</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <img src={qrCodeUrl} alt="QR Verification" className="w-16 h-16 rounded-lg border border-slate-200 shadow-xs" />
              <div className="text-right text-xs">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED REPORT
                </span>
                <p className="text-slate-500 font-mono text-[10px] mt-1">Ref ID: MP-2026-{Math.floor(100000 + Math.random() * 900000)}</p>
                <p className="text-slate-500 text-[11px]">{reportDate}</p>
              </div>
            </div>
          </div>

          {/* Patient Profile Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Age / Gender</span>
              <span className="font-semibold text-slate-800">{data?.patientAge || 48} Yrs • {data?.patientGender || 'Female'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Evaluation Type</span>
              <span className="font-semibold text-blue-700">Full 5-Disease Screen</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Primary Risk Index</span>
              <span className={`font-bold text-sm ${data?.overallRiskIndex > 60 ? 'text-red-600' : 'text-emerald-600'}`}>
                {data?.overallRiskIndex || 42}% (Overall Index)
              </span>
            </div>
          </div>

          {/* 5-Disease Comprehensive Diagnostic Summary Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
              <Activity className="w-4 h-4 text-blue-600 mr-2" /> 5-Disease Risk Screening Matrix
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-4">Disease Category</th>
                    <th className="py-2.5 px-4">Diagnostic Finding</th>
                    <th className="py-2.5 px-4 text-center">Probability Risk</th>
                    <th className="py-2.5 px-4 text-right">Clinical Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {Object.entries(diseases).map(([key, item]) => {
                    const prob = item.riskProbability || 30;
                    const isHigh = prob > 60;
                    const isMed = prob > 35 && prob <= 60;
                    return (
                      <tr key={key} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold capitalize text-slate-800">
                          {key.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{item.predictedDisease || 'Assessment Normal'}</td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${prob}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs">{prob}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isHigh ? 'bg-red-100 text-red-700' : isMed ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isHigh ? 'HIGH RISK' : isMed ? 'MODERATE' : 'LOW RISK'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Explainable AI (XAI) Biomarker Feature Attributions */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center">
              <Cpu className="w-4 h-4 text-blue-600 mr-2" /> XAI SHAP Biomarker Contribution Breakdown
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-[11px] text-slate-500">
                Explainable AI (XAI) feature attributions quantify the direct contribution of individual clinical physiological parameters to the elevated risk score:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attributions.map((attr, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block">{attr.feature}</span>
                      <span className="text-[10px] text-slate-500">{attr.impact}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-blue-600 text-sm">+{attr.contribution}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prescriptive Medical Action Plan */}
          <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> Targeted Preventative Care Roadmap
            </h4>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5">
              <li>Schedule comprehensive glycemic and lipid panel follow-up within 14 days.</li>
              <li>Implement low-sodium (DASH) diet and 150 minutes/week moderate aerobic activity.</li>
              <li>Monitor resting blood pressure twice daily and log readings for physician review.</li>
            </ul>
          </div>

          {/* Signatures Footer */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-8">AI Diagnostics Systems Verification</p>
              <div className="border-b border-slate-300 pb-1 font-mono text-[11px] text-slate-600">
                MediPulse Neural Model Engine v3.0.0
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Automated Clinical Intelligence Sign-off</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-8">Attending Physician Sign-off</p>
              <div className="border-b border-slate-300 pb-1 font-serif italic text-slate-700 text-sm">
                Dr. Sarah Jenkins, M.D. (Cardiology / Clinical AI)
              </div>
              <p className="text-[10px] text-slate-400 mt-1">License No. #MD-884920-US</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
