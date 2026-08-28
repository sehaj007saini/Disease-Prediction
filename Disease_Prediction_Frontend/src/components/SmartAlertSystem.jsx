import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, X, Clock, User, Activity, TrendingUp, Filter } from 'lucide-react';
import { api } from '../services/api';

export default function SmartAlertSystem({ theme = 'light', onPatientClick }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, critical, high, medium
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isDark = theme === 'dark';

  useEffect(() => {
    loadAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      
      // Get all patients and their latest predictions
      const patients = await api.getAllPatients();
      const analyticsData = await api.getAnalytics();
      
      const alertsArray = [];
      
      for (const patient of patients) {
        try {
          const history = await api.getPatientHistory(patient.id);
          
          if (history && history.length > 0) {
            // Get most recent prediction
            const latestPrediction = history.sort((a, b) => 
              new Date(b.predictionDate) - new Date(a.predictionDate)
            )[0];
            
            // Generate alerts based on risk level
            if (latestPrediction.riskLevel === 'Critical' || latestPrediction.riskLevel === 'High') {
              alertsArray.push({
                id: `alert-${patient.id}-${Date.now()}`,
                patientId: patient.id,
                patientName: patient.name,
                patientAge: patient.age,
                severity: latestPrediction.riskLevel.toLowerCase(),
                type: 'risk_elevation',
                title: `${latestPrediction.riskLevel} Risk Alert: ${formatDiseaseTarget(latestPrediction.diseaseTarget)}`,
                message: latestPrediction.recommendations || `Patient requires immediate attention for ${latestPrediction.predictedDisease}`,
                timestamp: new Date(latestPrediction.predictionDate),
                riskScore: (latestPrediction.confidenceScore * 100).toFixed(0),
                diseaseTarget: latestPrediction.diseaseTarget,
                isRead: false,
                actionRequired: true
              });
            }
            
            // Check for rapid risk increase
            if (history.length >= 2) {
              const previousPrediction = history[history.length - 2];
              const riskIncrease = (latestPrediction.confidenceScore - previousPrediction.confidenceScore) * 100;
              
              if (riskIncrease > 15) {
                alertsArray.push({
                  id: `trend-${patient.id}-${Date.now()}`,
                  patientId: patient.id,
                  patientName: patient.name,
                  patientAge: patient.age,
                  severity: 'high',
                  type: 'rapid_deterioration',
                  title: 'Rapid Health Deterioration Detected',
                  message: `Risk score increased by ${riskIncrease.toFixed(1)}% since last assessment. Immediate follow-up recommended.`,
                  timestamp: new Date(latestPrediction.predictionDate),
                  riskScore: (latestPrediction.confidenceScore * 100).toFixed(0),
                  diseaseTarget: latestPrediction.diseaseTarget,
                  isRead: false,
                  actionRequired: true,
                  trend: 'increasing'
                });
              }
            }
          }
        } catch (err) {
          console.warn(`Could not load alerts for patient ${patient.id}`);
        }
      }
      
      // Sort by severity and timestamp
      const sortedAlerts = alertsArray.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return b.timestamp - a.timestamp;
      });
      
      setAlerts(sortedAlerts);
      setUnreadCount(sortedAlerts.filter(a => !a.isRead).length);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDiseaseTarget = (target) => {
    const map = {
      'diabetes': 'Diabetes',
      'heart_disease': 'Cardiovascular Disease',
      'stroke': 'Stroke Risk',
      'kidney_disease': 'Renal Disease',
      'kidney': 'Renal Disease',
      'hypertension': 'Hypertension'
    };
    return map[target] || target;
  };

  const markAsRead = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      case 'medium':
        return <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30';
      case 'high':
        return 'border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30';
      case 'medium':
        return 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30';
      default:
        return 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30';
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className={`rounded-2xl border p-5 ${
        isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Smart Alert System
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Real-time patient monitoring & notifications
              </p>
            </div>
          </div>
          
          <button
            onClick={loadAlerts}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isDark 
                ? 'bg-[#1E293B] text-slate-200 hover:bg-[#334155] border border-[#334155]' 
                : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-[#E2E8F0] border border-[#E2E8F0]'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: `All (${alerts.length})`, count: alerts.length },
            { id: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
            { id: 'high', label: 'High', count: alerts.filter(a => a.severity === 'high').length },
            { id: 'medium', label: 'Medium', count: alerts.filter(a => a.severity === 'medium').length }
          ].map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === filterOption.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark
                    ? 'bg-[#1E293B] text-slate-300 hover:bg-[#334155]'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
              }`}
            >
              {filterOption.label}
              {filterOption.count > 0 && filter !== filterOption.id && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  {filterOption.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Loading alerts...
            </span>
          </div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className={`rounded-2xl border p-8 text-center ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
        }`}>
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
          <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            All Clear!
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
            No alerts require your attention at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-4 transition-all ${
                getAlertColor(alert.severity)
              } ${!alert.isRead ? 'shadow-md' : 'opacity-75'}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${
                  alert.severity === 'critical' 
                    ? 'bg-red-100 dark:bg-red-950/50' 
                    : alert.severity === 'high'
                    ? 'bg-orange-100 dark:bg-orange-950/50'
                    : 'bg-amber-100 dark:bg-amber-950/50'
                }`}>
                  {getAlertIcon(alert.severity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      {alert.title}
                    </h4>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className={`text-xs mb-3 ${isDark ? 'text-slate-300' : 'text-[#64748B]'}`}>
                    {alert.message}
                  </p>

                  {/* Patient Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{alert.patientName}</span>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        ({alert.patientAge} yrs)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      <span>Risk Score: {alert.riskScore}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{timeAgo(alert.timestamp)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        markAsRead(alert.id);
                        if (onPatientClick) {
                          onPatientClick(alert.patientId);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        alert.severity === 'critical'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      View Patient
                    </button>
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isDark 
                            ? 'bg-[#1E293B] text-slate-200 hover:bg-[#334155]' 
                            : 'bg-white text-[#0F172A] hover:bg-[#F8FAFC] border border-[#E2E8F0]'
                        }`}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
