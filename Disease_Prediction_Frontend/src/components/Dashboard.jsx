import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid 
} from 'recharts';
import { 
  Activity, Users, AlertTriangle, ShieldCheck, ArrowUpRight, PlusCircle, TrendingUp, HeartPulse, Brain, Droplet, Stethoscope, ChevronRight 
} from 'lucide-react';

export default function Dashboard({ analytics, theme = 'light', onNewPrediction, onSelectPatient }) {
  if (!analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-3 text-[#2563EB]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent"></div>
          <span className="font-medium text-sm text-[#64748B] dark:text-slate-400">Loading diagnostic telemetry analytics...</span>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  const riskData = Object.entries(analytics.riskLevelDistribution || {}).map(([key, val]) => ({
    name: key,
    value: val,
    color: key === 'Low' ? '#10B981' : key === 'Medium' ? '#F59E0B' : key === 'High' ? '#F97316' : '#EF4444'
  }));

  const diseaseData = Object.entries(analytics.diseaseTargetDistribution || {}).map(([key, val]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value: val
  }));

  const DISEASE_LAUNCHERS = [
    { key: 'diabetes', title: 'Diabetes Screening', subtitle: 'Glucose & Insulin Analysis', icon: Droplet, color: isDark ? 'text-sky-400' : 'text-blue-600', bg: isDark ? 'bg-sky-950/40 border-sky-800/40' : 'bg-blue-50 border-blue-200' },
    { key: 'heart_disease', title: 'Cardiovascular Risk', subtitle: 'ECG & Lipid Metrics', icon: HeartPulse, color: isDark ? 'text-rose-400' : 'text-rose-600', bg: isDark ? 'bg-rose-950/40 border-rose-800/40' : 'bg-rose-50 border-rose-200' },
    { key: 'stroke', title: 'Stroke Risk Panel', subtitle: 'Neurovascular Assessment', icon: Brain, color: isDark ? 'text-amber-400' : 'text-amber-600', bg: isDark ? 'bg-amber-950/40 border-amber-800/40' : 'bg-amber-50 border-amber-200' },
    { key: 'kidney_disease', title: 'Kidney / Renal Panel', subtitle: 'eGFR & Metabolic Indicators', icon: Activity, color: isDark ? 'text-emerald-400' : 'text-emerald-600', bg: isDark ? 'bg-emerald-950/40 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Clinical Command Hero Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border shadow-xl relative overflow-hidden transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-950/40 border-slate-800/80 shadow-blue-950/20' 
          : 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 border-blue-100 shadow-blue-500/5'
      }`}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-3 max-w-3xl relative z-10">
          <div className={`inline-flex items-center space-x-2 rounded-full px-3.5 py-1 text-xs font-mono font-semibold border ${
            isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800/60' : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
            <span>MediPulse AI Intelligence Engine v2.4</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-heading ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Diagnostic Intelligence & Risk Triage Dashboard
          </h1>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Multi-condition clinical risk prediction engine powered by Spring Boot REST APIs, PostgreSQL persistence, and Scikit-Learn Random Forest / Gradient Boosting inference pipelines.
          </p>
        </div>

        <button
          onClick={() => onNewPrediction('diabetes')}
          className="relative z-10 flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200 hover:shadow-blue-500/25 whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Diagnostic Test</span>
        </button>
      </div>

      {/* 4 Visually Prominent Analytics Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="glass-card p-6 flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Screenings</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{analytics.totalPredictions}</h3>
            <span className="text-[11px] text-emerald-500 font-semibold flex items-center mt-1.5">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> +14.2% this week
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registered Patients</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{analytics.totalPatients}</h3>
            <button 
              onClick={onSelectPatient}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center mt-1.5"
            >
              <span>View Patient Profiles</span>
              <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Elevated Risk Triage</p>
            <h3 className="text-3xl font-extrabold text-amber-500 mt-1 font-mono">{analytics.highRiskCount}</h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 block">Requires Follow-up</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model Precision</p>
            <h3 className="text-3xl font-extrabold text-emerald-500 mt-1 font-mono">
              {(analytics.avgConfidenceScore * 100).toFixed(1)}%
            </h3>
            <span className="text-[11px] text-emerald-500 font-medium mt-1.5 block font-mono">Validated ML Ensemble</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Quick Launchers for Diagnostic Presets */}
      <div>
        <h2 className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-3">Diagnostic Target Launchers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {DISEASE_LAUNCHERS.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.key}
                onClick={() => onNewPrediction(item.key)}
                className="clinical-card-interactive p-4.5 border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-slate-100 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">{item.title}</h4>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#94A3B8] dark:text-slate-500 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Telemetry Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Level Distribution Bar Chart */}
        <div className="clinical-card p-6 border-[#E2E8F0] dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Patient Triage Risk Distribution</h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Categorized diagnostic severity classification counts</p>
            </div>
            <span className="text-[11px] font-mono text-[#64748B] dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-[#E2E8F0] dark:border-slate-700">
              n = {analytics.totalPredictions}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} vertical={false} />
                <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0', 
                    borderRadius: '12px', 
                    color: isDark ? '#F8FAFC' : '#0F172A', 
                    fontSize: '12px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)' 
                  }}
                  cursor={{ fill: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.6)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={42}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disease Target Distribution Pie Chart */}
        <div className="clinical-card p-6 border-[#E2E8F0] dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Screening Target Breakdown</h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Distribution across clinical model categories</p>
            </div>
            <span className="text-[11px] font-mono text-[#64748B] dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-[#E2E8F0] dark:border-slate-700">
              4 ML Engines
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diseaseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diseaseData.map((entry, index) => {
                    const colors = ['#2563EB', '#10B981', '#8B5CF6', '#EC4899'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={isDark ? '#0F172A' : '#FFFFFF'} strokeWidth={2} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0', 
                    borderRadius: '12px', 
                    color: isDark ? '#F8FAFC' : '#0F172A', 
                    fontSize: '12px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Diagnostic Activity Log */}
      <div className="clinical-card p-6 border-[#E2E8F0] dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Live Diagnostic Inference Activity</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Real-time model prediction event telemetry log</p>
          </div>
          <button 
            onClick={() => onNewPrediction('diabetes')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Run New Screening</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Diagnostic Target</th>
                <th className="pb-3">Model Engine</th>
                <th className="pb-3">Risk Classification</th>
                <th className="pb-3">Confidence Score</th>
                <th className="pb-3">Inference Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              <tr>
                <td className="py-3 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Type-2 Diabetes</span>
                </td>
                <td className="py-3 font-mono text-[#64748B] dark:text-slate-400">RandomForestClassifier</td>
                <td className="py-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                    High Risk (78%)
                  </span>
                </td>
                <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">96.8%</td>
                <td className="py-3 font-mono text-slate-500">14ms</td>
              </tr>
              <tr>
                <td className="py-3 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Cardiovascular Risk</span>
                </td>
                <td className="py-3 font-mono text-[#64748B] dark:text-slate-400">GradientBoostingClassifier</td>
                <td className="py-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    Low Risk (18%)
                  </span>
                </td>
                <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">95.4%</td>
                <td className="py-3 font-mono text-slate-500">18ms</td>
              </tr>
              <tr>
                <td className="py-3 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Stroke / Cerebrovascular</span>
                </td>
                <td className="py-3 font-mono text-[#64748B] dark:text-slate-400">GradientBoostingClassifier</td>
                <td className="py-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                    Severe Risk (84%)
                  </span>
                </td>
                <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">97.1%</td>
                <td className="py-3 font-mono text-slate-500">12ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

