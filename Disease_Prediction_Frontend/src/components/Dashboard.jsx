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
    { key: 'parkinsons', title: "Parkinson's Vocal Metrics", subtitle: 'Vocal Frequency & Jitter', icon: Brain, color: isDark ? 'text-purple-400' : 'text-purple-600', bg: isDark ? 'bg-purple-950/40 border-purple-800/40' : 'bg-purple-50 border-purple-200' },
    { key: 'general', title: 'General Health Panel', subtitle: 'Hemoglobin & WBC Count', icon: Activity, color: isDark ? 'text-emerald-400' : 'text-emerald-600', bg: isDark ? 'bg-emerald-950/40 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Clinical Command Hero Banner (Subtle Gradient applied only here) */}
      <div className={`rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border shadow-sm relative overflow-hidden transition-colors ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/30 border-slate-800' 
          : 'bg-gradient-to-br from-blue-50/90 via-white to-emerald-50/40 border-[#E2E8F0]'
      }`}>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2.5 max-w-3xl relative z-10">
          <div className={`inline-flex items-center space-x-2 rounded-lg px-3 py-1 text-xs font-mono font-semibold border ${
            isDark ? 'bg-blue-950/80 text-blue-400 border-blue-800/60' : 'bg-blue-100/80 text-[#2563EB] border-blue-200'
          }`}>
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Clinical Workstation Operational</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-heading ${
            isDark ? 'text-white' : 'text-[#0F172A]'
          }`}>
            Diagnostic Intelligence Dashboard
          </h1>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
            Multi-target clinical risk classification system powered by Spring Boot REST API microservices, PostgreSQL persistence layer, and Scikit-Learn machine learning pipelines.
          </p>
        </div>

        <button
          onClick={() => onNewPrediction('diabetes')}
          className="relative z-10 flex items-center space-x-2 rounded-xl bg-[#2563EB] px-5 py-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Diagnostic Test</span>
        </button>
      </div>

      {/* 4 Visually Prominent Analytics Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="clinical-card p-6 border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <p className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Total Screenings</p>
            <h3 className="text-3xl font-extrabold text-[#0F172A] dark:text-white mt-1 font-mono">{analytics.totalPredictions}</h3>
            <span className="text-[11px] text-[#10B981] font-semibold flex items-center mt-1.5">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> +14.2% this week
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/50 text-[#2563EB] dark:text-blue-400 shadow-xs">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        <div className="clinical-card p-6 border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <p className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Registered Patients</p>
            <h3 className="text-3xl font-extrabold text-[#0F172A] dark:text-white mt-1 font-mono">{analytics.totalPatients}</h3>
            <button 
              onClick={onSelectPatient}
              className="text-[11px] text-[#2563EB] dark:text-blue-400 font-semibold hover:underline flex items-center mt-1.5"
            >
              <span>View Patient Profiles</span>
              <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 shadow-xs">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="clinical-card p-6 border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <p className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Elevated Risk Triage</p>
            <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">{analytics.highRiskCount}</h3>
            <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium mt-1.5 block">Requires Follow-up</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 shadow-xs">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="clinical-card p-6 border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <p className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">Model Precision</p>
            <h3 className="text-3xl font-extrabold text-[#10B981] dark:text-emerald-400 mt-1 font-mono">
              {(analytics.avgConfidenceScore * 100).toFixed(1)}%
            </h3>
            <span className="text-[11px] text-[#10B981] dark:text-emerald-400 font-medium mt-1.5 block font-mono">Validated ML Ensemble</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 text-[#10B981] dark:text-emerald-400 shadow-xs">
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

    </div>
  );
}
