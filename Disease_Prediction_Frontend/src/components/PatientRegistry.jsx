import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, Edit2, Trash2, History, AlertCircle, RefreshCw, X, Check, Calendar, Mail, Phone, Stethoscope, ChevronRight, User, Download 
} from 'lucide-react';
import { api } from '../services/api';

export default function PatientRegistry({ onRunPredictionForPatient }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [historyPatient, setHistoryPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    age: 40,
    gender: 'Female',
    email: '',
    phone: ''
  });

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await api.getAllPatients();
      setPatients(data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const exportToCSV = () => {
    const headers = ['Patient ID', 'Name', 'Age', 'Gender', 'Email', 'Phone', 'Created Date'];
    const rows = patients.map(p => [
      p.id,
      `"${p.name || ''}"`,
      p.age,
      p.gender,
      `"${p.email || ''}"`,
      `"${p.phone || ''}"`,
      p.createdAt || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Patient_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setFormData({ name: '', age: 40, gender: 'Female', email: '', phone: '' });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPatient(p);
    setFormData({
      name: p.name || '',
      age: p.age || 40,
      gender: p.gender || 'Female',
      email: p.email || '',
      phone: p.phone || ''
    });
    setIsCreateModalOpen(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    try {
      const dto = {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone
      };

      if (editingPatient) {
        await api.updatePatient(editingPatient.id, dto);
      } else {
        await api.createPatient(dto);
      }

      setIsCreateModalOpen(false);
      loadPatients();
    } catch (err) {
      alert('Failed to save patient record: ' + err.message);
    }
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm(`Delete patient record PAT-${id}?`)) {
      try {
        await api.deletePatient(id);
        loadPatients();
      } catch (err) {
        alert('Failed to delete patient');
      }
    }
  };

  const handleViewHistory = async (patient) => {
    setHistoryPatient(patient);
    setLoadingHistory(true);
    try {
      const history = await api.getPatientHistory(patient.id);
      setPatientHistory(history || []);
    } catch (err) {
      console.error('Error fetching patient history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.id).includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="clinical-card p-6 border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-[#2563EB] dark:text-blue-400 shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white tracking-tight">EHR Patient Master Registry</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">Central database for clinical demographic profiles & diagnostic logs.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700 px-4 py-2.5 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Export patient records to CSV file"
          >
            <Download className="h-4 w-4 text-[#2563EB]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search patient name, email or EHR ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full clinical-input pl-10 pr-4 py-2 text-xs"
          />
        </div>
        <div className="text-xs text-[#64748B] dark:text-slate-400 font-mono bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700">
          Total Records: <span className="text-[#2563EB] dark:text-blue-400 font-bold">{filteredPatients.length}</span>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="clinical-card border-[#E2E8F0] dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#64748B] dark:text-slate-400 text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-[#2563EB] dark:text-blue-400" />
            <span>Querying PostgreSQL Patient Database...</span>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] dark:text-slate-400 text-xs">
            No patient records match the search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-900/80 text-[#64748B] dark:text-slate-400 uppercase tracking-wider border-b border-[#E2E8F0] dark:border-slate-800 text-[10px] font-mono">
                <tr>
                  <th className="py-3.5 px-4">EHR ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Demographics</th>
                  <th className="py-3.5 px-4">Contact Detail</th>
                  <th className="py-3.5 px-4 text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB] dark:text-blue-400">
                      PAT-{p.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A] dark:text-white">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-[#0F172A] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700">
                        <span>{p.gender}</span>
                        <span>•</span>
                        <span>{p.age} yrs</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] dark:text-slate-400">
                      {p.email || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onRunPredictionForPatient(p.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors text-[11px] font-semibold"
                      >
                        <Stethoscope className="h-3 w-3" />
                        <span>Run Test</span>
                      </button>
                      <button
                        onClick={() => handleViewHistory(p)}
                        className="p-1.5 rounded-lg text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Diagnostic Log History"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(p.id)}
                        className="p-1.5 rounded-lg text-[#64748B] dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Patient */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-xl space-y-4 text-[#0F172A] dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3.5">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                {editingPatient ? `Edit Patient PAT-${editingPatient.id}` : 'Register New Patient Record'}
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full clinical-input px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full clinical-input px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full clinical-input px-3 py-2 text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full clinical-input px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] dark:text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full clinical-input px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 text-xs font-semibold hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 shadow-xs transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Patient Diagnostic History */}
      {historyPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-800 shadow-xl space-y-4 max-h-[85vh] flex flex-col text-[#0F172A] dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  Diagnostic Log History: {historyPatient.name}
                </h3>
                <p className="text-xs text-[#2563EB] dark:text-blue-400 font-mono">PAT-{historyPatient.id}</p>
              </div>
              <button onClick={() => setHistoryPatient(null)} className="text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingHistory ? (
                <div className="p-6 text-center text-xs text-[#64748B] dark:text-slate-400 flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-[#2563EB] dark:text-blue-400" />
                  <span>Fetching diagnostic logs...</span>
                </div>
              ) : patientHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B] dark:text-slate-400">
                  No historical prediction logs found for this patient.
                </div>
              ) : (
                patientHistory.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[#E2E8F0] dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A] dark:text-white uppercase tracking-wide">{item.diseaseTarget}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                        item.riskLevel === 'Low' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                        item.riskLevel === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
                        'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {item.riskLevel} Risk
                      </span>
                    </div>
                    <div className="text-[#64748B] dark:text-slate-400 text-[11px] flex justify-between">
                      <span>Outcome: <strong className="text-[#0F172A] dark:text-white">{item.predictedDisease}</strong></span>
                      <span className="font-mono">Confidence: {(item.confidenceScore * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
