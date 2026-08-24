import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';
import { 
  Activity, AlertTriangle, Clock, TrendingUp, HeartPulse, Brain, Droplet, Stethoscope, ChevronRight, ArrowRight, AlertCircle, CheckCircle2, FileText, Calendar, Users, Zap, TrendingDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ analytics, theme = 'light', onNewPrediction, onSelectPatient, onOpenWearableModal }) {
  const [priorityPatients, setPriorityPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  useEffect(() => {
    loadPriorityPatients();
  }, [analytics]);

  const loadPriorityPatients = async () => {
    try {
      setIsLoadingPatients(true);
      
      // Fetch all patients and all predictions
      const [patientsData, predictionsData] = await Promise.all([
        api.getAllPatients(),
        api.getAnalytics()
      ]);

      // Create a map of patients with their latest high-risk predictions
      const patientPredictionMap = new Map();
      
      // For each patient, we'll fetch their prediction history
      for (const patient of patientsData) {
        try {
          const history = await api.getPatientHistory(patient.id);
          if (history && history.length > 0) {
            // Get the most recent high or critical risk prediction
            const highRiskPredictions = history
              .filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical' || p.riskLevel === 'Medium')
              .sort((a, b) => new Date(b.predictionDate) - new Date(a.predictionDate));
            
            if (highRiskPredictions.length > 0) {
              patientPredictionMap.set(patient.id, {
                ...patient,
                prediction: highRiskPredictions[0]
              });
            }
          }
        } catch (err) {
          console.warn(`Could not load history for patient ${patient.id}`);
        }
      }

      // Convert map to array and format for display
      const priorityList = Array.from(patientPredictionMap.values())
        .map(item => {
          const pred = item.prediction;
          const riskLevel = pred.riskLevel.toUpperCase();
          
          // Determine risk color
          let riskColor = '';
          if (riskLevel === 'CRITICAL') {
            riskColor = 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/30';
          } else if (riskLevel === 'HIGH') {
            riskColor = 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-900/30';
          } else {
            riskColor = 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/30';
          }

          // Determine trend based on confidence score
          let trend = 'stable';
          if (pred.confidenceScore > 0.85) {
            trend = 'up';
          } else if (pred.confidenceScore < 0.75) {
            trend = 'down';
          }

          // Format time ago
          const timeAgo = formatTimeAgo(new Date(pred.predictionDate));

          return {
            id: item.id,
            name: item.name,
            age: item.age,
            risk: riskLevel,
            screening: formatDiseaseTarget(pred.diseaseTarget),
            finding: formatFinding(pred),
            updated: timeAgo,
            trend: trend,
            riskColor: riskColor
          };
        })
        .slice(0, 4); // Show top 4 priority patients

      setPriorityPatients(priorityList);
    } catch (error) {
      console.error('Error loading priority patients:', error);
      // Fallback to empty list
      setPriorityPatients([]);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    if (seconds < 172800) return 'Yesterday';
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const formatDiseaseTarget = (target) => {
    const map = {
      'diabetes': 'Diabetes',
      'heart_disease': 'Cardiovascular',
      'stroke': 'Stroke',
      'kidney_disease': 'Renal',
      'kidney': 'Renal',
      'hypertension': 'Hypertension',
      'parkinsons': 'Parkinsons'
    };
    return map[target] || target;
  };

  const formatFinding = (prediction) => {
    // Extract key finding from prediction
    if (prediction.predictedDisease) {
      return prediction.predictedDisease;
    }
    return `Confidence: ${(prediction.confidenceScore * 100).toFixed(0)}%`;
  };

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

  // Weekly screening activity data
  const weeklyActivityData = [
    { day: 'Mon', screenings: 12, followups: 8 },
    { day: 'Tue', screenings: 19, followups: 12 },
    { day: 'Wed', screenings: 15, followups: 10 },
    { day: 'Thu', screenings: 22, followups: 15 },
    { day: 'Fri', screenings: 28, followups: 18 },
    { day: 'Sat', screenings: 18, followups: 10 },
    { day: 'Sun', screenings: 14, followups: 8 },
  ];

  // Disease distribution for donut chart
  const diseaseDistribution = Object.entries(analytics.diseaseTargetDistribution || {}).map(([key, val]) => ({
    name: key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1),
    value: val,
    percentage: ((val / analytics.totalPredictions) * 100).toFixed(1)
  }));

  // Real-time vitals trend (mock data)
  const vitalsData = [
    { time: '00:00', heartRate: 72, bloodPressure: 120, glucose: 95 },
    { time: '04:00', heartRate: 68, bloodPressure: 118, glucose: 92 },
    { time: '08:00', heartRate: 75, bloodPressure: 125, glucose: 105 },
    { time: '12:00', heartRate: 80, bloodPressure: 130, glucose: 110 },
    { time: '16:00', heartRate: 78, bloodPressure: 128, glucose: 98 },
    { time: '20:00', heartRate: 70, bloodPressure: 122, glucose: 90 },
  ];

  const SCREENING_PROGRAMS = [
    { key: 'diabetes', title: 'Diabetes', subtitle: 'Glucose & insulin', icon: Droplet, color: '#3B82F6' },
    { key: 'heart_disease', title: 'Cardiovascular', subtitle: 'ECG & lipid metrics', icon: HeartPulse, color: '#EF4444' },
    { key: 'stroke', title: 'Stroke', subtitle: 'Neurovascular assessment', icon: Brain, color: '#F59E0B' },
    { key: 'kidney_disease', title: 'Renal', subtitle: 'eGFR & metabolic indicators', icon: Activity, color: '#10B981' },
  ];

  // Priority patients loaded from API via useEffect and state

  const highRiskCount = Object.entries(analytics.riskLevelDistribution || {})
    .filter(([key]) => key === 'High' || key === 'Critical')
    .reduce((sum, [, val]) => sum + val, 0);
  
  const moderateRiskCount = analytics.riskLevelDistribution?.Medium || 0;
  
  const totalAtRisk = highRiskCount + moderateRiskCount;

  return (
    <div className="space-y-6">
      
      {/* Enhanced Header with Greeting and Quick Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Clinical Dashboard
            </h1>
            <p className={`text-sm mt-1 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {analytics.totalPatients} active patients
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-medium">
                <AlertCircle className="h-4 w-4" />
                {totalAtRisk} require attention
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenWearableModal}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border transition-all ${
                isDark 
                  ? 'bg-[#1E293B] border-[#334155] text-slate-200 hover:bg-[#334155]' 
                  : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#CBD5E1] shadow-sm'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Sync Devices</span>
            </button>
            <button
              onClick={() => onNewPrediction('diabetes')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25"
            >
              <Stethoscope className="h-4 w-4" />
              <span>New Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards with Gradients and Icons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Screenings */}
        <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all hover:scale-[1.02] ${
          isDark ? 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155]' : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100 shadow-sm'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`rounded-xl p-2 ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-500/10'}`}>
                  <Activity className="h-5 w-5 text-cyan-500" />
                </div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Total Screenings
                </p>
              </div>
              <div className="mt-3">
                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {analytics.totalPredictions}
                </h3>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-500">+12.5%</span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>vs last week</span>
                </div>
              </div>
            </div>
          </div>
          <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-10 ${isDark ? 'bg-cyan-400' : 'bg-cyan-500'}`}></div>
        </div>

        {/* Card 2: Critical Alerts */}
        <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all hover:scale-[1.02] ${
          isDark ? 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155]' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100 shadow-sm'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`rounded-xl p-2 ${isDark ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Critical Alerts
                </p>
              </div>
              <div className="mt-3">
                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {highRiskCount}
                </h3>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-500">+3</span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>since yesterday</span>
                </div>
              </div>
            </div>
          </div>
          <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-10 ${isDark ? 'bg-red-400' : 'bg-red-500'}`}></div>
        </div>

        {/* Card 3: Active Patients */}
        <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all hover:scale-[1.02] ${
          isDark ? 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155]' : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 shadow-sm'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`rounded-xl p-2 ${isDark ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Active Patients
                </p>
              </div>
              <div className="mt-3">
                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {analytics.totalPatients}
                </h3>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDownRight className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-500">-2</span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>discharged today</span>
                </div>
              </div>
            </div>
          </div>
          <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-10 ${isDark ? 'bg-purple-400' : 'bg-purple-500'}`}></div>
        </div>

        {/* Card 4: Model Accuracy */}
        <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all hover:scale-[1.02] ${
          isDark ? 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155]' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-sm'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`rounded-xl p-2 ${isDark ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                  <Zap className="h-5 w-5 text-green-500" />
                </div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Model Accuracy
                </p>
              </div>
              <div className="mt-3">
                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {(analytics.avgConfidenceScore * 100).toFixed(1)}%
                </h3>
                <div className="flex items-center gap-1 mt-2">
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      style={{ width: `${analytics.avgConfidenceScore * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-10 ${isDark ? 'bg-green-400' : 'bg-green-500'}`}></div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - 2 columns width */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weekly Activity Chart */}
          <div className={`rounded-2xl p-6 border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  Weekly Activities
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                  Screening volume and follow-up trends
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs">
                  <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Screenings</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Follow-ups</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      borderRadius: '12px', 
                      fontSize: '13px',
                      padding: '10px 14px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    cursor={{ fill: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)' }}
                  />
                  <Bar dataKey="screenings" fill="#06B6D4" radius={[8, 8, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="followups" fill="#8B5CF6" radius={[8, 8, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Patients Table */}
          <div className={`rounded-2xl border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'}`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  Priority Patient Queue
                </h3>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                  {isLoadingPatients ? 'Loading...' : `${priorityPatients.length} patients require immediate attention`}
                </p>
              </div>
              <button
                onClick={onSelectPatient}
                className="text-sm font-semibold text-cyan-500 hover:text-cyan-600 flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {isLoadingPatients ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                      Loading patient data...
                    </span>
                  </div>
                </div>
              ) : priorityPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                  <h4 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    All Clear!
                  </h4>
                  <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    No high-risk patients require immediate attention at this time.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className={`text-xs font-semibold uppercase tracking-wider border-b ${
                      isDark 
                        ? 'text-slate-400 border-[#1E293B] bg-[#0F172A]' 
                        : 'text-[#64748B] border-[#E2E8F0] bg-[#F8FAFC]'
                    }`}>
                      <th className="px-6 py-3 text-left">Patient</th>
                      <th className="px-6 py-3 text-left">Priority</th>
                      <th className="px-6 py-3 text-left">Assessment</th>
                      <th className="px-6 py-3 text-left">Finding</th>
                      <th className="px-6 py-3 text-left">Trend</th>
                      <th className="px-6 py-3 text-left">Updated</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#1E293B]' : 'divide-[#E2E8F0]'}`}>
                    {priorityPatients.map((patient) => (
                      <tr 
                        key={patient.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-[#1E293B]/50' : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                              isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                                {patient.name}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                                {patient.age} years old
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border ${patient.riskColor}`}>
                            <div className="h-1.5 w-1.5 rounded-full bg-current"></div>
                            {patient.risk}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
                          {patient.screening}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                          {patient.finding}
                        </td>
                        <td className="px-6 py-4">
                          {patient.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-red-500" />}
                          {patient.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-amber-500" />}
                          {patient.trend === 'stable' && <div className="h-0.5 w-4 bg-slate-400 rounded"></div>}
                        </td>
                        <td className={`px-6 py-4 text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                          {patient.updated}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={onSelectPatient}
                            className="text-sm font-semibold text-cyan-500 hover:text-cyan-600 transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - 1 column width */}
        <div className="space-y-6">
          
          {/* Diagnostics Mix - Donut Chart */}
          <div className={`rounded-2xl p-6 border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'}`}>
            <div className="mb-5">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Diagnostics Mix
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Distribution across screening types
              </p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diseaseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {diseaseDistribution.map((entry, index) => {
                      const colors = ['#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                      borderColor: isDark ? '#334155' : '#E2E8F0', 
                      borderRadius: '12px', 
                      fontSize: '13px',
                      padding: '10px 14px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2.5">
              {diseaseDistribution.map((item, index) => {
                const colors = ['#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444'];
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                        {item.value}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vitals Monitoring */}
          <div className={`rounded-2xl p-6 border ${isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'}`}>
            <div className="mb-5">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Real-time Vitals
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Average patient metrics (24h)
              </p>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vitalsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke={isDark ? '#64748B' : '#94A3B8'} 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke={isDark ? '#64748B' : '#94A3B8'} 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                      borderColor: isDark ? '#334155' : '#E2E8F0', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="heartRate" stroke="#06B6D4" fillOpacity={1} fill="url(#colorHR)" strokeWidth={2} />
                  <Area type="monotone" dataKey="bloodPressure" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorBP)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className={`rounded-xl p-3 ${isDark ? 'bg-[#1E293B]' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <HeartPulse className="h-3.5 w-3.5 text-cyan-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>HR</span>
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>74</div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>bpm</div>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? 'bg-[#1E293B]' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="h-3.5 w-3.5 text-purple-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>BP</span>
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>124</div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>mmHg</div>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? 'bg-[#1E293B]' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Droplet className="h-3.5 w-3.5 text-amber-500" />
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>GLU</span>
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>98</div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>mg/dL</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`rounded-2xl p-5 border ${isDark ? 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155]' : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-100 shadow-sm'}`}>
            <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Quick Actions
            </h3>
            <div className="space-y-2">
              {SCREENING_PROGRAMS.map((program) => {
                const Icon = program.icon;
                return (
                  <button
                    key={program.key}
                    onClick={() => onNewPrediction(program.key)}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all ${
                      isDark 
                        ? 'bg-[#0F172A]/50 hover:bg-[#1E293B] border border-[#334155]' 
                        : 'bg-white hover:bg-white/80 border border-white shadow-sm'
                    }`}
                  >
                    <div 
                      className="rounded-lg p-2"
                      style={{ backgroundColor: `${program.color}15` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: program.color }} />
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

        </div>
      </div>

    </div>
  );
}

