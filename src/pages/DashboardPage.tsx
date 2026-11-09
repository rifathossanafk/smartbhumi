import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore, hasPermission, OFFICIAL_DEMO_USERS } from '../store/useStore';
import { RoleBadge } from '../components/RoleBadge';
import { formatTimestamp, truncateHash } from '../utils/crypto';
import {
  FileCheck2,
  AlertTriangle,
  FileQuestion,
  RotateCcw,
  PlusCircle,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Database,
  Lock,
  Unlock,
  CreditCard,
  Building,
  User,
  Scale,
  Sparkles,
  Layers,
  FileText,
  DollarSign,
  Download,
  Eye,
  Activity,
  Check,
} from 'lucide-react';
import type { UserRole, LandRecord } from '../types';

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    currentUser,
    login,
    landRecords,
    getMetrics,
    verificationEvents,
    fraudAlerts,
    dismissFraudAlert,
    freezeRecord,
    unfreezeRecord,
    resetDemoData,
  } = useStore();

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [freezeModalRecord, setFreezeModalRecord] = useState<LandRecord | null>(null);
  const [freezeReason, setFreezeReason] = useState('জালিয়াতি ও মালিকানা বিরোধের কারণে জরুরি প্রশাসনিক স্থগিতাদেশ');
  const [taxPaidSuccess, setTaxPaidSuccess] = useState(false);

  const metrics = getMetrics();
  const isBn = i18n.language === 'bn';
  const role = currentUser?.role || 'citizen';

  const handleReset = () => {
    resetDemoData();
    setResetConfirmOpen(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  const handleExecuteFreeze = () => {
    if (freezeModalRecord) {
      freezeRecord(freezeModalRecord.id, freezeReason);
      setFreezeModalRecord(null);
    }
  };

  const recentEvents = verificationEvents.slice(0, 8);

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'verified':
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>{isBn ? 'সফল / অনুমোদিত' : 'Verified'}</span>
          </span>
        );
      case 'mismatch':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>{isBn ? 'অসঙ্গতি চিহ্নিত' : 'Mismatch'}</span>
          </span>
        );
      case 'flagged':
      case 'reviewRequired':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            <AlertOctagon className="w-3 h-3 text-amber-600" />
            <span>{isBn ? 'স্থগিত / শুনানি প্রয়োজন' : 'Under Review'}</span>
          </span>
        );
      case 'notFound':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <FileQuestion className="w-3 h-3" />
            <span>{isBn ? 'রেকর্ড মেলেনি' : 'Not Found'}</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-slate-600 px-2 py-0.5 bg-slate-100 rounded">
            {outcome}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* 1. Prominent User Profile & Role Identity Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-800 to-green-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-800/20 shrink-0">
              {currentUser?.nameBn ? currentUser.nameBn.charAt(0) : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
                  {isBn ? currentUser?.nameBn || 'নাগরিক' : currentUser?.nameEn || 'Citizen'}
                </h1>
                {currentUser && <RoleBadge role={currentUser.role} size="md" />}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-emerald-800 flex flex-wrap items-center gap-2">
                <span>{isBn ? currentUser?.designationBn : currentUser?.designationEn}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-mono text-xs">
                  ID: {currentUser?.nidOrGovId || '19852694123456789'}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                <span>📍 {isBn ? currentUser?.jurisdictionBn : currentUser?.jurisdictionEn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Capability Scope Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-bold text-slate-900">{isBn ? 'বর্তমান অনুমতি ও ক্ষমতা:' : 'Current Scope:'}</span>
            {role === 'citizen' && (
              <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200">
                {isBn
                  ? '✓ নিজের জমি ও পর্চা পরিদর্শন • ✓ অনলাইন খাজনা পরিশোধ • ✓ দলিল সত্যতা যাচাই'
                  : '✓ View own holdings • ✓ Pay LD Tax online • ✓ Verify deed authenticity'}
              </span>
            )}
            {role === 'officer' && (
              <span className="bg-green-50 text-green-800 px-3 py-1 rounded-xl border border-green-200">
                {isBn
                  ? '✓ দলিল নিবন্ধন সম্পাদন • ✓ রাজস্ব ও ই-স্ট্যাম্প যাচাই • ✓ ডিজিটাল ক্রিপ্টোগ্রাফিক সিলমোহর'
                  : '✓ Register new deeds • ✓ Verify stamp duty • ✓ Issue cryptographic deed seal'}
              </span>
            )}
            {role === 'reviewer' && (
              <span className="bg-amber-50 text-amber-900 px-3 py-1 rounded-xl border border-amber-300">
                {isBn
                  ? '✓ নামজারি (ই-মিউটেশন) শুনানি ডকেট • ✓ খতিয়ান সংশোধন • ✓ বিরোধ নিষ্পত্তি আদেশ'
                  : '✓ Mutation hearing docket • ✓ Title dispute adjudication • ✓ Khatian order issuance'}
              </span>
            )}
            {role === 'admin' && (
              <span className="bg-slate-900 text-amber-300 px-3 py-1 rounded-xl border border-amber-400/40 font-semibold shadow-xs">
                {isBn
                  ? '⭐ জাতীয় জমি হস্তান্তর জরুরি লক • ⭐ এআই জালিয়াতি ও নদী দখল রাডার • ⭐ লেজার অখণ্ডতা'
                  : '⭐ Emergency land transfer freeze • ⭐ AI fraud & encroachment scanner • ⭐ Ledger audit'}
              </span>
            )}
          </div>

          {hasPermission(currentUser?.role, 'resetDemo') && (
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              title="Reset Database"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBn ? 'ডাটাবেস রিফ্রেশ' : 'Refresh Database'}</span>
            </button>
          )}
        </div>
      </div>

      {resetSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-between animate-fade-in">
          <span className="font-semibold">
            {isBn ? 'সিস্টেম ডাটাবেস সফলভাবে স্ট্যান্ডার্ড অবস্থায় পুনঃস্থাপিত হয়েছে!' : 'Database refreshed successfully!'}
          </span>
        </div>
      )}

      {taxPaidSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-between animate-fade-in">
          <span className="font-semibold">
            {isBn ? '✓ আপনার ভূমি উন্নয়ন কর (খাজনা) সফলভাবে পরিশোধ হয়েছে এবং দাখিলা প্রস্তুত!' : '✓ Land tax paid successfully! Receipt generated.'}
          </span>
        </div>
      )}

      {/* 2. Key National Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>{isBn ? 'মোট স্মার্ট দলিল' : 'Total Deeds'}</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{metrics.totalRecords}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-emerald-100 bg-emerald-50/30 shadow-sm space-y-1">
          <div className="text-xs text-emerald-800 flex items-center gap-1">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isBn ? 'সফল ভেরিফিকেশন' : 'Verified'}</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 font-mono">{metrics.verifiedDocs}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-red-100 bg-red-50/20 shadow-sm space-y-1">
          <div className="text-xs text-red-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>{isBn ? 'অসঙ্গতি চিহ্নিত' : 'Mismatches'}</span>
          </div>
          <div className="text-2xl font-extrabold text-red-700 font-mono">{metrics.mismatches}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-amber-100 bg-amber-50/20 shadow-sm space-y-1">
          <div className="text-xs text-amber-800 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
            <span>{isBn ? 'শুনানি ও স্থগিত' : 'Review Cases'}</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">{metrics.reviewCases}</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-900 bg-slate-900 text-white shadow-sm space-y-1">
          <div className="text-xs text-amber-300 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'জরুরি লক রেকর্ড' : 'Frozen Parcels'}</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {landRecords.filter((r) => r.isFrozen).length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{isBn ? 'মোট কার্যক্রম ইভেন্ট' : 'Total Logs'}</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{metrics.totalEvents}</div>
        </div>
      </div>

      {/* 3. DEDICATED ROLE WORKSPACES */}

      {/* CITIZEN WORKSPACE */}
      {role === 'citizen' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-700" />
              <span>{isBn ? 'নাগরিক সেবা ও আমার জমির তথ্য' : 'Citizen Land Holdings & Services'}</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {isBn ? 'এনআইডি লিংকড রেকর্ড' : 'NID Linked Holdings'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Holdings Card */}
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isBn ? 'আমার রেকর্ডকৃত ভূমি প্লট (দাগ নং DAG-2026-001)' : 'My Recorded Plot (DAG-2026-001)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'হেমায়েতপুর মৌজা (জে.এল ১০১), সাভার, ঢাকা' : 'Hemayetpur Mouza (JL 101), Savar, Dhaka'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {isBn ? 'খতিয়ান হালনাগাদ' : 'Title Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-400 block text-[10px]">{isBn ? 'খতিয়ান নম্বর' : 'Khatian No'}</span>
                  <span className="font-bold text-slate-800 font-mono">RS-KH-2026-0001</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-400 block text-[10px]">{isBn ? 'জমির পরিমাণ' : 'Land Area'}</span>
                  <span className="font-bold text-slate-800">১৫ শতক (Decimal)</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-400 block text-[10px]">{isBn ? 'জমির শ্রেণি' : 'Classification'}</span>
                  <span className="font-bold text-slate-800">{isBn ? 'বাস্তু / আবাসিক' : 'Residential'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <span className="text-slate-400 block text-[10px]">{isBn ? 'ভূমি কর (LD Tax)' : 'Tax Status'}</span>
                  <span className="font-bold text-emerald-700">{isBn ? 'পরিশোধিত ✓' : 'Paid ✓'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/map?record=rec-001"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isBn ? 'মানচিত্রে দাগ দেখুন' : 'View Plot on Map'}</span>
                </Link>

                <Link
                  to="/verify/LP-2026-001"
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isBn ? 'দলিল অখণ্ডতা যাচাই' : 'Verify Deed Hash'}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => alert(isBn ? 'ডিজিটাল খতিয়ান (পর্চা) সফলভাবে প্রস্তুত হয়েছে!' : 'Digital Porcha Certificate Generated!')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ডিজিটাল পর্চা ডাউনলোড' : 'Download Porcha'}</span>
                </button>
              </div>
            </div>

            {/* LD Tax Online Payment Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isBn ? 'অনলাইন ভূমি উন্নয়ন কর' : 'Online Land Tax (LD Tax)'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'চলতি ১৪৩২ বঙ্গাব্দের ভূমি উন্নয়ন কর অনলাইনে প্রদান করুন।'
                    : 'Pay current annual land development tax online.'}
                </p>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{isBn ? 'কর পরিমাণ:' : 'Tax Due:'}</span>
                    <span className="font-bold text-slate-900 font-mono">৪৫০.০০ ৳</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{isBn ? 'সর্বশেষ দাখিলা:' : 'Last Dakhila:'}</span>
                    <span className="font-semibold text-emerald-800 font-mono">LD-2025-901</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTaxPaidSuccess(true);
                  setTimeout(() => setTaxPaidSuccess(false), 4000);
                }}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>{isBn ? 'অনলাইনে কর পরিশোধ করুন' : 'Pay Online Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-REGISTRAR WORKSPACE */}
      {role === 'officer' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-700" />
              <span>{isBn ? 'সাব-রেজিস্ট্রি কার্যালয় কার্যক্রম ডকেট' : 'Sub-Registry Official Docket'}</span>
            </h2>
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? 'নতুন দলিল নিবন্ধন সম্পাদন' : 'Register New Deed'}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isBn ? 'আজকের নিবন্ধন অপেক্ষমাণ' : 'Pending Registrations'}
              </span>
              <div className="text-3xl font-extrabold text-emerald-800 font-mono">৩টি দলিল</div>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'বায়োমেট্রিক ও ই-স্ট্যাম্প যাচাই শেষে ডিজিটাল সিলমোহরের জন্য অপেক্ষমাণ।'
                  : 'Awaiting digital signing and cryptographic seal generation.'}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isBn ? 'স্ট্যাম্প ডিউটি ও সরকারি রাজস্ব' : 'Stamp Duty Revenue'}
              </span>
              <div className="text-3xl font-extrabold text-emerald-800 font-mono">৪,৮২,৫০০ ৳</div>
              <p className="text-xs text-slate-500">
                {isBn ? 'ই-চালানের মাধ্যমে সরকারি কোষাগারে জমাকৃত রাজস্ব।' : 'Treasury deposited stamp duty.'}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isBn ? 'ডিজিটাল সিলমোহর স্থিতি' : 'Cryptographic Signing'}
              </span>
              <div className="text-3xl font-extrabold text-teal-700 font-mono">100% Active</div>
              <p className="text-xs text-slate-500">
                {isBn ? 'ওয়েব ক্রিপ্টো SHA-256 সার্ভিস সক্রিয় রয়েছে।' : 'Browser Web Crypto API active.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AC LAND WORKSPACE */}
      {role === 'reviewer' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              <span>{isBn ? 'উপজেলা রাজস্ব আদালত ও নামজারি শুনানি' : 'AC Land Revenue Court & Mutation Queue'}</span>
            </h2>
            <Link
              to="/flagged"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>{isBn ? 'শুনানি ডকেটে প্রবেশ করুন' : 'Open Review Hearing Docket'}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-amber-200 bg-amber-50/20 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {isBn ? 'মালিকানা অসঙ্গতি কেস (LP-2026-002)' : 'Ownership Mismatch (LP-2026-002)'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {isBn ? 'শুনানি অপেক্ষমাণ' : 'Hearing Scheduled'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {isBn
                  ? 'তেতুলঝোরা মৌজার দাগ নং DAG-2026-002 এ দলিলের বিক্রেতার সাথে রেকর্ডের মালিকের অমিল চিহ্নিত হয়েছে। সহকারী কমিশনার (ভূমি) কর্তৃক যাচাই প্রয়োজন।'
                  : 'Deed seller differs from cadastral plot registered owner in Tetuljhora. Requires AC Land order.'}
              </p>
              <div className="pt-2">
                <Link
                  to="/flagged"
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                >
                  <span>{isBn ? 'শুনানি গ্রহণ ও আদেশ জারি করুন' : 'Adjudicate & Issue Order'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {isBn ? 'অনুপস্থিত মালিকানা রেফারেন্স (LP-2026-005)' : 'Missing Title Reference (LP-2026-005)'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {isBn ? 'তদন্তাধীন' : 'Under Investigation'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {isBn
                  ? 'খালিশপুর মৌজার দাগ নং DAG-2026-005 এর জন্য কোনো পূর্ববর্তী খতিয়ান ডাটাবেসে পাওয়া যায়নি। মাঠ জরিপ টিম প্রেরণের নির্দেশ অপেক্ষমাণ।'
                  : 'Plot DAG-2026-005 has no historical khatian entry in cadastre. Field survey dispatch pending.'}
              </p>
              <div className="pt-2">
                <Link
                  to="/flagged"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <span>{isBn ? 'মাঠ তদন্ত নথি দেখুন' : 'View Field Inspection File'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN WORKSPACE */}
      {role === 'admin' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>
                {isBn
                  ? 'জাতীয় ভূমি ব্যবস্থাপনা ও ক্রিপ্টোগ্রাফিক সিকিউরিটি কমান্ড সেন্টার'
                  : 'National Land Registry Security & Command Center'}
              </span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {isBn ? 'মহাপরিচালকীয় পূর্ণ কর্তৃত্ব' : 'Executive DG Authority'}
            </span>
          </div>

          {/* Feature 1: AI-Powered Fraud & Encroachment Radar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isBn ? 'এআই জালিয়াতি ও নদী/খাস জমি দখল রাডার' : 'AI-Powered Land Fraud & Encroachment Radar'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn
                      ? 'স্যাটেলাইট জিআইএস ও খতিয়ান ডাটাবেসের সাহায্যে স্বয়ংক্রিয় অসঙ্গতি শনাক্তকরণ'
                      : 'Automated satellite GIS and deed registry anomaly detector across all 64 districts'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold self-start sm:self-auto">
                {fraudAlerts.filter((a) => a.status === 'active').length} {isBn ? 'সক্রিয় সতর্কতা' : 'Active Alerts'}
              </span>
            </div>

            {/* Fraud Alerts List */}
            <div className="space-y-3">
              {fraudAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alert.severity === 'critical'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : alert.severity === 'high'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {alert.severity.toUpperCase()} • {alert.aiConfidence}% AI Confidence
                      </span>
                      <span className="text-xs text-slate-400">{alert.detectedAt}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">
                      {isBn ? alert.titleBn : alert.titleEn}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {isBn ? alert.descriptionBn : alert.descriptionEn}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-0.5">
                      📍 {alert.mouza} • টার্গেট: <span className="font-mono text-slate-800 font-semibold">{alert.targetDeedOrDag}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {alert.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => dismissFraudAlert(alert.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white transition shadow-xs"
                      >
                        {isBn ? 'ব্যবস্থা গ্রহণ / সমাধান' : 'Acknowledge / Resolve'}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        {isBn ? 'সমাধানকৃত' : 'Resolved'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 2: Emergency Land Registry Freeze / Lock System */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  <span>{isBn ? 'জাতীয় জরুরি জমি হস্তান্তর লক (Registry Freeze Tool)' : 'Emergency Land Registry Freeze'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'বিরোধপূর্ণ বা জালিয়াতির শিকার যে কোনো প্লটে তাৎক্ষণিক হস্তান্তর স্থগিতাদেশ প্রয়োগ করুন।'
                    : 'Instantly lock any disputed or compromised plot nationwide to block unauthorized transactions.'}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">দলিল নম্বর</th>
                    <th className="py-2.5 px-3">মৌজা ও দাগ</th>
                    <th className="py-2.5 px-3">বর্তমান স্থিতি</th>
                    <th className="py-2.5 px-3">লক সংক্রান্ত তথ্য</th>
                    <th className="py-2.5 px-3 text-right">প্রশাসনিক পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {landRecords.slice(0, 5).map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {rec.deedNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{rec.mouza}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{rec.dagNumber}</div>
                      </td>
                      <td className="py-3 px-3">
                        {rec.isFrozen ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 w-max">
                            <Lock className="w-2.5 h-2.5" />
                            {isBn ? 'জরুরি লক কার্যকর' : 'Registry Locked'}
                          </span>
                        ) : rec.status === 'flagged' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 w-max block">
                            {isBn ? 'পতাকাঙ্কিত' : 'Flagged'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 w-max block">
                            {isBn ? 'সক্রিয়' : 'Active'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {rec.isFrozen ? (
                          <span className="text-red-700 font-medium">{rec.freezeReason}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {rec.isFrozen ? (
                          <button
                            type="button"
                            onClick={() => unfreezeRecord(rec.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition inline-flex items-center gap-1 shadow-xs"
                          >
                            <Unlock className="w-3 h-3 text-amber-400" />
                            <span>{isBn ? 'লক প্রত্যাহার' : 'Unlock'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setFreezeModalRecord(rec)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] border border-red-200 transition inline-flex items-center gap-1"
                          >
                            <Lock className="w-3 h-3 text-red-600" />
                            <span>{isBn ? 'জমি লক করুন' : 'Freeze'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Common Quick Actions Toolbar */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          {t('dashboard.quickActions.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/verify"
            className="p-4 bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('dashboard.quickActions.verify')}</h3>
              <p className="text-xs text-slate-500 font-mono">SHA-256 hash check</p>
            </div>
          </Link>

          <Link
            to="/search"
            className="p-4 bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-2xl bg-slate-50 text-slate-700 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('dashboard.quickActions.search')}</h3>
              <p className="text-xs text-slate-500">Khatian, Mouza & Dag</p>
            </div>
          </Link>

          <Link
            to="/map"
            className="p-4 bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-2xl bg-slate-50 text-slate-700 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('dashboard.quickActions.viewMap')}</h3>
              <p className="text-xs text-slate-500">Cadastral plot map</p>
            </div>
          </Link>

          <Link
            to="/history"
            className="p-4 bg-white rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-2xl bg-slate-50 text-slate-700 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('nav.history')}</h3>
              <p className="text-xs text-slate-500">Registry audit trail</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Recent Activity Audit Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{t('dashboard.recentActivity')}</h3>
            <p className="text-xs text-slate-500">
              {isBn ? 'সিস্টেমের সর্বশেষ অডিট লগ ও ভেরিফিকেশন কার্যক্রম' : 'Real-time ledger audit trail'}
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>{isBn ? 'সম্পূর্ণ ইতিহাস' : 'View Full History'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">সময় / Timestamp</th>
                <th className="py-2.5 px-3">দলিল রেফারেন্স</th>
                <th className="py-2.5 px-3">ভূমিকা / Role</th>
                <th className="py-2.5 px-3">ফলাফল / Outcome</th>
                <th className="py-2.5 px-3">কার্যক্রম বিবরণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {formatTimestamp(evt.timestamp)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {evt.recordRef}
                  </td>
                  <td className="py-3 px-3">
                    <RoleBadge role={evt.role} size="sm" />
                  </td>
                  <td className="py-3 px-3">{getOutcomeBadge(evt.outcome)}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-sm truncate">
                    {evt.details || 'Verifying integrity'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Freeze Confirmation Modal */}
      {freezeModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {isBn ? 'জাতীয় জরুরি জমি হস্তান্তর লক' : 'Emergency Registry Freeze'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? `দলিল নং ${freezeModalRecord.deedNumber} (দাগ: ${freezeModalRecord.dagNumber}) এর হস্তান্তর জাতীয় রেজিস্ট্রি থেকে সাময়িক লক করা হবে।`
                  : `Temporarily lock transactions on deed ${freezeModalRecord.deedNumber}.`}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-left">
              <label className="font-bold text-slate-700">স্থগিতাদেশের কারণ (Reason):</label>
              <textarea
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFreezeModalRecord(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExecuteFreeze}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
              >
                {isBn ? 'লক নিশ্চিত করুন' : 'Confirm Freeze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Reset Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {isBn ? 'ডাটাবেস রিফ্রেশ নিশ্চিতকরণ' : 'Confirm Database Refresh'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'সকল রেকর্ড স্ট্যান্ডার্ড প্রারম্ভিক অবস্থায় ফিরে যাবে। আপনি কি নিশ্চিত?'
                  : 'All records will return to the default standard state. Are you sure?'}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
              >
                {isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
