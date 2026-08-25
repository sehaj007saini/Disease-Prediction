import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Calendar, Filter, Download, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function PatientHealthTimeline({ patientId, theme = 'light' }) {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 1y, all
  
  const isDark = theme === 'dark';

  useEffect(() => {
    if (patientId) {
      loadHealthTimeline();
    }
  }, [patientId, timeRange]);

  const loadHealthTimeline = async () => {
    try {
      setLoading(true);
      const history = await api.getPatientHistory(patientId);
      
      // Transform prediction history into timeline data
      const timelinePoints = history
        .sort((a, b) => new Date(a.predictionDate) - new Date(b.predictionDate))
        .map(pred => ({
          date: new Date(pred.predictionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          timestamp: new Date(pred.predictionDate).getTime(),
          diabetes: pred.diseaseTarget === 'diabetes' ? pred.confidenceScore * 100 : null,
          heart: pred.diseaseTarget === 'heart_disease' ? pred.confidenceScore * 100 : null,
          hypertension: pred.diseaseTarget === 'hypertension' ? pred.confidenceScore * 100 : null,
          kidney: pred.diseaseTarget === 'kidney_disease' ? pred.confidenceScore * 100 : null,
          stroke: pred.diseaseTarget === 'stroke' ? pred.confidenceScore * 100 : null,
          overallRisk: pred.confidenceScore * 100,
          riskLevel: pred.riskLevel
        }));

      setTimelineData(timelinePoints);
    } catch (error) {
      console.error('Error loading health timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = () => {
    if (timelineData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = timelineData[timelineData.length - 1];
    const previous = timelineData[timelineData.length - 2];
    
    const change = recent.overallRisk - previous.overallRisk;
    const percentage = Math.abs(change).toFixed(1);
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage,
      isImproving: change < 0
    };
  };

  const trend = calculateTrend();

  const metrics = [
    { id: 'all', label: 'All Conditions', color: '#2563EB' },
    { id: 'diabetes', label: 'Diabetes', color: '#3B82F6' },
    { id: 'heart', label: 'Heart Disease', color: '#EF4444' },
    { id: 'hypertension', label: 'Hypertension', color: '#F59E0B' },
    { id: 'kidney', label: 'Kidney Disease', color: '#10B981' },
    { id: 'stroke', label: 'Stroke Risk', color: '#8B5CF6' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Loading health timeline...
          </span>
        </div>
      </div>
    );
  }

  if (!timelineData.length) {
    return (
      <div className={`rounded-2xl border p-8 text-center ${
        isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
      }`}>
        <Activity className="h-12 w-12 mx-auto mb-3 text-slate-400" />
        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
          No Timeline Data
        </h3>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
          No prediction history available for this patient yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Header with Trend Summary */}
      <div className={`rounded-2xl border p-5 ${
        isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Patient Health Timeline
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Historical risk progression over time
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Trend Indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              trend.isImproving
                ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
            }`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
              <div className="text-xs">
                <div className={`font-semibold ${
                  trend.isImproving
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {trend.percentage}% {trend.direction === 'up' ? 'Higher' : trend.direction === 'down' ? 'Lower' : 'Stable'}
                </div>
                <div className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  vs last visit
                </div>
              </div>
            </div>

            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-xs font-medium ${
                isDark 
                  ? 'bg-[#1E293B] border-[#334155] text-slate-200' 
                  : 'bg-white border-[#E2E8F0] text-[#0F172A]'
              }`}
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Metric Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {metrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMetric === metric.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark
                    ? 'bg-[#1E293B] text-slate-300 hover:bg-[#334155]'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Chart */}
      <div className={`rounded-2xl border p-6 ${
        isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
      }`}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
              <XAxis 
                dataKey="date" 
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
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                  borderColor: isDark ? '#334155' : '#E2E8F0', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  padding: '10px 14px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                labelStyle={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 600 }}
              />
              {selectedMetric === 'all' ? (
                <>
                  <Area type="monotone" dataKey="diabetes" stroke="#3B82F6" fillOpacity={0.2} fill="#3B82F6" strokeWidth={2} />
                  <Area type="monotone" dataKey="heart" stroke="#EF4444" fillOpacity={0.2} fill="#EF4444" strokeWidth={2} />
                  <Area type="monotone" dataKey="hypertension" stroke="#F59E0B" fillOpacity={0.2} fill="#F59E0B" strokeWidth={2} />
                  <Area type="monotone" dataKey="kidney" stroke="#10B981" fillOpacity={0.2} fill="#10B981" strokeWidth={2} />
                  <Area type="monotone" dataKey="stroke" stroke="#8B5CF6" fillOpacity={0.2} fill="#8B5CF6" strokeWidth={2} />
                </>
              ) : (
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#2563EB" 
                  fill="url(#gradientRisk)" 
                  strokeWidth={3} 
                />
              )}
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Events Timeline */}
      <div className={`rounded-2xl border p-5 ${
        isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
      }`}>
        <h4 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
          Recent Health Events ({timelineData.length})
        </h4>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {timelineData.slice(-5).reverse().map((event, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                isDark ? 'bg-[#1E293B]/50 border-[#334155]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                event.riskLevel === 'High' || event.riskLevel === 'Critical'
                  ? 'bg-red-100 dark:bg-red-950/30'
                  : event.riskLevel === 'Medium' || event.riskLevel === 'Moderate'
                  ? 'bg-amber-100 dark:bg-amber-950/30'
                  : 'bg-green-100 dark:bg-green-950/30'
              }`}>
                <Calendar className={`h-4 w-4 ${
                  event.riskLevel === 'High' || event.riskLevel === 'Critical'
                    ? 'text-red-600 dark:text-red-400'
                    : event.riskLevel === 'Medium' || event.riskLevel === 'Moderate'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {event.date}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                  Risk Score: {event.overallRisk.toFixed(1)}% • {event.riskLevel} Risk
                </div>
              </div>
              <span className={`text-xs font-mono font-semibold px-2 py-1 rounded ${
                event.riskLevel === 'High' || event.riskLevel === 'Critical'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                  : event.riskLevel === 'Medium' || event.riskLevel === 'Moderate'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'
              }`}>
                {event.overallRisk.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
