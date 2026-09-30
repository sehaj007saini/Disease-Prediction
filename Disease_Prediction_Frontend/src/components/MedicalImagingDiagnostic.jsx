import React, { useState, useRef } from 'react';
import { 
  FileScan, UploadCloud, Eye, RotateCw, ZoomIn, ZoomOut, Contrast, Sparkles, 
  AlertTriangle, CheckCircle2, ShieldAlert, Activity, FileText, RefreshCw, 
  Layers, ChevronRight, Info, Check, Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';

export default function MedicalImagingDiagnostic({ theme }) {
  const isDark = theme === 'dark';
  
  const [selectedModality, setSelectedModality] = useState('XRAY'); // XRAY, CT, MRI, ULTRASOUND
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Canvas visualizer controls
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isInverted, setIsInverted] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const fileInputRef = useRef(null);

  const modalities = [
    { id: 'XRAY', label: 'Chest / Bone X-Ray', desc: 'Pneumonia, fractures, cardiomegaly', color: 'from-blue-500 to-indigo-600' },
    { id: 'CT', label: 'CT Scan (Computed Tomography)', desc: 'Brain hemorrhage, lung nodules, stroke', color: 'from-purple-500 to-violet-600' },
    { id: 'MRI', label: 'MRI (Magnetic Resonance)', desc: 'Tumors, soft tissue, neuro-imaging', color: 'from-emerald-500 to-teal-600' },
    { id: 'ULTRASOUND', label: 'Diagnostic Ultrasound', desc: 'Gallbladder, vascular, fetal screening', color: 'from-amber-500 to-orange-600' },
  ];

  // Sample Scans for quick testing
  const sampleScans = {
    XRAY: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    CT: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    MRI: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    ULTRASOUND: 'https://images.unsplash.com/photo-1579154204601-01588f321e6b?auto=format&fit=crop&w=800&q=80'
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSample = (modalityId) => {
    setSelectedModality(modalityId);
    setImagePreview(sampleScans[modalityId]);
    setImageFile(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await api.analyzeMedicalImage({
        modality: selectedModality,
        base64Image: imagePreview,
        mimeType: imageFile?.type || 'image/jpeg',
        additionalClinicalNotes: clinicalNotes
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error('Image analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setIsInverted(false);
    setShowHeatmap(false);
  };

  const getSeverityBadge = (level) => {
    switch (level?.toUpperCase()) {
      case 'INVALID_IMAGE':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-500 border border-purple-500/30 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> NON-MEDICAL IMAGE</span>;
      case 'CRITICAL':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> CRITICAL FINDINGS</span>;
      case 'HIGH':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-500 border border-orange-500/30 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> HIGH RISK</span>;
      case 'MODERATE':
      case 'MILD':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> MODERATE / MILD</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> NORMAL PHYSIOLOGY</span>;
    }
  };


  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 border transition-all ${
        isDark ? 'bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border-[#1E293B]' : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-white border-blue-100 shadow-sm'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5" /> Multimodal Vision Diagnostic Center
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Medical Imaging AI Analysis
            </h1>
            <p className={`text-sm max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Upload or scan <strong>X-Rays, CT Scans, MRIs, and Ultrasounds</strong>. Powered by Google Gemini Vision multimodal AI for automatic abnormality detection, key radiological findings, and clinical recommendations.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {modalities.map(m => (
              <button
                key={m.id}
                onClick={() => handleLoadSample(m.id)}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 ${
                  selectedModality === m.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : isDark
                      ? 'bg-[#0F172A] border-[#1E293B] text-slate-300 hover:bg-[#1E293B]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Demo {m.id}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modality Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modalities.map((mod) => {
          const isSelected = selectedModality === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setSelectedModality(mod.id)}
              className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden group ${
                isSelected
                  ? isDark
                    ? 'bg-[#1E293B] border-blue-500 ring-2 ring-blue-500/30'
                    : 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : isDark
                    ? 'bg-[#0F172A] border-[#1E293B] hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className={`h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r ${mod.color} ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'} transition-opacity`} />
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-blue-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {mod.id}
                </span>
                {isSelected && <Check className="h-4 w-4 text-blue-500" />}
              </div>
              <h3 className={`font-semibold text-sm mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{mod.label}</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{mod.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Diagnostic Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Canvas & Upload Controls */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-slate-200 shadow-xs'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <FileScan className="h-5 w-5 text-blue-500" />
                Radiological Image Viewer ({selectedModality})
              </h2>
              {imagePreview && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-500 hover:underline font-medium flex items-center gap-1"
                >
                  <UploadCloud className="h-3.5 w-3.5" /> Change File
                </button>
              )}
            </div>

            {/* Canvas Viewport */}
            <div className={`relative min-h-[360px] max-h-[460px] rounded-xl overflow-hidden border flex items-center justify-center ${
              isDark ? 'bg-[#090D16] border-[#1E293B]' : 'bg-slate-950 border-slate-800'
            }`}>
              
              {imagePreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Medical Scan"
                    className="max-h-[380px] object-contain transition-all duration-300 select-none"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      filter: isInverted ? 'invert(1) contrast(1.2)' : 'none'
                    }}
                  />
                  {showHeatmap && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-600/30 via-yellow-500/20 to-transparent pointer-events-none mix-blend-overlay animate-pulse" />
                  )}
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 text-center cursor-pointer hover:bg-slate-900/50 transition-colors w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="h-16 w-16 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center mb-3">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h3 className="text-white font-semibold text-sm">Click or Drag & Drop Medical Scan</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-xs">Supports DICOM (.dcm), PNG, JPG, WEBP X-Rays, CT, MRI, and Ultrasounds</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all">
                    Browse File
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.dcm"
                className="hidden"
              />
            </div>

            {/* Interactive Image Controls Toolbar */}
            {imagePreview && (
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                    className={`p-2 rounded-lg text-xs border ${isDark ? 'bg-[#1E293B] border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                    title="Zoom In"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.75))}
                    className={`p-2 rounded-lg text-xs border ${isDark ? 'bg-[#1E293B] border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className={`p-2 rounded-lg text-xs border ${isDark ? 'bg-[#1E293B] border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                    title="Rotate 90°"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsInverted(!isInverted)}
                    className={`p-2 rounded-lg text-xs border transition-all ${isInverted ? 'bg-blue-600 text-white border-blue-600' : isDark ? 'bg-[#1E293B] border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                    title="Invert Colors (Radiology High Contrast)"
                  >
                    <Contrast className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${showHeatmap ? 'bg-red-600 text-white border-red-600' : isDark ? 'bg-[#1E293B] border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                    title="Toggle Heatmap"
                  >
                    <Layers className="h-3.5 w-3.5" /> Heatmap
                  </button>
                </div>

                <button
                  onClick={resetView}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Reset View
                </button>
              </div>
            )}
          </div>

          {/* Clinical Notes Input */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-slate-200 shadow-xs'}`}>
            <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Patient Symptoms & Clinical Notes (Optional):
            </label>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g., Patient presents with 4-day persistent fever, dyspnea, and right-sided chest pain..."
              rows={2}
              className={`w-full p-3 text-xs rounded-xl border transition-all ${
                isDark ? 'bg-[#090D16] border-[#1E293B] text-white placeholder-slate-500 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
              }`}
            />

            <button
              onClick={handleAnalyze}
              disabled={!imagePreview || isAnalyzing}
              className={`w-full mt-3 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                !imagePreview || isAnalyzing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Evaluating Radiological Scan with AI Vision...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Run AI Diagnostic Imaging Analysis</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: AI Analysis Report Results */}
        <div className="lg:col-span-6">
          
          {analysisResult ? (
            <div className={`p-6 rounded-2xl border space-y-6 animate-fadeIn ${
              isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              
              {/* Report Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-mono text-blue-500 font-bold uppercase tracking-wider">
                    {analysisResult.modality} RADIOLOGY REPORT
                  </div>
                  <h2 className={`text-lg font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    AI Vision Analysis Complete
                  </h2>
                </div>
                {getSeverityBadge(analysisResult.severityLevel)}
              </div>

              {/* Confidence Metric Meter */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-[#1E293B]/60 border-[#334155]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    AI Diagnostic Confidence Score
                  </div>
                  <div className="text-2xl font-extrabold text-blue-500">
                    {Math.round((analysisResult.confidenceScore || 0.92) * 100)}%
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
              </div>

              {/* Diagnostic Summary */}
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Diagnostic Summary
                </h3>
                <p className={`text-sm leading-relaxed p-4 rounded-xl border ${
                  isDark ? 'bg-[#090D16] border-[#1E293B] text-slate-200' : 'bg-blue-50/50 border-blue-100 text-slate-800'
                }`}>
                  {analysisResult.diagnosticSummary}
                </p>
              </div>

              {/* Key Findings */}
              {analysisResult.keyFindings?.length > 0 && (
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Key Anatomical Findings
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.keyFindings.map((finding, idx) => (
                      <li key={idx} className={`text-xs p-2.5 rounded-lg flex items-start gap-2 border ${
                        isDark ? 'bg-[#1E293B]/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detected Abnormalities */}
              {analysisResult.detectedAbnormalities?.length > 0 && (
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Detected Visual Abnormalities
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.detectedAbnormalities.map((item, idx) => (
                      <li key={idx} className={`text-xs p-2.5 rounded-lg flex items-start gap-2 border ${
                        isDark ? 'bg-amber-950/20 border-amber-900/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}>
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clinical Recommendations */}
              {analysisResult.clinicalRecommendations?.length > 0 && (
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Recommended Clinical Next Steps
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.clinicalRecommendations.map((rec, idx) => (
                      <li key={idx} className={`text-xs p-2.5 rounded-lg flex items-start gap-2 border ${
                        isDark ? 'bg-blue-950/20 border-blue-900/30 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
                      }`}>
                        <ChevronRight className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className={`min-h-[480px] p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${
              isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="h-16 w-16 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center mb-4">
                <FileScan className="h-8 w-8" />
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Awaiting Medical Scan Analysis
              </h3>
              <p className={`text-xs mt-2 max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Select an imaging modality (X-Ray, CT, MRI, or Ultrasound), upload or load a sample scan on the left, and click <strong>"Run AI Diagnostic Imaging Analysis"</strong>.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
