import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore, OFFICIAL_DEMO_USERS, hasPermission } from '../store/useStore';
import { RoleBadge } from './RoleBadge';
import type { UserRole } from '../types';
import {
  isAirplaneMode,
  setAirplaneMode,
} from '../api/client';
import {
  Home,
  FileCheck2,
  PlusCircle,
  GitBranch,
  Layers,
  BookOpen,
  MapPin,
  Search,
  Printer,
  LayoutDashboard,
  AlertOctagon,
  Clock,
  LogOut,
  Globe,
  Menu,
  X,
  UserCheck,
  PhoneCall,
  Plane,
  Wifi,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [airplaneActive, setAirplaneActive] = useState<boolean>(isAirplaneMode());
  const isBn = i18n.language === 'bn';

  useEffect(() => {
    const handler = (e: any) => setAirplaneActive(e.detail);
    window.addEventListener('smartbhumi:airplane-mode-changed', handler);
    return () => window.removeEventListener('smartbhumi:airplane-mode-changed', handler);
  }, []);

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'bn' ? 'en' : 'bn';
    i18n.changeLanguage(nextLng);
  };

  const toggleAirplane = () => {
    const next = !airplaneActive;
    setAirplaneMode(next);
    setAirplaneActive(next);
  };

  const handleSelectDemoRole = (role: UserRole) => {
    login(role);
    localStorage.setItem('smartbhumi_demo_role', role);
    localStorage.setItem('smartbhumi_demo_user_name', OFFICIAL_DEMO_USERS[role].nameEn);
    setRoleDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('smartbhumi_demo_role');
    localStorage.removeItem('smartbhumi_demo_user_name');
    navigate('/');
  };

  // Nav links: Public citizen services + Hackathon modules are always open!
  const navLinks = [
    { to: '/', label: t('nav.home'), icon: Home, show: true },
    { to: '/verify', label: t('nav.verify'), icon: FileCheck2, show: true },
    { to: '/register', label: t('nav.register'), icon: PlusCircle, show: true },
    { to: '/mutation', label: t('nav.mutation'), icon: GitBranch, show: true },
    { to: '/ledger', label: t('nav.ledger'), icon: Layers, show: true },
    { to: '/lineage', label: t('nav.lineage'), icon: BookOpen, show: true },
    { to: '/map', label: t('nav.map'), icon: MapPin, show: true },
    { to: '/search', label: t('nav.search'), icon: Search, show: true },
    { to: '/print-deeds', label: t('nav.printDeeds'), icon: Printer, show: true },
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, show: !!currentUser },
    {
      to: '/flagged',
      label: t('nav.flagged'),
      icon: AlertOctagon,
      show: hasPermission(currentUser?.role, 'review'),
    },
    {
      to: '/history',
      label: t('nav.history'),
      icon: Clock,
      show: hasPermission(currentUser?.role, 'viewHistory'),
    },
  ];

  return (
    <>
      {/* 1. Top Official National Ribbon */}
      <div className="bg-[#0b2915] text-emerald-200/90 text-xs py-1.5 px-4 font-medium border-b border-emerald-800/80">
        <div className="container mx-auto flex items-center justify-between flex-wrap gap-2 max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <strong className="text-white font-semibold">
                {isBn ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার' : "Govt of the People's Republic of Bangladesh"}
              </strong>
              <span className="hidden sm:inline text-emerald-700">|</span>
              <span className="hidden sm:inline text-emerald-200/80">
                {isBn ? 'ভূমি মন্ত্রণালয় — স্মার্ট ভূমি সেবা' : 'Ministry of Land — Smart Bhumi'}
              </span>
            </span>

            {/* Subtle, elegant synthetic data disclaimer */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-amber-300 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {isBn
                ? 'সিমুলেশন ও সিন্থেটিক ডেটা (এনআইডি ৯৯৯০০০...)'
                : 'Simulation & Synthetic Demo Data (NID 999000...)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Airplane Mode Toggle for Offline Verification Proof */}
            <button
              onClick={toggleAirplane}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer select-none ${
                airplaneActive
                  ? 'bg-amber-900/90 text-amber-200 border-amber-500 animate-pulse'
                  : 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border-emerald-700/80'
              }`}
              title={isBn ? 'অফলাইন নেটওয়ার্ক পরীক্ষা মোড' : 'Simulate Offline Flight Mode'}
            >
              {airplaneActive ? (
                <>
                  <Plane className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isBn ? 'অফলাইন মোড চালু' : 'Airplane Mode ON'}</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? 'অনলাইন নেটওয়ার্ক' : 'Live Online'}</span>
                </>
              )}
            </button>

            {/* Helpline 16122 */}
            <div className="hidden md:flex items-center gap-1.5 text-emerald-300 text-[11px]">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'হটলাইন:' : 'Helpline:'}</span>
              <strong className="text-white font-mono">16122</strong>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/80 px-2.5 py-0.5 rounded-lg text-xs transition font-medium cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{i18n.language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        <div className="container mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-1.5 xl:gap-2.5 max-w-7xl">
          {/* Brand with Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white shadow-xs border border-emerald-100 flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0">
              <img src="/logo.png" alt="SmartBhumi Logo" className="w-full h-full object-contain" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg xl:text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Smart<span className="text-emerald-700">Bhumi</span>
                </span>
                <span className="hidden 2xl:inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1 h-1 rounded-full bg-emerald-600"></span>
                  {isBn ? 'জাতীয় পোর্টাল' : 'Govt Portal'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-none hidden 2xl:block">
                {isBn ? 'ভূমি মন্ত্রণালয়, বাংলাদেশ সরকার' : 'Ministry of Land, Bangladesh'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 text-xs 2xl:text-sm font-medium shrink min-w-0">
            {navLinks
              .filter((l) => l.show)
              .map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1 px-1.5 2xl:px-2.5 py-1 2xl:py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
          </nav>

          {/* Auth & Demo Role Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Demo Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 text-xs font-semibold transition cursor-pointer"
                title="Select Hackathon Demo Persona"
              >
                <span>{currentUser ? (isBn ? currentUser.nameBn : currentUser.nameEn) : (isBn ? 'ডেমো ভূমিকা' : 'Demo Role')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    {isBn ? 'ডেমো ভূমিকা নির্বাচন করুন' : 'Select Demo Persona'}
                  </div>
                  {(['citizen', 'officer', 'reviewer', 'admin'] as UserRole[]).map((r) => {
                    const u = OFFICIAL_DEMO_USERS[r];
                    const isSelected = currentUser?.role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => handleSelectDemoRole(r)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${
                          isSelected ? 'bg-emerald-50/80 font-bold text-emerald-900' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{isBn ? u.nameBn : u.nameEn}</div>
                          <div className="text-[10px] text-slate-500">{isBn ? u.designationBn : u.designationEn}</div>
                        </div>
                        <RoleBadge role={r} size="sm" compact={true} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile Display / Login */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5">
                  <RoleBadge role={currentUser.role} size="sm" compact={true} />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-emerald-700/25 transition hover:shadow shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isBn ? 'লগইন / প্রবেশ' : 'Sign In'}</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg xl:hidden cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-emerald-100 bg-white px-4 py-3 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto">
            {navLinks
              .filter((l) => l.show)
              .map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-700 hover:bg-emerald-50/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

            {/* Mobile Demo Persona Selection */}
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                {isBn ? 'ডেমো ভূমিকা নির্বাচন' : 'Switch Demo Role'}
              </div>
              {(['citizen', 'officer', 'reviewer', 'admin'] as UserRole[]).map((r) => {
                const u = OFFICIAL_DEMO_USERS[r];
                return (
                  <button
                    key={r}
                    onClick={() => {
                      handleSelectDemoRole(r);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between rounded-lg hover:bg-emerald-50"
                  >
                    <span className="font-semibold text-slate-700">{isBn ? u.nameBn : u.nameEn}</span>
                    <RoleBadge role={r} size="sm" compact={true} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
