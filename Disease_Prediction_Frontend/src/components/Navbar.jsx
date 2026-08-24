import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, LayoutDashboard, Stethoscope, Users, Layers, Server, ShieldCheck, Zap, Sun, Moon, Cpu, Sliders, Bot, Sparkles, LogOut, LogIn, Menu, X, ChevronDown, ChevronRight, Watch, UserCheck, Shield, Settings 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, backendStatus, mlStatus, theme, toggleTheme, onOpenWearableModal }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'predict', label: 'Screening', icon: Stethoscope },
    { id: 'multi', label: 'Risk Analysis', icon: Activity },
    { id: 'batch', label: 'Analytics', icon: Layers },
  ];

  const secondaryTools = [
    { id: 'simulate', label: 'Counterfactual Analysis', subtitle: 'What-if risk scenarios', icon: Sliders },
    { id: 'governance', label: 'Model Governance', subtitle: 'XAI metrics & explainability', icon: Cpu },
    { id: 'copilot', label: 'Clinical Assistant', subtitle: 'AI-powered guidance', icon: Bot },
    { id: 'system', label: 'System Health', subtitle: 'Infrastructure monitoring', icon: Server },
    { id: 'admin', label: 'Administration', subtitle: 'User & access management', icon: Settings },
  ];

  const isDark = theme === 'dark';

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  const isSecondaryActive = secondaryTools.some(tool => tool.id === activeTab);

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-200 backdrop-blur-sm ${
      isDark ? 'border-[#1E293B] bg-[#0F172A]/95' : 'border-[#E2E8F0] bg-white/95'
    }`}>
      <div className="mx-auto flex max-w-[1536px] items-center justify-between px-3 sm:px-6 lg:px-8 h-14">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group shrink-0" 
          onClick={() => handleNavClick('dashboard')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white">
            <Activity className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-base font-semibold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              MediPulse AI
            </span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${
              isDark ? 'bg-[#1E293B] border-[#334155] text-slate-400' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
            }`}>
              v2.4
            </span>
          </div>
        </div>

        {/* Primary Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white'
                    : isDark 
                      ? 'text-slate-300 hover:bg-[#1E293B] hover:text-white' 
                      : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Governance Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                isSecondaryActive
                  ? 'bg-[#2563EB] text-white'
                  : isDark
                    ? 'text-slate-300 hover:bg-[#1E293B] hover:text-white'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Governance</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {toolsDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-64 rounded-lg border shadow-lg p-1.5 z-50 ${
                isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
              }`}>
                {secondaryTools.map((tool) => {
                  const ToolIcon = tool.icon;
                  const isToolActive = activeTab === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleNavClick(tool.id)}
                      className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-md transition-all ${
                        isToolActive
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                          : isDark
                            ? 'hover:bg-[#1E293B] text-slate-300'
                            : 'hover:bg-[#F8FAFC] text-[#0F172A]'
                      }`}
                    >
                      <ToolIcon className="h-4 w-4 mt-0.5 text-[#2563EB] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-tight">{tool.label}</div>
                        <div className={`text-xs leading-tight mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                          {tool.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          
          {/* System Status Indicator */}
          <div className={`hidden lg:flex items-center gap-2 rounded-lg px-2.5 py-1.5 border text-xs font-medium ${
            isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                backendStatus ? 'bg-green-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex h-2 w-2 rounded-full ${
                backendStatus ? 'bg-green-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <span className={isDark ? 'text-slate-300' : 'text-[#0F172A]'}>
              {backendStatus ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all ${
              isDark 
                ? 'bg-[#0F172A] border-[#1E293B] text-slate-300 hover:bg-[#1E293B]' 
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-white'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Profile */}
          {isAuthenticated ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 border text-sm transition-all ${
                  isDark ? 'bg-[#0F172A] border-[#1E293B] text-slate-200 hover:bg-[#1E293B]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-white'
                }`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2563EB] text-white font-semibold text-xs">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline font-medium">{user?.fullName?.split(' ')[0] || user?.username}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {userDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg border shadow-lg p-1.5 z-50 ${
                  isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
                }`}>
                  <div className={`px-3 py-2 border-b mb-1 ${isDark ? 'border-[#1E293B]' : 'border-[#E2E8F0]'}`}>
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                      {user?.fullName || user?.username}
                    </div>
                    <div className="text-xs text-[#2563EB] font-medium mt-0.5">
                      {user?.role?.replace('ROLE_', '') || 'USER'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleNavClick('profile')}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition ${
                      isDark ? 'hover:bg-[#1E293B] text-slate-200' : 'hover:bg-[#F8FAFC] text-[#0F172A]'
                    }`}
                  >
                    <UserCheck className="h-4 w-4 text-[#2563EB]" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition ${
                      isDark ? 'hover:bg-red-950/30 text-red-400' : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign in</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg border ${
              isDark ? 'bg-[#0F172A] border-[#1E293B] text-slate-200' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
            }`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-4 py-3 space-y-1 ${
          isDark ? 'bg-[#0F172A] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          {[...primaryNavItems, ...secondaryTools].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#2563EB] text-white' 
                    : isDark
                      ? 'text-slate-300 bg-[#1E293B]/50 hover:bg-[#1E293B]'
                      : 'text-[#0F172A] bg-[#F8FAFC] hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
