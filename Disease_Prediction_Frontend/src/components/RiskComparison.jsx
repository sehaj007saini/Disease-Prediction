import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Activity, Target, BarChart3, AlertCircle, 
  Filter, ChevronDown, Info, Award, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { api } from '../services/api';

export default function RiskComparison() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterAge, setFilterAge] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [populationStats, setPopulationStats] = useState(null);

  useEffect(() => {
    loadPatients();
    generatePopulationStats();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await api.getAllPatients();
      setPatients(data);
      if (data.length > 0) {
        setSelectedPatient(data[0]);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const generatePopulationStats = () => {
    // Population baseline statistics (US CDC averages)
    setPopulationStats({
      avgAge: 45,
      avgBMI: 28.5,
      avgGlucose: 105,
      avgHbA1c: 5.7,
      diabetesRate: 10.5, // 10.5% of US population
      heartDiseaseRate: 6.7,
      hypertensionRate: 47.3,
      strokeRate: 2.8,
      kidneyDiseaseRate: 15.0
    });
  };

  useEffect(() => {
    if (selectedPatient) {
      performComparison(selectedPatient);
    }
  }, [selectedPatient, patients, filterAge, filterGender]);

  const performComparison = async (patient) => {
    setLoading(true);
    try {
      // Get patient's prediction history
      const predictions = await api.getPatientHistory(patient.id);
      
      // Calculate patient metrics
      const latestPrediction = predictions.length > 0 ? predictions[0] : null;
      
      // Filter cohort based on criteria
      let cohort = patients.filter(p => p.id !== patient.id);
      
      if (filterAge !== 'all') {
        const [minAge, maxAge] = filterAge.split('-').map(Number);
        cohort = cohort.filter(p => p.age >= minAge && (maxAge ? p.age <= maxAge : true));
      }
      
      if (filterGender !== 'all') {
        cohort = cohort.filter(p => p.gender === filterGender);
      }

      // Calculate comparative metrics
      const patientAge = patient.age;
      const cohortAvgAge = cohort.length > 0 ? cohort.reduce((sum, p) => sum + p.age, 0) / cohort.length : patientAge;

      // Get predictions for all cohort members
      const cohortPredictions = await Promise.all(
        cohort.slice(0, 50).map(p => api.getPatientHistory(p.id).catch(() => []))
      );

      // Calculate risk percentiles
      const riskScores = cohortPredictions
        .map(preds => preds.length > 0 ? preds[0].confidenceScore : 0.5)
        .filter(score => score > 0);

      const patientRisk = latestPrediction?.confidenceScore || 0.5;
      const percentile = calculatePercentile(patientRisk, riskScores);

      // Generate comparison data
      const comparison = {
        patient: {
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          riskScore: patientRisk * 100,
          latestPrediction: latestPrediction
        },
        cohort: {
          size: cohort.length,
          avgAge: Math.round(cohortAvgAge),
          avgRiskScore: riskScores.length > 0 ? (riskScores.reduce((a, b) => a + b, 0) / riskScores.length) * 100 : 50,
          filters: { age: filterAge, gender: filterGender }
        },
        population: populationStats,
        percentile: percentile,
        ranking: getRiskRanking(percentile),
        radarData: generateRadarData(patient, latestPrediction, populationStats),
        ageGroupComparison: generateAgeGroupData(patients, patient.age),
        similarPatients: findSimilarPatients(patient, cohort, cohortPredictions)
      };

      setComparisonData(comparison);
    } catch (err) {
      console.error('Error performing comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentile = (score, scores) => {
    if (scores.length === 0) return 50;
    const lowerScores = scores.filter(s => s < score).length;
    return Math.round((lowerScores / scores.length) * 100);
  };

  const getRiskRanking = (percentile) => {
    if (percentile >= 90) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', icon: AlertCircle };
    if (percentile >= 75) return { level: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30', icon: TrendingUp };
    if (percentile >= 50) return { level: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: Activity };
    if (percentile >= 25) return { level: 'Low Risk', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: Target };
    return { level: 'Optimal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', icon: Award };
  };

  const generateRadarData = (patient, prediction, popStats) => {
    // Mock patient metrics (in real app, get from prediction)
    const patientMetrics = {
      age: (patient.age / 80) * 100,
      bmi: 70, // Would come from actual data
      glucose: 65,
      hba1c: 60,
      riskScore: prediction ? prediction.confidenceScore * 100 : 50
    };

    const populationMetrics = {
      age: (popStats.avgAge / 80) * 100,
      bmi: (popStats.avgBMI / 40) * 100,
      glucose: (popStats.avgGlucose / 200) * 100,
      hba1c: (popStats.avgHbA1c / 10) * 100,
      riskScore: 50
    };

    return [
      { metric: 'Age Factor', patient: patientMetrics.age, population: populationMetrics.age, fullMark: 100 },
      { metric: 'BMI', patient: patientMetrics.bmi, population: populationMetrics.bmi, fullMark: 100 },
      { metric: 'Glucose', patient: patientMetrics.glucose, population: populationMetrics.glucose, fullMark: 100 },
      { metric: 'HbA1c', patient: patientMetrics.hba1c, population: populationMetrics.hba1c, fullMark: 100 },
      { metric: 'Overall Risk', patient: patientMetrics.riskScore, population: populationMetrics.riskScore, fullMark: 100 }
    ];
  };

  const generateAgeGroupData = (allPatients, patientAge) => {
    const ageGroups = [
      { range: '18-30', min: 18, max: 30 },
      { range: '31-45', min: 31, max: 45 },
      { range: '46-60', min: 46, max: 60 },
      { range: '61-75', min: 61, max: 75 },
      { range: '76+', min: 76, max: 120 }
    ];

    return ageGroups.map(group => {
      const groupPatients = allPatients.filter(p => p.age >= group.min && p.age <= group.max);
      const avgRisk = 45 + Math.random() * 30; // Mock data
      const isPatientGroup = patientAge >= group.min && patientAge <= group.max;
      
      return {
        ageGroup: group.range,
        avgRisk: Math.round(avgRisk),
        count: groupPatients.length,
        isPatientGroup: isPatientGroup
      };
    });
  };

  const findSimilarPatients = (patient, cohort, predictions) => {
    // Find patients with similar age (+/- 5 years) and same gender
    const similar = cohort
      .filter(p => 
        Math.abs(p.age - patient.age) <= 5 && 
        p.gender === patient.gender
      )
      .slice(0, 5)
      .map((p, idx) => {
        const pred = predictions[idx] || [];
        const latestPred = pred.length > 0 ? pred[0] : null;
        return {
          ...p,
          riskScore: latestPred ? latestPred.confidenceScore * 100 : 50,
          similarity: 85 + Math.random() * 15 // Mock similarity score
        };
      });

    return similar;
  };

  const getTrendIcon = (patientValue, avgValue) => {
    const diff = patientValue - avgValue;
    if (Math.abs(diff) < 5) return <Minus className="h-4 w-4" />;
    if (diff > 0) return <ArrowUp className="h-4 w-4 text-red-500" />;
    return <ArrowDown className="h-4 w-4 text-green-500" />;
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span>Population Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Risk Comparison & Benchmarking</h1>
          <p className="text-purple-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Compare patient health metrics against population averages, age cohorts, and similar demographic groups to identify relative risk levels.
          </p>
        </div>
      </div>

      {/* Patient Selection & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Patient Selection
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Select Patient
              </label>
              <select
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const patient = patients.find(p => p.id === parseInt(e.target.value));
                  setSelectedPatient(patient);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age}y, {p.gender})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                <Filter className="h-3 w-3 inline mr-1" />
                Age Group Filter
              </label>
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">All Ages</option>
                <option value="18-30">18-30 years</option>
                <option value="31-45">31-45 years</option>
                <option value="46-60">46-60 years</option>
                <option value="61-75">61-75 years</option>
                <option value="76-120">76+ years</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                <Filter className="h-3 w-3 inline mr-1" />
                Gender Filter
              </label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk Ranking Card */}
        {comparisonData && (
          <div className="lg:col-span-8">
            <div className={`rounded-2xl p-6 border shadow-sm ${comparisonData.ranking.bg} border-${comparisonData.ranking.color.replace('text-', '')}-200 dark:border-opacity-30`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${comparisonData.ranking.bg}`}>
                    <comparisonData.ranking.icon className={`h-8 w-8 ${comparisonData.ranking.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Risk Percentile Ranking
                    </h3>
                    <p className={`text-4xl font-black ${comparisonData.ranking.color} mt-1`}>
                      {comparisonData.percentile}th
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {comparisonData.ranking.level} - Higher risk than {comparisonData.percentile}% of similar patients
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div className="text-left">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Cohort Size</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{comparisonData.cohort.size}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Analyzing comparative data...</span>
          </div>
        </div>
      )}

      {!loading && comparisonData && (
        <>
          {/* Radar Chart - Patient vs Population */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Multi-Dimensional Risk Profile
              </h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={comparisonData.radarData}>
                    <PolarGrid stroke={isDark ? '#334155' : '#E2E8F0'} />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }}
                    />
                    <Radar 
                      name="Patient" 
                      dataKey="patient" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6} 
                    />
                    <Radar 
                      name="Population Avg" 
                      dataKey="population" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3} 
                    />
                    <Legend />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                        borderRadius: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Age Group Comparison */}
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                Risk by Age Group
              </h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData.ageGroupComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                    <XAxis 
                      dataKey="ageGroup" 
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
                      label={{ value: 'Avg Risk %', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="avgRisk" radius={[8, 8, 0, 0]}>
                      {comparisonData.ageGroupComparison.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isPatientGroup ? '#3B82F6' : '#94A3B8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                Comparative Metrics Analysis
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Metric</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Patient Value</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Cohort Average</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Population Average</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Age</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{comparisonData.patient.age} years</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{comparisonData.cohort.avgAge} years</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{comparisonData.population.avgAge} years</td>
                    <td className="px-6 py-4 text-center">{getTrendIcon(comparisonData.patient.age, comparisonData.cohort.avgAge)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Risk Score</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-red-600 dark:text-red-400">{comparisonData.patient.riskScore.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">{comparisonData.cohort.avgRiskScore.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">50.0%</td>
                    <td className="px-6 py-4 text-center">{getTrendIcon(comparisonData.patient.riskScore, comparisonData.cohort.avgRiskScore)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Similar Patients */}
          {comparisonData.similarPatients.length > 0 && (
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Similar Patient Profiles
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">
                  (Same age range ±5 years, same gender)
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparisonData.similarPatients.map((similar, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{similar.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{similar.age}y, {similar.gender}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Similarity</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">{similar.similarity.toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-600 dark:text-slate-400">Risk Score</span>
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{similar.riskScore.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
