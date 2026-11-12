import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Plane,
  Wifi,
  Globe,
  UserCheck,
  Menu,
  X,
  FileCheck2,
  FilePlus2,
  GitBranch,
  Layers,
  FileText,
  Printer
} from 'lucide-react';
import { isAirplaneMode, setAirplaneMode } from '../api/client';

export type DemoRole = 'citizen' | 'officer' | 'reviewer' | 'admin';

export const DEMO_ROLES: Record<DemoRole, { labelBn: string; labelEn: string; icon: string; descBn: string }> = {
  citizen: {
    labelBn: 'নাগরিক (মালিক/ক্রেতা)',
    labelEn: 'Citizen (Owner/Buyer)',
    icon: '👤',
    descBn: 'দলিল যাচাই ও অধিকার অনুসন্ধান',
  },
  officer: {
    labelBn: 'সাব-রেজিস্ট্রার (নিবন্ধন কর্মকর্তা)',
    labelEn: 'Sub-Registrar (Officer)',
    icon: '🏛️',
    descBn: 'দলিল নিব্ন্ধন ও সিলমোহরকরণ',
  },
  reviewer: {
    labelBn: 'সহকারী কমিশনার - ভূমি (AC Land)',
    labelEn: 'AC Land (Reviewer)',
    icon: '⚖️',
    descBn: 'ই-নামজারি (Mutation) অনুমোদন',
  },
  admin: {
    labelBn: 'সুপার এডমিন (জাতীয় মহাপরিচালক)',
    labelEn: 'Super Admin',
    icon: '🛡️',
    descBn: 'সিস্টেম অডিট ও রেড-টিম সিমুলেশন',
  },
};

export const AppNavbar: React.FC = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isBn = i18n.language === 'bn';

  const [currentRole, setCurrentRole] = useState<DemoRole>(() => {
    return (localStorage.getItem('smartbhumi_demo_role') as DemoRole) || 'officer';
  });

  const [airplaneActive, setAirplaneActive] = useState<boolean>(isAirplaneMode());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e: any) => setAirplaneActive(e.detail);
    window.addEventListener('smartbhumi:airplane-mode-changed', handler);
    return () => window.removeEventListener('smartbhumi:airplane-mode-changed', handler);
  }, []);

  const handleRoleChange = (newRole: DemoRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('smartbhumi_demo_role', newRole);
    localStorage.setItem('smartbhumi_demo_user_name', DEMO_ROLES[newRole].labelBn);
    window.location.reload(); // Refresh to re-read role context cleanly
  };

  const toggleLanguage = () => {
    const next = isBn ? 'en' : 'bn';
    i18n.changeLanguage(next);
  };

  const toggleAirplaneMode = () => {
    const next = !airplaneActive;
    setAirplaneMode(next);
    setAirplaneActive(next);
  };

  const navLinks = [
    { to: '/', labelBn: 'যাচাইকরণ (Verify)', labelEn: 'Verify Deed', icon: FileCheck2 },
    { to: '/register', labelBn: 'রেজিস্ট্রি ও হস্তান্তর', labelEn: 'Register', icon: FilePlus2 },
    { to: '/mutation', labelBn: 'ই-নামজারি (Mutation)', labelEn: 'e-Mutation', icon: GitBranch },
    { to: '/ledger', labelBn: 'লেজার ও পিভিকিউসি', labelEn: 'Ledger & PQC', icon: Layers },
    { to: '/lineage', labelBn: 'নকশা ও ফারায়েজ', labelEn: 'Lineage & Faraiz', icon: FileText },
    { to: '/print-deeds', labelBn: 'প্রিন্ট দলিল', labelEn: 'Print Deeds', icon: Printer },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-7 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-900 transition-colors">
              <Shield className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-emerald-950 tracking-tight">SmartBhumi</span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded uppercase">
                  PQC v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {isBn ? 'ডিজিটাল ভূমি রেকর্ড ও ক্রিপ্টোগ্রাফিক যাচাই' : 'Cryptographic Land Registry'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{isBn ? item.labelBn : item.labelEn}</span>
                </Link>
              );
            })}
          </nav>

          {/* Controls: Airplane Mode, Language, Demo Role */}
          <div className="flex items-center gap-2">
            {/* Airplane Mode Simulation Toggle */}
            <button
              onClick={toggleAirplaneMode}
              title={
                airplaneActive
                  ? isBn
                    ? 'এয়ারপ্লেন মোড সক্রিয়: সকল নেটওয়ার্ক কল ব্লক করা হয়েছে (অফলাইন প্রুফ)'
                    : 'Airplane Mode Active: network blocked to prove 100% offline verification'
                  : isBn
                    ? 'এয়ারপ্লেন মোড চালু করুন (অফলাইন যাচাইকরণের প্রমাণ)'
                    : 'Enable Airplane Mode Simulation'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                airplaneActive
                  ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {airplaneActive ? <Plane className="w-4 h-4 text-red-600" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
              <span className="hidden sm:inline">
                {airplaneActive ? (isBn ? 'অফলাইন মোড' : 'Offline Mode') : (isBn ? 'অনলাইন' : 'Online')}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{isBn ? 'EN' : 'বাং'}</span>
            </button>

            {/* Demo Role Switcher */}
            <div className="relative">
              <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value as DemoRole)}
                className="text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg px-2.5 py-1.5 pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-700 select-none appearance-none"
                title="Select Demo Role"
              >
                {Object.entries(DEMO_ROLES).map(([roleKey, info]) => (
                  <option key={roleKey} value={roleKey}>
                    {info.icon} {isBn ? info.labelBn : info.labelEn}
                  </option>
                ))}
              </select>
              <UserCheck className="w-3.5 h-3.5 text-emerald-800 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  active ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{isBn ? item.labelBn : item.labelEn}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

