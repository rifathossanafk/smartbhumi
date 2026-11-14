import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore, OFFICIAL_DEMO_USERS } from '../store/useStore';
import { RoleBadge } from '../components/RoleBadge';
import type { UserRole } from '../types';
import {
  ArrowRight,
  CreditCard,
  Lock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  QrCode,
  FileCheck2,
  Building2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useStore();
  const isBn = i18n.language === 'bn';

  const redirectPath = (location.state as { from?: string })?.from;

  const [activeTab, setActiveTab] = useState<'citizen' | 'officer'>('citizen');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [identifier, setIdentifier] = useState('99900012345678901');
  const [password, setPassword] = useState('••••••••••••');
  const [justAutoFilled, setJustAutoFilled] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    login(role);
    navigate(redirectPath || '/dashboard');
  };

  const handleQuickFill = (role: UserRole) => {
    setSelectedRole(role);
    const user = OFFICIAL_DEMO_USERS[role];
    setIdentifier(user.nidOrGovId || user.email || '');
    setPassword('••••••••••••');
    setActiveTab(role === 'citizen' ? 'citizen' : 'officer');
    setJustAutoFilled(true);
    setTimeout(() => setJustAutoFilled(false), 2500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    navigate(redirectPath || '/dashboard');
  };

  const credentialCards: {
    role: UserRole;
    tab: 'citizen' | 'officer';
  }[] = [
    { role: 'citizen', tab: 'citizen' },
    { role: 'officer', tab: 'officer' },
    { role: 'reviewer', tab: 'officer' },
    { role: 'admin', tab: 'officer' },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-6">
      {/* Notice if user was redirected from a protected route */}
      {redirectPath && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-center gap-3 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <div className="font-bold">
              {isBn ? 'লগইন আবশ্যক' : 'Authentication Required'}
            </div>
            <div className="text-amber-800 text-xs mt-0.5">
              {isBn
                ? 'অনুরোধকৃত সেবা বা রেকর্ডটি দেখার জন্য অনুগ্রহ করে প্রথমে লগইন সম্পন্ন করুন।'
                : 'Please sign in to access the requested land record service or dashboard.'}
            </div>
          </div>
        </div>
      )}

      {/* Main Split Authentication Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Panel: Government Green Identity Showcase */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Pure SVG map silhouette - Naked logo without enclosing box/border */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="SmartBhumi Bangladesh Map Logo"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
              />
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  {isBn ? 'স্মার্টভূমি' : 'SmartBhumi'}
                </h2>
                <p className="text-[11px] text-emerald-200 font-medium">
                  {isBn ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার' : 'Government of Bangladesh'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-emerald-100 leading-snug">
                {isBn
                  ? 'জমির দলিল যাচাই, স্বয়ংক্রিয় ই-নামজারি ও জালিয়াতি প্রতিরোধ'
                  : 'Land Deed Verification, Automated e-Mutation & Fraud Prevention'}
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                {isBn
                  ? 'নাগরিক ও ভূমি কর্মকর্তাদের জন্য জাতীয় ক্রিপ্টোগ্রাফিক অথেনটিকেশন পোর্টাল।'
                  : 'Unified cryptographic land authority portal for citizens and revenue officers.'}
              </p>
            </div>

            {/* Feature Highlights with icons */}
            <div className="space-y-2.5 pt-2 border-t border-emerald-700/60">
              <div className="flex items-start gap-2.5 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? 'প্রতিটি দলিল ও নামজারি আরএফসি ৯১৬২ মার্কেল লেজারে সুরক্ষিত'
                    : 'Every deed cryptographically sealed on RFC 9162 Merkle log'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-emerald-100">
                <QrCode className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? '১০০% অফলাইন কিউআর ও পোস্ট-কোয়ান্টাম এমএল-ডিএসএ সিল'
                    : '100% offline QR verification & Post-Quantum ML-DSA seal'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-emerald-100">
                <FileCheck2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? 'মালিকের অখণ্ড সম্মতি ও খতিয়ান ব্যালেন্স ছাড়া হস্তান্তর অসম্ভব'
                    : 'Zero unauthorized transfers via integer micro-shotok invariant'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-emerald-100">
                <Building2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <span>
                  {isBn
                    ? 'সাব-রেজিস্ট্রি থেকে এসিল্যান্ড সরাসরি ডিজিটাল পাইপলাইন'
                    : 'Direct automated Sub-Registry to AC Land e-Mutation'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note inside green panel */}
          <div className="pt-6 mt-6 border-t border-emerald-700/40 text-[11px] text-emerald-300/80 flex items-center justify-between relative z-10">
            <span>{isBn ? 'ভূমি মন্ত্রণালয় | নিরাপদ গেটওয়ে' : 'Ministry of Land | Secure'}</span>
            <span className="font-mono text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-200">
              RFC 9162
            </span>
          </div>
        </div>

        {/* Right Panel: Clean Government Sign In Form */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-5">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isBn ? 'পোর্টাল সাইন ইন' : 'Portal Sign In'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'জাতীয় পরিচয়পত্র (NID) বা সরকারি কর্মকর্তা আইডি দিয়ে প্রবেশ করুন'
                : 'Sign in with your National ID or Official Government Service ID'}
            </p>
          </div>

          {/* Citizen vs Official Tab Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('citizen');
                handleQuickFill('citizen');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                activeTab === 'citizen'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'নাগরিক লগইন (NID)' : 'Citizen (NID)'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('officer');
                handleQuickFill('officer');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                activeTab === 'officer'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'কর্মকর্তা লগইন (Gov ID)' : 'Official (Gov ID)'}
            </button>
          </div>

          {justAutoFilled && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isBn
                  ? `${OFFICIAL_DEMO_USERS[selectedRole].nameBn} এর ক্রেডেনশিয়াল পূরণ করা হয়েছে!`
                  : `Credentials populated for ${OFFICIAL_DEMO_USERS[selectedRole].nameEn}!`}
              </span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {activeTab === 'citizen'
                  ? isBn ? 'জাতীয় পরিচয়পত্র (NID) অথবা ইমেইল' : 'National ID (NID) / Email'
                  : isBn ? 'সরকারি আইডি (Gov Service ID) বা ইমেইল' : 'Government Service ID / Official Email'}
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isBn ? 'গোপন পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-800">{isBn ? 'সক্রিয় ভূমিকা:' : 'Active Role:'}</span>
                <RoleBadge role={selectedRole} />
              </div>
              <p className="text-[10px] text-slate-500">
                {isBn
                  ? 'লগইন করার পর স্বয়ংক্রিয়ভাবে আপনার ভূমিকা অনুযায়ী ড্যাশবোর্ডে প্রবেশ করবেন।'
                  : 'You will be redirected immediately to the role dashboard or requested page.'}
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              <span>{isBn ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Public services link without login */}
          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
            <span>{isBn ? 'লগইন ছাড়াই ব্যবহার করুন: ' : 'Public Access: '}</span>
            <Link to="/verify" className="text-emerald-700 font-bold hover:underline">
              {isBn ? 'দলিল যাচাই' : 'Deed Verify'}
            </Link>
            <span className="mx-2 text-slate-300">•</span>
            <Link to="/search" className="text-emerald-700 font-bold hover:underline">
              {isBn ? 'খতিয়ান অনুসন্ধান' : 'Search Record'}
            </Link>
          </div>
        </div>
      </div>

      {/* 1-Click Authorized Personas for Hackathon Judges */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>{isBn ? 'অনুমোদিত প্রোফাইল (বিচারক ও পরীক্ষকদের জন্য ১-ক্লিক প্রবেশ)' : 'Authorized Profiles (1-Click Judge Access)'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'সরাসরি মূল্যায়নের জন্য যেকোনো কর্মকর্তা বা নাগরিক প্রোফাইল বেছে নিন'
                : 'Select any profile for instant live testing without typing passwords'}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto shrink-0">
            {isBn ? '৪টি ভূমিকা' : '4 Roles'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {credentialCards.map((item) => {
            const user = OFFICIAL_DEMO_USERS[item.role];

            return (
              <div
                key={item.role}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 hover:border-emerald-500 hover:bg-emerald-50/20 hover:shadow-xs transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">
                      {isBn ? user.nameBn : user.nameEn}
                    </span>
                    <RoleBadge role={item.role} compact={true} />
                  </div>

                  <div className="text-xs font-semibold text-emerald-800">
                    {isBn ? user.designationBn : user.designationEn}
                  </div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 pt-0.5 font-mono">
                    <span>ID: {user.nidOrGovId}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-sans text-slate-600 truncate">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => handleQuickFill(item.role)}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition border border-slate-200 text-slate-700 hover:bg-white bg-slate-100 cursor-pointer"
                  >
                    {isBn ? 'ফর্ম পূরণ' : 'Auto-Fill'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRole(item.role)}
                    className="text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
                  >
                    <span>{isBn ? '১-ক্লিকে প্রবেশ' : 'Sign In'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
