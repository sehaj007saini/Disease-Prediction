import React from 'react';
import { Activity, LayoutDashboard, Stethoscope, Users, Layers, Server, ShieldCheck, Zap, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus, mlStatus, theme, toggleTheme }) {
  const navItems = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Run Diagnostic Test', icon: Stethoscope },
    { id: 'patients', label: 'Patient Registry', icon: Users },
    { id: 'batch', label: 'Batch Processing', icon: Layers },
    { id: 'system', label: 'Infrastructure Health', icon: Server },
  ];

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-200 backdrop-blur-md ${
      isDark ? 'border-[#1E293B] bg-[#090D16]/90 shadow-md' : 'border-[#E2E8F0] bg-white/95 shadow-xs'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Workstation Tag */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <Activity className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold tracking-tight font-heading ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                MediPulse <span className="text-[#2563EB] font-semibold">AI</span>
              </span>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold border ${
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
        <nav className={`hidden md:flex items-center space-x-1 rounded-xl p-1.5 border transition-colors ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-slate-100/80 border-[#E2E8F0]'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                    : isDark 
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                      : 'text-[#64748B] hover:bg-white hover:text-[#0F172A]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Operational Status Telemetry & Theme Switcher */}
        <div className="flex items-center space-x-2.5">
          
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
              {backendStatus ? 'Spring Boot API Online' : 'Offline Mode'}
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

          <div className={`hidden xl:flex items-center space-x-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
            isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' : 'bg-emerald-50 text-[#10B981] border-emerald-200'
          }`}>
            <ShieldCheck className="h-3 w-3 text-[#10B981]" />
            <span>HIPAA</span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className={`flex md:hidden overflow-x-auto px-3 py-2 border-t space-x-1.5 ${
        isDark ? 'bg-[#090D16] border-[#1E293B]' : 'bg-slate-50 border-[#E2E8F0]'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive 
                  ? 'bg-[#2563EB] text-white shadow-xs' 
                  : isDark
                    ? 'text-slate-400 bg-slate-900 border border-slate-800'
                    : 'text-[#64748B] bg-white border border-[#E2E8F0]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
