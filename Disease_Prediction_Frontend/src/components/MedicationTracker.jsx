import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, AlertTriangle, CheckCircle, Clock, Calendar, Search, Filter, Download, Upload } from 'lucide-react';

export default function MedicationTracker({ patientId, theme = 'light' }) {
  const [medications, setMedications] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  
  const isDark = theme === 'dark';

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    prescribedBy: '',
    purpose: '',
    sideEffects: '',
    instructions: ''
  });

  useEffect(() => {
    loadMedications();
  }, [patientId]);

  useEffect(() => {
    if (medications.length > 0) {
      checkDrugInteractions();
    }
  }, [medications]);

  const loadMedications = () => {
    // Load from localStorage or API
    const stored = localStorage.getItem(`medications_${patientId}`);
    if (stored) {
      setMedications(JSON.parse(stored));
    } else {
      // Demo data
      setMedications([
        {
          id: 1,
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          startDate: '2024-01-15',
          endDate: '',
          prescribedBy: 'Dr. Sarah Johnson',
          purpose: 'Type 2 Diabetes Management',
          sideEffects: 'Mild nausea, stomach upset',
          instructions: 'Take with meals',
          status: 'active',
          adherence: 95,
          lastTaken: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          startDate: '2024-02-01',
          endDate: '',
          prescribedBy: 'Dr. Michael Chen',
          purpose: 'Hypertension Control',
          sideEffects: 'Dry cough, dizziness',
          instructions: 'Take in the morning',
          status: 'active',
          adherence: 88,
          lastTaken: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily',
          startDate: '2024-01-20',
          endDate: '',
          prescribedBy: 'Dr. Sarah Johnson',
          purpose: 'Cholesterol Management',
          sideEffects: 'Muscle pain, fatigue',
          instructions: 'Take at bedtime',
          status: 'active',
          adherence: 92,
          lastTaken: new Date().toISOString()
        }
      ]);
    }
  };

  const checkDrugInteractions = () => {
    // Simulate drug interaction checking
    const interactionDatabase = {
      'Metformin_Lisinopril': {
        severity: 'moderate',
        description: 'Lisinopril may increase the blood sugar-lowering effects of Metformin. Monitor blood glucose levels closely.',
        recommendation: 'Regular blood glucose monitoring recommended'
      },
      'Metformin_Atorvastatin': {
        severity: 'low',
        description: 'Generally safe combination. Both medications are commonly prescribed together.',
        recommendation: 'Continue as prescribed'
      },
      'Lisinopril_Atorvastatin': {
        severity: 'low',
        description: 'No significant interactions reported between these medications.',
        recommendation: 'Continue as prescribed'
      }
    };

    const detectedInteractions = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const key = `${medications[i].name}_${medications[j].name}`;
        const reverseKey = `${medications[j].name}_${medications[i].name}`;
        
        if (interactionDatabase[key]) {
          detectedInteractions.push({
            ...interactionDatabase[key],
            drug1: medications[i].name,
            drug2: medications[j].name
          });
        } else if (interactionDatabase[reverseKey]) {
          detectedInteractions.push({
            ...interactionDatabase[reverseKey],
            drug1: medications[j].name,
            drug2: medications[i].name
          });
        }
      }
    }
    
    setInteractions(detectedInteractions);
  };

  const addMedication = () => {
    const medication = {
      ...newMedication,
      id: Date.now(),
      status: 'active',
      adherence: 100,
      lastTaken: new Date().toISOString()
    };
    
    const updated = [...medications, medication];
    setMedications(updated);
    localStorage.setItem(`medications_${patientId}`, JSON.stringify(updated));
    
    setShowAddForm(false);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'Once daily',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      prescribedBy: '',
      purpose: '',
      sideEffects: '',
      instructions: ''
    });
  };

  const deleteMedication = (id) => {
    const updated = medications.filter(m => m.id !== id);
    setMedications(updated);
    localStorage.setItem(`medications_${patientId}`, JSON.stringify(updated));
  };

  const markAsTaken = (id) => {
    const updated = medications.map(m => 
      m.id === id ? { ...m, lastTaken: new Date().toISOString() } : m
    );
    setMedications(updated);
    localStorage.setItem(`medications_${patientId}`, JSON.stringify(updated));
  };

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || med.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'severe':
        return 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30';
      case 'moderate':
        return 'border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30';
      case 'low':
        return 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30';
      default:
        return 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className={`rounded-2xl border p-5 ${
        isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Medication Tracker
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                Manage prescriptions & check drug interactions
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Medication
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medications..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
                isDark 
                  ? 'bg-[#1E293B] border-[#334155] text-white placeholder-slate-500' 
                  : 'bg-white border-[#E2E8F0] text-[#0F172A] placeholder-slate-400'
              }`}
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              isDark 
                ? 'bg-[#1E293B] border-[#334155] text-slate-200' 
                : 'bg-white border-[#E2E8F0] text-[#0F172A]'
            }`}
          >
            <option value="all">All Medications</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Drug Interactions Alert */}
      {interactions.length > 0 && (
        <div className={`rounded-2xl border p-4 ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
        }`}>
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                Drug Interactions Detected
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                {interactions.length} potential interaction{interactions.length > 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            {interactions.map((interaction, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border ${getSeverityColor(interaction.severity)}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {interaction.drug1} + {interaction.drug2}
                  </h5>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    interaction.severity === 'severe' 
                      ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
                      : interaction.severity === 'moderate'
                      ? 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400'
                      : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
                  }`}>
                    {interaction.severity}
                  </span>
                </div>
                <p className={`text-xs mb-2 ${isDark ? 'text-slate-300' : 'text-[#64748B]'}`}>
                  {interaction.description}
                </p>
                <p className={`text-xs font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  ℹ️ {interaction.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications List */}
      {filteredMedications.length === 0 ? (
        <div className={`rounded-2xl border p-8 text-center ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
        }`}>
          <Pill className="h-12 w-12 mx-auto mb-3 text-slate-400" />
          <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            No Medications Found
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
            Add medications to start tracking adherence and checking interactions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMedications.map(med => (
            <div 
              key={med.id}
              className={`rounded-2xl border p-5 transition-all hover:shadow-md ${
                isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0] shadow-sm'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                    {med.name}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    {med.dosage} • {med.frequency}
                  </p>
                </div>
                <button
                  onClick={() => deleteMedication(med.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-red-950/30 text-red-400' : 'hover:bg-red-50 text-red-600'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-semibold min-w-[80px] ${
                    isDark ? 'text-slate-400' : 'text-[#64748B]'
                  }`}>
                    Purpose:
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
                    {med.purpose}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-semibold min-w-[80px] ${
                    isDark ? 'text-slate-400' : 'text-[#64748B]'
                  }`}>
                    Prescribed:
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
                    {med.prescribedBy}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-semibold min-w-[80px] ${
                    isDark ? 'text-slate-400' : 'text-[#64748B]'
                  }`}>
                    Instructions:
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
                    {med.instructions}
                  </span>
                </div>
              </div>

              {/* Adherence Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    Adherence
                  </span>
                  <span className={`text-xs font-bold ${
                    med.adherence >= 90 
                      ? 'text-green-600 dark:text-green-400'
                      : med.adherence >= 70
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {med.adherence}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      med.adherence >= 90 
                        ? 'bg-green-500'
                        : med.adherence >= 70
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${med.adherence}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => markAsTaken(med.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mark as Taken
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isDark 
                      ? 'bg-[#1E293B] text-slate-200 hover:bg-[#334155] border border-[#334155]' 
                      : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-[#E2E8F0] border border-[#E2E8F0]'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Add New Medication
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-semibold mb-1 block ${
                    isDark ? 'text-slate-400' : 'text-[#64748B]'
                  }`}>
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark 
                        ? 'bg-[#1E293B] border-[#334155] text-white' 
                        : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-semibold mb-1 block ${
                    isDark ? 'text-slate-400' : 'text-[#64748B]'
                  }`}>
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                    placeholder="e.g., 500mg"
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDark 
                        ? 'bg-[#1E293B] border-[#334155] text-white' 
                        : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${
                  isDark ? 'text-slate-400' : 'text-[#64748B]'
                }`}>
                  Frequency *
                </label>
                <select
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-[#1E293B] border-[#334155] text-white' 
                      : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>Four times daily</option>
                  <option>Every other day</option>
                  <option>As needed</option>
                </select>
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${
                  isDark ? 'text-slate-400' : 'text-[#64748B]'
                }`}>
                  Purpose
                </label>
                <input
                  type="text"
                  value={newMedication.purpose}
                  onChange={(e) => setNewMedication({...newMedication, purpose: e.target.value})}
                  placeholder="e.g., Type 2 Diabetes Management"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-[#1E293B] border-[#334155] text-white' 
                      : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${
                  isDark ? 'text-slate-400' : 'text-[#64748B]'
                }`}>
                  Prescribed By
                </label>
                <input
                  type="text"
                  value={newMedication.prescribedBy}
                  onChange={(e) => setNewMedication({...newMedication, prescribedBy: e.target.value})}
                  placeholder="Dr. Name"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-[#1E293B] border-[#334155] text-white' 
                      : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold mb-1 block ${
                  isDark ? 'text-slate-400' : 'text-[#64748B]'
                }`}>
                  Instructions
                </label>
                <textarea
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                  placeholder="e.g., Take with meals"
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-[#1E293B] border-[#334155] text-white' 
                      : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addMedication}
                disabled={!newMedication.name || !newMedication.dosage}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Medication
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isDark 
                    ? 'bg-[#1E293B] text-slate-200 hover:bg-[#334155] border border-[#334155]' 
                    : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-[#E2E8F0] border border-[#E2E8F0]'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
