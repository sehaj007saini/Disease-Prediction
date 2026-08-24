import React, { useState } from 'react';
import { 
  Activity, LayoutDashboard, Stethoscope, Users, Layers, Server, ShieldCheck, Zap, Sun, Moon, Cpu, Sliders, Bot, Sparkles, LogOut, LogIn, Menu, X, ChevronRight, Watch, UserCheck, Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, backendStatus, mlStatus, theme, toggleTheme, onOpenWearableModal }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'predict', label: 'Single Risk Predictor', icon: Stethoscope },
    { id: 'multi', label: '5-Disease Screen', icon: Sparkles },
    { id: 'simulate', label: 'What-If Studio', icon: Sliders },
    { id: 'governance', label: 'XAI & Governance', icon: Cpu },
    { id: 'patients', label: 'Patient Registry', icon: Users },
    { id: 'batch', label: 'Batch Processing', icon: Layers },
    { id: 'admin', label: 'Admin Console', icon: ShieldCheck },
    { id: 'profile', label: 'My Profile', icon: UserCheck },
    { id: 'copilot', label: 'MedAssist AI', icon: Bot },
    { id: 'system', label: 'System Health', icon: Server },
  ];

  const isDark = theme === 'dark';

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-200 backdrop-blur-xl ${
      isDark ? 'border-[#1E293B] bg-[#090D16]/90 shadow-lg shadow-black/20' : 'border-[#E2E8F0] bg-white/90 shadow-xs'
    }`}>
      <div className="mx-auto flex max-w-[1536px] items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5">
        
        {/* Brand Logo & Workstation Tag */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group shrink-0" 
          onClick={() => handleNavClick('dashboard')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Activity className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold tracking-tight font-heading ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                MediPulse <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent font-extrabold">AI</span>
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold border ${
                isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800/60' : 'bg-blue-50 text-[#2563EB] border-blue-200/80'
              }`}>
                EHR v2.4
              </span>
            </div>
            <p className={`text-[11px] font-normal hidden sm:block ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Clinical Diagnostic Intelligence Suite
            </p>
          </div>
        </div>

        {/* Primary Desktop Navigation */}
        <nav className={`hidden lg:flex items-center space-x-1 rounded-2xl p-1 border transition-colors ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-slate-100/90 border-[#E2E8F0]'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1 rounded-xl px-2.5 py-1 text-[11px] xl:text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm scale-[1.02]'
                    : isDark 
                      ? 'text-slate-400 hover:bg-slate-800/80 hover:text-white' 
                      : 'text-[#64748B] hover:bg-white hover:text-[#0F172A]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Compact Navigation for Medium Screens (md - lg) */}
        <div className="hidden md:flex lg:hidden items-center space-x-1">
          <select
            value={activeTab}
            onChange={(e) => handleNavClick(e.target.value)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
            }`}
          >
            {navItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Operational Status Telemetry & Theme Switcher */}
        <div className="flex items-center space-x-2">
          
          {/* Smartwatch Sync Trigger Button */}
          <button
            onClick={onOpenWearableModal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isDark 
                ? 'bg-blue-950/60 border-blue-800/60 text-blue-400 hover:bg-blue-900/80' 
                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 shadow-xs'
            }`}
            title="Sync Smartwatch Telemetry"
          >
            <Watch className="h-4 w-4 text-blue-500 animate-pulse" />
            <span className="hidden sm:inline">Wearables</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700' 
                : 'bg-white border-[#E2E8F0] text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400 fill-amber-400/20" />
                <span className="hidden sm:inline text-slate-200">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-slate-600 fill-slate-100" />
                <span className="hidden sm:inline text-[#0F172A]">Dark</span>
              </>
            )}
          </button>

          <div className={`hidden sm:flex items-center space-x-2 rounded-xl px-3 py-1.5 border text-xs ${
            isDark ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                backendStatus ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex h-2 w-2 rounded-full ${
                backendStatus ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <span className="font-medium text-[11px]">
              {backendStatus ? 'API Online' : 'Offline Mode'}
            </span>
          </div>

          {mlStatus?.latencyMs && (
            <div className={`hidden lg:flex items-center space-x-1.5 text-[11px] px-2.5 py-1.5 rounded-xl border font-mono ${
              isDark ? 'bg-[#0F172A] border-[#1E293B] text-slate-200' : 'bg-slate-100 border-[#E2E8F0] text-[#0F172A]'
            }`}>
              <Zap className="h-3 w-3 text-[#2563EB] fill-[#2563EB]" />
              <span>{mlStatus.latencyMs}ms</span>
            </div>
          )}

          <div className={`hidden 2xl:flex items-center space-x-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
            isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' : 'bg-emerald-50 text-[#10B981] border-emerald-200'
          }`}>
            <ShieldCheck className="h-3 w-3 text-[#10B981]" />
            <span>HIPAA</span>
          </div>

          {/* User Auth Profile Badge & Controls */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 pl-1 border-l border-slate-700/50">
              <div 
                onClick={() => handleNavClick('profile')}
                className={`flex items-center space-x-2 rounded-xl px-2.5 py-1 border text-xs cursor-pointer hover:border-blue-500 transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
                title="View My Profile"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-[10px]">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-bold leading-tight truncate max-w-[110px]">
                    {user?.fullName || user?.username}
                  </div>
                  <div className="text-[9px] font-mono text-blue-400 uppercase tracking-tighter">
                    {user?.role ? user.role.replace('ROLE_', '') : 'USER'}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className={`p-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isDark ? 'bg-rose-950/40 border-rose-900/50 text-rose-400 hover:bg-rose-900/60' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 shadow-xs'
                }`}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-4 py-4 space-y-2 animate-fade-in ${
          isDark ? 'bg-[#090D16] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="grid grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-sm' 
                      : isDark
                        ? 'text-slate-300 bg-slate-900/60 border border-slate-800'
                        : 'text-[#0F172A] bg-slate-50 border border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

