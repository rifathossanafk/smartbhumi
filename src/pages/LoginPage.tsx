import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore, OFFICIAL_DEMO_USERS } from '../store/useStore';
import { RoleBadge } from '../components/RoleBadge';
import { BangladeshMapIcon } from '../components/BangladeshMapIcon';
import type { UserRole } from '../types';
import {
  ShieldCheck,
  ArrowRight,
  UserCheck,
  KeyRound,
  Mail,
  CreditCard,
  Lock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useStore();
  const isBn = i18n.language === 'bn';

  const redirectPath = (location.state as { from?: string })?.from;

  const [activeTab, setActiveTab] = useState<'citizen' | 'officer'>('citizen');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [identifier, setIdentifier] = useState('19852694123456789');
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
    <div className="container mx-auto max-w-5xl px-4 py-12 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-100 shadow-md shadow-emerald-900/10 flex items-center justify-center mx-auto p-2">
          <img src="/logo.png" alt="LandProof Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
          {isBn ? 'স্মার্ট ভূমি পোর্টাল লগইন' : 'Smart Land Portal Sign In'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          {isBn
            ? 'নাগরিক ও ভূমি কর্মকর্তাদের জন্য গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের প্রাতিষ্ঠানিক ডিজিটাল অথেনটিকেশন পোর্টাল।'
            : 'Official Ministry of Land Authentication Portal for citizens, land revenue officers, and reviewers.'}
        </p>
      </div>

      {/* Redirect Notice if user attempted to access protected route without login */}
      {redirectPath && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex items-center gap-3 shadow-sm animate-fade-in">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive 4-Persona Credentials Cards */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>{isBn ? 'অনুমোদিত প্রোফাইল (১-ক্লিক প্রবেশ)' : 'Authorized Persona Cards (1-Click Login)'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {isBn ? 'মূল্যায়ন ও সরাসরি পরীক্ষার জন্য যেকোনো কর্মকর্তা বা নাগরিক প্রোফাইল বেছে নিন' : 'Select any official profile for direct evaluation and testing'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto shrink-0">
              {isBn ? '৪টি ভূমিকা' : '4 Roles'}
            </span>
          </div>

          <div className="space-y-3">
            {credentialCards.map((item) => {
              const user = OFFICIAL_DEMO_USERS[item.role];

              return (
                <div
                  key={item.role}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 hover:border-emerald-500 hover:bg-emerald-50/20 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {isBn ? user.nameBn : user.nameEn}
                      </span>
                      <RoleBadge role={item.role} compact={true} />
                    </div>

                    <div className="text-xs font-semibold text-emerald-800">
                      {isBn ? user.designationBn : user.designationEn}
                    </div>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5 font-mono">
                      <span>ID: {user.nidOrGovId}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-sans text-slate-600 truncate">{user.email}</span>
                      <span className="text-slate-300 hidden md:inline">•</span>
                      <span className="font-sans text-slate-500 truncate hidden md:inline">📍 {isBn ? user.jurisdictionBn : user.jurisdictionEn}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleQuickFill(item.role)}
                      className="text-[11px] font-semibold px-3 py-2 rounded-xl transition border border-slate-200 text-slate-700 hover:bg-white bg-slate-100 cursor-pointer"
                      title={isBn ? 'ফর্ম পূরণ করুন' : 'Auto-fill form'}
                    >
                      {isBn ? 'ফর্মে পূরণ' : 'Auto-Fill'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectRole(item.role)}
                      className="text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
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

        {/* Right Column: Portal Sign In Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="space-y-0.5 pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              {isBn ? 'পোর্টাল সাইন ইন' : 'Portal Sign In'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'জাতীয় পরিচয়পত্র বা কর্মকর্তা সরকারি আইডি দিয়ে প্রবেশ করুন'
                : 'Sign in with your National ID or Government Service Identifier'}
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('citizen');
                handleQuickFill('citizen');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition ${
                activeTab === 'citizen'
                  ? 'bg-white text-emerald-800 shadow-xs'
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
              className={`flex-1 py-2 text-center rounded-lg transition ${
                activeTab === 'officer'
                  ? 'bg-white text-emerald-800 shadow-xs'
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

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-800">{isBn ? 'নির্বাচিত ভূমিকা:' : 'Active Role:'}</span>
                <RoleBadge role={selectedRole} />
              </div>
              <p className="text-[10px] text-slate-500">
                {isBn
                  ? 'লগইন করার পর স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট ভূমিকার ড্যাশবোর্ড বা অনুরোধকৃত পেজে নিয়ে যাওয়া হবে।'
                  : 'You will be redirected immediately to the role dashboard or requested page.'}
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-700/25"
            >
              <span>{isBn ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-[11px] text-slate-400 border-t border-slate-100">
            🔒 {isBn ? 'ভূমি মন্ত্রণালয় নিরাপদ সাইন-ইন গেটওয়ে' : 'Ministry of Land Secure Authentication Gateway'}
          </div>
        </div>
      </div>
    </div>
  );
};
