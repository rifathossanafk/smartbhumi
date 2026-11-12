import React, { useState, useEffect, useRef } from 'react';
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
  MoreHorizontal,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [airplaneActive, setAirplaneActive] = useState<boolean>(isAirplaneMode());
  const isBn = i18n.language === 'bn';
  const moreRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: any) => setAirplaneActive(e.detail);
    window.addEventListener('smartbhumi:airplane-mode-changed', handler);
    return () => window.removeEventListener('smartbhumi:airplane-mode-changed', handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreDropdownOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

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

  // Primary visible nav links (citizen-facing)
  const primaryLinks = [
    { to: '/', label: isBn ? 'হোম' : 'Home', icon: Home },
    { to: '/verify', label: isBn ? 'দলিল যাচাই' : 'Verify', icon: FileCheck2 },
    { to: '/search', label: isBn ? 'অনুসন্ধান' : 'Search', icon: Search },
    { to: '/map', label: isBn ? 'মানচিত্র' : 'Map', icon: MapPin },
  ];

  // "More services" dropdown links
  const moreLinks = [
    { to: '/register', label: isBn ? 'দলিল রেজিস্ট্রি' : 'Register Deed', icon: PlusCircle, show: true },
    { to: '/mutation', label: isBn ? 'ই-নামজারি' : 'e-Mutation', icon: GitBranch, show: true },
    { to: '/ledger', label: isBn ? 'অডিট লেজার' : 'Audit Ledger', icon: Layers, show: true },
    { to: '/lineage', label: isBn ? 'খতিয়ান লিনিয়েজ' : 'Khatian Lineage', icon: BookOpen, show: true },
    { to: '/print-deeds', label: isBn ? 'প্রিন্ট কিট' : 'Print Kit', icon: Printer, show: true },
    { to: '/dashboard', label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard, show: !!currentUser },
    { to: '/flagged', label: isBn ? 'পতাকাঙ্কিত' : 'Flagged', icon: AlertOctagon, show: hasPermission(currentUser?.role, 'review') },
    { to: '/history', label: isBn ? 'ইতিহাস' : 'History', icon: Clock, show: hasPermission(currentUser?.role, 'viewHistory') },
  ];

  // All nav links for mobile
  const allLinks = [
    ...primaryLinks.map(l => ({ ...l, show: true })),
    ...moreLinks,
  ];

  return (
    <>
      {/* 1. Top Official National Ribbon */}
      <div className="bg-[#0b2915] text-emerald-200/90 text-[11px] py-1.5 px-4 font-medium border-b border-emerald-800/80 print:hidden">
        <div className="container mx-auto flex items-center justify-between flex-wrap gap-2 max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <strong className="text-white font-semibold text-[11px]">
                {isBn ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার' : "Govt of the People's Republic of Bangladesh"}
              </strong>
              <span className="hidden sm:inline text-emerald-700">|</span>
              <span className="hidden sm:inline text-emerald-200/80">
                {isBn ? 'ভূমি মন্ত্রণালয় | জাতীয় ডিজিটাল ভূমি সেবা' : 'Ministry of Land | National Digital Land Portal'}
              </span>
            </span>

            {/* Live Cryptographic Status Pill like competitor */}
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {isBn ? 'লেজার অক্ষত (RFC 9162)' : 'Ledger Verified'}
            </span>
            <span className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-teal-700/60 text-teal-300 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              {isBn ? 'ডুয়াল পিভিকিউসি সিল' : 'Dual PQC Sealed'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Airplane Mode Toggle */}
            <button
              onClick={toggleAirplane}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition cursor-pointer select-none ${
                airplaneActive
                  ? 'bg-amber-900/90 text-amber-200 border-amber-500 animate-pulse'
                  : 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border-emerald-700/80'
              }`}
              title={isBn ? 'অফলাইন নেটওয়ার্ক পরীক্ষা মোড' : 'Simulate Offline Flight Mode'}
            >
              {airplaneActive ? (
                <>
                  <Plane className="w-3 h-3 text-amber-300" />
                  <span>{isBn ? 'অফলাইন' : 'Offline'}</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>{isBn ? 'অনলাইন' : 'Online'}</span>
                </>
              )}
            </button>

            {/* Helpline */}
            <div className="hidden md:flex items-center gap-1 text-emerald-300 text-[10px]">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>{isBn ? 'হটলাইন:' : 'Helpline:'}</span>
              <strong className="text-white font-mono">16122</strong>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/80 px-2 py-0.5 rounded-lg text-[11px] transition font-medium cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>{i18n.language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-emerald-100 shadow-xs print:hidden">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 max-w-7xl">
          {/* Brand with Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.svg"
              alt="SmartBhumi Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-sans">
                  {isBn ? (
                    <>স্মার্ট<span className="text-emerald-700">ভূমি</span></>
                  ) : (
                    <>Smart<span className="text-emerald-700">Bhumi</span></>
                  )}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-none hidden sm:block">
                {isBn ? 'ভূমি মন্ত্রণালয়, বাংলাদেশ সরকার' : 'Ministry of Land, Bangladesh'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {primaryLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* More Services Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  moreDropdownOpen
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/60'
                }`}
              >
                <MoreHorizontal className="w-4 h-4 shrink-0" />
                <span>{isBn ? 'আরও সেবা' : 'More'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 animate-dropdown">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    {isBn ? 'অতিরিক্ত ভূমি সেবাসমূহ' : 'Additional Land Services'}
                  </div>
                  {moreLinks
                    .filter((l) => l.show)
                    .map((link) => {
                      const isActive = location.pathname === link.to;
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition ${
                            isActive
                              ? 'bg-emerald-50/80 font-bold text-emerald-900'
                              : 'text-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          </nav>

          {/* Auth & Demo Role Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Demo Persona Switcher */}
            <div className="relative" ref={roleRef}>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 text-xs font-semibold transition cursor-pointer"
                title={isBn ? 'ডেমো ভূমিকা নির্বাচন' : 'Select Hackathon Demo Persona'}
              >
                <span>{currentUser ? (isBn ? currentUser.nameBn : currentUser.nameEn) : (isBn ? 'ডেমো ভূমিকা' : 'Demo Role')}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 animate-dropdown">
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
                        className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${
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
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-emerald-700/25 transition hover:shadow shrink-0"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isBn ? 'লগইন' : 'Sign In'}</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-emerald-100 bg-white px-4 py-3 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto animate-dropdown">
            {allLinks
              .filter((l) => l.show)
              .map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
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
