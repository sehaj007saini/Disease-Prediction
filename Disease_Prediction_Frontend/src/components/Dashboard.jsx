import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { 
  Activity, AlertTriangle, Clock, TrendingUp, HeartPulse, Brain, Droplet, Stethoscope, ChevronRight, ArrowRight, AlertCircle, CheckCircle2, FileText, Calendar
} from 'lucide-react';

export default function Dashboard({ analytics, theme = 'light', onNewPrediction, onSelectPatient, onOpenWearableModal }) {
  if (!analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-3 text-[#2563EB]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent"></div>
          <span className="text-sm text-[#64748B] dark:text-slate-400">Loading clinical data...</span>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  const riskData = Object.entries(analytics.riskLevelDistribution || {}).map(([key, val]) => ({
    name: key,
    value: val,
    color: key === 'Low' ? '#10B981' : key === 'Medium' ? '#F59E0B' : key === 'High' ? '#F97316' : '#DC2626'
  }));

  const screeningTrendData = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 19 },
    { day: 'Wed', count: 15 },
    { day: 'Thu', count: 22 },
    { day: 'Fri', count: 28 },
    { day: 'Sat', count: 18 },
    { day: 'Sun', count: 14 },
  ];

  const SCREENING_PROGRAMS = [
    { key: 'diabetes', title: 'Diabetes', subtitle: 'Glucose & insulin', icon: Droplet },
    { key: 'heart_disease', title: 'Cardiovascular', subtitle: 'ECG & lipid metrics', icon: HeartPulse },
    { key: 'stroke', title: 'Stroke', subtitle: 'Neurovascular assessment', icon: Brain },
    { key: 'kidney_disease', title: 'Renal', subtitle: 'eGFR & metabolic indicators', icon: Activity },
  ];

  // Mock patient data requiring attention
  const patientsRequiringAttention = [
    { 
      id: 1, 
      name: 'Sarah Mitchell', 
      risk: 'HIGH', 
      screening: 'Diabetes', 
      finding: 'Elevated glucose (186 mg/dL)', 
      updated: '12 min ago',
      riskColor: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/30'
    },
    { 
      id: 2, 
      name: 'James Rodriguez', 
      risk: 'HIGH', 
      screening: 'Cardiovascular', 
      finding: 'Abnormal ECG pattern', 
      updated: '1 hr ago',
      riskColor: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/30'
    },
    { 
      id: 3, 
      name: 'Emily Chen', 
      risk: 'MODERATE', 
      screening: 'Renal', 
      finding: 'Reduced eGFR (58 mL/min)', 
      updated: 'Yesterday',
      riskColor: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30'
    },
  ];

  const highRiskCount = Object.entries(analytics.riskLevelDistribution || {})
    .filter(([key]) => key === 'High' || key === 'Critical')
    .reduce((sum, [, val]) => sum + val, 0);
  
  const moderateRiskCount = analytics.riskLevelDistribution?.Medium || 0;

  return (
    <div className="space-y-5">
      
      {/* Compact Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Good morning, Doctor
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
            {analytics.totalPatients} active patients · {highRiskCount + moderateRiskCount} require attention
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWearableModal}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border transition-colors ${
              isDark 
                ? 'bg-[#0F172A] border-[#334155] text-slate-200 hover:bg-[#1E293B]' 
                : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Sync Wearables</span>
          </button>
          <button
            onClick={() => onNewPrediction('diabetes')}
            className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <Stethoscope className="h-4 w-4" />
            <span>+ New Screening</span>
          </button>
        </div>
      </div>

      {/* 4 Compact KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className={`rounded-lg p-4 border ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Patients requiring attention
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {highRiskCount + moderateRiskCount}
                </span>
              </div>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                {highRiskCount} High Risk · {moderateRiskCount} Moderate
              </p>
            </div>
            <div className={`rounded-lg p-2 ${isDark ? 'bg-red-950/30' : 'bg-red-50'}`}>
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-4 border ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Abnormal results
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {highRiskCount}
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                New since yesterday
              </p>
            </div>
            <div className={`rounded-lg p-2 ${isDark ? 'bg-amber-950/30' : 'bg-amber-50'}`}>
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-4 border ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Follow-ups due
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  3
                </span>
              </div>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                Due today
              </p>
            </div>
            <div className={`rounded-lg p-2 ${isDark ? 'bg-blue-950/30' : 'bg-blue-50'}`}>
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-4 border ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Active patients
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {analytics.totalPatients}
                </span>
              </div>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                Across all screening programs
              </p>
            </div>
            <div className={`rounded-lg p-2 ${isDark ? 'bg-green-950/30' : 'bg-green-50'}`}>
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

      </div>

      {/* Patients Requiring Attention - Primary Section */}
      <div className={`rounded-lg border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            Patients requiring attention
          </h2>
          <button
            onClick={onSelectPatient}
            className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-xs font-medium uppercase tracking-wide border-b ${
                isDark 
                  ? 'text-slate-400 border-[#1E293B] bg-[#0F172A]' 
                  : 'text-[#64748B] border-[#E2E8F0] bg-[#F8FAFC]'
              }`}>
                <th className="px-5 py-3 text-left font-medium">Patient</th>
                <th className="px-5 py-3 text-left font-medium">Risk</th>
                <th className="px-5 py-3 text-left font-medium">Screening</th>
                <th className="px-5 py-3 text-left font-medium">Key finding</th>
                <th className="px-5 py-3 text-left font-medium">Last updated</th>
                <th className="px-5 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1E293B]' : 'divide-[#E2E8F0]'}`}>
              {patientsRequiringAttention.map((patient) => (
                <tr 
                  key={patient.id}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-[#1E293B]/50' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <td className={`px-5 py-3 text-sm font-medium ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {patient.name}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium border ${patient.riskColor}`}>
                      {patient.risk}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-sm ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
                    {patient.screening}
                  </td>
                  <td className={`px-5 py-3 text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    {patient.finding}
                  </td>
                  <td className={`px-5 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    {patient.updated}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={onSelectPatient}
                      className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
                    >
                      Review
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screening Programs - Compact */}
      <div>
        <h2 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
          Screening programs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCREENING_PROGRAMS.map((program) => {
            const Icon = program.icon;
            return (
              <button
                key={program.key}
                onClick={() => onNewPrediction(program.key)}
                className={`flex items-center gap-3 rounded-lg p-4 border text-left transition-all ${
                  isDark 
                    ? 'bg-[#0F172A] border-[#1E293B] hover:border-[#2563EB] hover:bg-[#1E293B]' 
                    : 'bg-white border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className={`rounded-lg p-2 ${isDark ? 'bg-blue-950/30' : 'bg-blue-50'}`}>
                  <Icon className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {program.title}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    {program.subtitle}
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-[#94A3B8]'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics Section - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Patient Risk Distribution */}
        <div className={`rounded-lg p-5 border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Patient risk distribution
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Risk stratification across all screenings
              </p>
            </div>
            <span className={`text-xs font-mono px-2 py-1 rounded border ${
              isDark ? 'bg-[#1E293B] border-[#334155] text-slate-400' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
            }`}>
              n = {analytics.totalPredictions}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDark ? '#64748B' : '#94A3B8'} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke={isDark ? '#64748B' : '#94A3B8'} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0', 
                    borderRadius: '8px', 
                    fontSize: '13px',
                    padding: '8px 12px'
                  }}
                  cursor={{ fill: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Screening Activity Trend */}
        <div className={`rounded-lg p-5 border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Screening activity
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Weekly screening volume trend
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
              <TrendingUp className="h-3 w-3" />
              +18%
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={screeningTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke={isDark ? '#64748B' : '#94A3B8'} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke={isDark ? '#64748B' : '#94A3B8'} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0', 
                    borderRadius: '8px', 
                    fontSize: '13px',
                    padding: '8px 12px'
                  }}
                  cursor={{ stroke: isDark ? '#334155' : '#CBD5E1', strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563EB" 
                  strokeWidth={2} 
                  dot={{ fill: '#2563EB', r: 4 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Clinical Insights Panel */}
      <div className={`rounded-lg p-5 border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'}`}>
        <h3 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
          Clinical insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <p className={isDark ? 'text-slate-300' : 'text-[#0F172A]'}>
              <span className="font-semibold">{highRiskCount + moderateRiskCount} patients</span> currently require review.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className={isDark ? 'text-slate-300' : 'text-[#0F172A]'}>
              <span className="font-semibold">{highRiskCount} patients</span> show high-risk indicators.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <p className={isDark ? 'text-slate-300' : 'text-[#0F172A]'}>
              Cardiovascular screening has <span className="font-semibold">increased 18%</span> this week.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className={isDark ? 'text-slate-300' : 'text-[#0F172A]'}>
              <span className="font-semibold">3 follow-ups</span> are due today.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

