import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, User, KeyRound, Eye, EyeOff, X, Sparkles, UserCheck, Stethoscope, ShieldAlert } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, isDark }) {
  const { authMode, setAuthMode, login, register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    usernameOrEmail: '',
    password: '',
    fullName: '',
    role: 'ROLE_DOCTOR',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'login') {
      if (!formData.usernameOrEmail || !formData.password) {
        setErrorMsg('Please enter both username/email and password.');
        return;
      }
      const res = await login(formData.usernameOrEmail, formData.password);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed');
      }
    } else {
      if (!formData.username || !formData.email || !formData.password) {
        setErrorMsg('Username, email, and password are required.');
        return;
      }
      const res = await register(formData);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed');
      }
    }
  };

  const handleQuickDemoLogin = async (roleType) => {
    setErrorMsg('');
    const demoUser = roleType === 'admin' ? 'admin_doctor' : 'dr_vance';
    const demoPass = 'password123';
    
    setFormData({
      ...formData,
      usernameOrEmail: demoUser,
      password: demoPass,
    });

    const res = await login(demoUser, demoPass);
    if (!res.success) {
      setErrorMsg(res.error || 'Demo quick login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300 ${
        isDark ? 'border-[#1E293B] bg-[#0B1120] text-slate-100' : 'border-slate-200 bg-white text-slate-800'
      }`}>
        
        {/* Top Glow & Banner */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">
                {authMode === 'login' ? 'Practitioner Sign In' : 'Register Practitioner'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                MediPulse Clinical Security Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-xl p-2 transition-colors ${
              isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 py-2">
          <div className={`flex rounded-xl p-1 border ${
            isDark ? 'bg-[#090D16] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="px-6 py-2">
          <div className={`rounded-xl p-3 border text-xs ${
            isDark ? 'bg-blue-950/30 border-blue-900/50' : 'bg-blue-50/70 border-blue-200'
          }`}>
            <div className="flex items-center space-x-1.5 font-semibold text-blue-500 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Quick Demo Sign In (One-Click)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('doctor')}
                className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg border font-medium text-[11px] transition-colors ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-blue-300 hover:bg-slate-700'
                    : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-100/60 shadow-xs'
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
                <span>Doctor Mode</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg border font-medium text-[11px] transition-colors ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-emerald-300 hover:bg-slate-700'
                    : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100/60 shadow-xs'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Admin Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="px-6 py-1">
            <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-500">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-3 space-y-3.5">
          {authMode === 'login' ? (
            <>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    placeholder="dr_vance or alex@medipulse.ai"
                    className={`w-full rounded-xl border pl-9 pr-3 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border pl-9 pr-10 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Dr. Eleanor Vance"
                    className={`w-full rounded-xl border pl-9 pr-3 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="dr_vance"
                    className={`w-full rounded-xl border px-3 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full rounded-xl border px-3 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="ROLE_DOCTOR">Physician / Doctor</option>
                    <option value="ROLE_ADMIN">Health Admin</option>
                    <option value="ROLE_PATIENT">Patient Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vance@hospital.org"
                    className={`w-full rounded-xl border pl-9 pr-3 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className={`w-full rounded-xl border pl-9 pr-10 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2 pb-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>{authMode === 'login' ? 'Authenticate Session' : 'Create Practitioner Account'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
