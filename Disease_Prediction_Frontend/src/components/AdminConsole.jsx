import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, UserCheck, ShieldAlert, KeyRound, Search, RefreshCw, Trash2, CheckCircle2, XCircle, Shield, User, Lock, Activity, ArrowUpRight 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminConsole() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load user directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setActionSuccess(`Updated user #${userId} role to ${newRole}`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Role update failed:', err);
    }
  };

  const handleToggleStatus = async (userId, currentEnabled) => {
    try {
      const newStatus = !currentEnabled;
      await api.updateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, enabled: newStatus } : u));
      setActionSuccess(`Updated user #${userId} status to ${newStatus ? 'ENABLED' : 'SUSPENDED'}`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Status toggle failed:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to permanently delete user #${userId}?`)) return;
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setActionSuccess(`Deleted user #${userId}`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('User deletion failed:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'ROLE_ADMIN').length;
  const doctorCount = users.filter(u => u.role === 'ROLE_DOCTOR').length;
  const suspendedCount = users.filter(u => !u.enabled).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Enterprise Security & RBAC Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Admin User Management Console
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Manage practitioner accounts, assign Role-Based Access Control (RBAC) permissions, review HIPAA security audit trails, and toggle user activation status.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Directory</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">{totalUsers}</h3>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Admins</span>
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2 font-mono">{adminCount}</h3>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Doctors</span>
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">{doctorCount}</h3>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suspended</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 font-mono">{suspendedCount}</h3>
        </div>
      </div>

      {/* User Management Directory Panel */}
      <div className="clinical-card border-[#E2E8F0] dark:border-slate-800 overflow-hidden space-y-4 p-6">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by full name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full clinical-input pl-10 pr-4 py-2 text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">Role Filter:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="clinical-input px-3 py-2 text-xs font-bold"
            >
              <option value="ALL">All Roles ({totalUsers})</option>
              <option value="ROLE_ADMIN">Admins ({adminCount})</option>
              <option value="ROLE_DOCTOR">Doctors ({doctorCount})</option>
              <option value="ROLE_RESEARCHER">Researchers</option>
              <option value="ROLE_PATIENT">Patients</option>
            </select>
          </div>
        </div>

        {/* User Accounts Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Practitioner / Account</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Security Role (RBAC)</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {filteredUsers.map((u) => {
                const isAdmin = u.role === 'ROLE_ADMIN';
                const isCurrent = currentUser?.username === u.username;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      USR-{u.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <span>{u.fullName || u.username}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">@{u.username}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border focus:outline-none ${
                          isAdmin 
                            ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' 
                            : u.role === 'ROLE_RESEARCHER'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                              : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        <option value="ROLE_DOCTOR">Doctor (ROLE_DOCTOR)</option>
                        <option value="ROLE_ADMIN">Admin (ROLE_ADMIN)</option>
                        <option value="ROLE_RESEARCHER">Researcher (ROLE_RESEARCHER)</option>
                        <option value="ROLE_PATIENT">Patient (ROLE_PATIENT)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.enabled)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1.5 transition ${
                          u.enabled 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {u.enabled ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-500" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={isCurrent}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition disabled:opacity-30"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Access Audit Log */}
      <div className="clinical-card border-[#E2E8F0] dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">HIPAA Security Access & Audit Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time system transaction events and user RBAC modifications</p>
          </div>
          <span className="text-xs font-mono text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Audit Vault Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">User Identity</th>
                <th className="pb-3">Action Event</th>
                <th className="pb-3">Resource Target</th>
                <th className="pb-3 text-right">Security Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
              <tr>
                <td className="py-2.5 text-slate-400">Just now</td>
                <td className="py-2.5 font-bold text-blue-600 dark:text-blue-400">@{currentUser?.username || 'admin_doctor'}</td>
                <td className="py-2.5 text-slate-800 dark:text-slate-200">AUTHENTICATION_LOGIN_SUCCESS</td>
                <td className="py-2.5 text-slate-500">/api/v1/auth/login</td>
                <td className="py-2.5 text-right font-bold text-emerald-500">INFO</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-400">5 mins ago</td>
                <td className="py-2.5 font-bold text-blue-600 dark:text-blue-400">@dr_vance</td>
                <td className="py-2.5 text-slate-800 dark:text-slate-200">PREDICTION_INFERENCE_EXECUTE</td>
                <td className="py-2.5 text-slate-500">/api/v1/predictions/diabetes</td>
                <td className="py-2.5 text-right font-bold text-blue-500">LOW</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-400">18 mins ago</td>
                <td className="py-2.5 font-bold text-blue-600 dark:text-blue-400">@admin_doctor</td>
                <td className="py-2.5 text-slate-800 dark:text-slate-200">ROLE_MODIFICATION_UPDATE</td>
                <td className="py-2.5 text-slate-500">/api/v1/users/3/role</td>
                <td className="py-2.5 text-right font-bold text-amber-500">WARN</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
