import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { BangladeshMapIcon } from '../components/BangladeshMapIcon';
import { toBanglaDigits } from '../styles/tokens';
import {
  ShieldCheck,
  QrCode,
  MapPin,
  ArrowRight,
  FileCheck2,
  Users,
  Search,
  Lock,
  PhoneCall,
  Scale,
  Layers,
  Building2,
  Leaf,
  Globe2,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Wheat,
  Landmark,
  GitBranch,
  PlusCircle,
  BookOpen,
  Printer,
} from 'lucide-react';

/* ─── Animated counter hook ─────────────────────── */
function useCounter(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

/* ─── Statistics for Bangladesh land system ──────── */
const BD_STATS = [
  { labelEn: 'Land Records Digitised', labelBn: 'ডিজিটাইজড ভূমি রেকর্ড', value: 18500000, suffix: '+', color: 'text-emerald-400' },
  { labelEn: 'Registered Deeds (2025)', labelBn: 'নিবন্ধিত দলিল (২০২৫)', value: 2100000, suffix: '+', color: 'text-green-400' },
  { labelEn: 'Districts Covered', labelBn: 'জেলা সমূহ', value: 64, suffix: '', color: 'text-lime-400' },
  { labelEn: 'Online Services Available', labelBn: 'অনলাইন সেবা', value: 24, suffix: '/7', color: 'text-teal-400' },
];

/* ─── Core Services ───────────────────────────── */
const CORE_SERVICES = [
  {
    icon: FileCheck2,
    titleEn: 'Deed Verification',
    titleBn: 'দলিল ও কিউআর যাচাই',
    descEn: 'Offline-verifiable deeds with dual Ed25519 and ML-DSA-65 post-quantum digital signatures.',
    descBn: 'অফলাইন-ভেরিফিয়েবল কিউআর কোড এবং এড২৫৫১৯ ও এমএল-ডিএসএ-৬৫ ডুয়াল স্বাক্ষরিত দলিল যাচাই।',
    link: '/verify',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: PlusCircle,
    titleEn: 'Double-Sale Prevention',
    titleBn: 'ডাবল-সেল প্রতিরোধ ও রেজিস্ট্রি',
    descEn: 'Server-enforced micro-shotok area accounting with concurrency locking prevents duplicate sales.',
    descBn: 'মাইক্রো-শতক এরিয়া অ্যাকাউন্টিং এবং কনকারেন্সি লকিং এর মাধ্যমে একই জমি বারবার বিক্রি রোধ।',
    link: '/register',
    color: 'bg-green-50 text-green-700 border-green-200',
    iconBg: 'bg-green-100 text-green-700',
  },
  {
    icon: GitBranch,
    titleEn: 'e-Mutation Pipeline',
    titleBn: 'ই-নামজারি ও এসি ল্যান্ড',
    descEn: 'Seamless registry-to-mutation flow with automated hearing dates and atomic khatian creation.',
    descBn: 'সাব-রেজিস্ট্রি থেকে স্বয়ংক্রিয় ই-নামজারি প্রস্তাব, শুনানির নোটিশ এবং খতিয়ান বিভাজন।',
    link: '/mutation',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    iconBg: 'bg-teal-100 text-teal-700',
  },
  {
    icon: Layers,
    titleEn: 'Merkle Transparency Log',
    titleBn: 'মার্কেল অডিট লেজার ও পিভিকিউসি',
    descEn: 'RFC 9162 append-only cryptographic ledger with signed tree heads and interactive red-team lab.',
    descBn: 'আরএফসি ৯১৬২ অ্যাপেন্ড-অনলি অডিট লেজার, সাইনড ট্রি হেড এবং লাইভ রেড-টিম সিকিউরিটি ল্যাব।',
    link: '/ledger',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    iconBg: 'bg-cyan-100 text-cyan-700',
  },
  {
    icon: BookOpen,
    titleEn: 'Cadastral Lineage & Faraiz',
    titleBn: 'খতিয়ান লিনিয়েজ ও ফারায়েজ',
    descEn: 'Trace CS->SA->RS->BS survey evolution and Islamic faraiz inheritance share distribution.',
    descBn: 'সিএস থেকে বিএস জরিপের ধারাবাহিক নকশা লিনিয়েজ এবং ফারায়েজ বণ্টন ক্যালকুলেটর।',
    link: '/lineage',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  {
    icon: MapPin,
    titleEn: 'Cadastral Map',
    titleBn: 'ক্যাডাস্ট্রাল মানচিত্র',
    descEn: 'View exact cadastral plot polygons, boundaries, and land classification on interactive GIS maps.',
    descBn: 'ইন্টারেক্টিভ জিআইএস মানচিত্রে দাগের সীমানা, পরিসীমা ও জমির শ্রেণি দেখুন।',
    link: '/map',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Search,
    titleEn: 'Khatian & Dag Search',
    titleBn: 'খতিয়ান ও দাগ অনুসন্ধান',
    descEn: 'Search land records by Mouza, Dag number, Khatian or owner name across all divisions of Bangladesh.',
    descBn: 'মৌজা, দাগ নম্বর, খতিয়ান বা মালিকের নাম দিয়ে বাংলাদেশের যেকোনো বিভাগের ভূমি রেকর্ড অনুসন্ধান করুন।',
    link: '/search',
    color: 'bg-lime-50 text-lime-700 border-lime-200',
    iconBg: 'bg-lime-100 text-lime-700',
  },
  {
    icon: Printer,
    titleEn: 'Printable Test Kit',
    titleBn: 'প্রিন্ট কিট (বিচারকদের জন্য)',
    descEn: 'Official A4 deeds with authentic QR codes ready for camera scanning and offline verification.',
    descBn: 'বিচারকদের মূল্যায়নের জন্য তৈরি অফিশিয়াল এ৪ দলিল ও কিউআর স্ক্যান টেস্ট কিট।',
    link: '/print-deeds',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-700',
  },
];

/* ─── Land Classification types ──────────────── */
const LAND_TYPES = [
  { code: 'নাল', nameEn: 'Cultivable (Nal)', nameBn: 'কৃষি জমি (নাল)', color: 'bg-emerald-600', pct: 58 },
  { code: 'বাস্তু', nameEn: 'Homestead (Bastu)', nameBn: 'বাস্তুভিটা (বাস্তু)', color: 'bg-green-500', pct: 22 },
  { code: 'বাণিজ্য', nameEn: 'Commercial', nameBn: 'বাণিজ্যিক', color: 'bg-teal-500', pct: 10 },
  { code: 'চর', nameEn: 'Char/Riverine', nameBn: 'চর (নদী মোহনা)', color: 'bg-lime-500', pct: 10 },
];

/* ─── Survey types ───────────────────────────── */
const SURVEY_TYPES = [
  { code: 'CS', nameEn: 'Cadastral Survey (CS)', nameBn: 'সিএস জরিপ', year: '১৮৮৮ – ১৯৪০', descEn: 'Colonial cadastral baseline and historical boundaries', descBn: 'ব্রিটিশ আমলের আদি ভূ-জরিপ ও মূল ক্যাডাস্ট্রাল সীমানা' },
  { code: 'SA', nameEn: 'State Acquisition (SA)', nameBn: 'এসএ জরিপ', year: '১৯৫৬ – ১৯৬২', descEn: 'Post-partition land settlement and zamindari abolition', descBn: 'জমিদারি প্রথা বিলুপ্তির পর রাষ্ট্রীয় অধিগ্রহণ জরিপ' },
  { code: 'RS', nameEn: 'Revisional Survey (RS)', nameBn: 'আরএস জরিপ', year: '১৯৬২ – বর্তমান', descEn: 'Current standard cadastral revisional land record', descBn: 'বর্তমান প্রমিত ডিজিটাল ক্যাডাস্ট্রাল সংশোধিত রেকর্ড' },
  { code: 'BS', nameEn: 'City Survey (BS)', nameBn: 'বিএস জরিপ (সিটি)', year: '১৯৯৮ – বর্তমান', descEn: 'Modern urban municipality cadastral records', descBn: 'আধুনিক পৌরসভা ও মহানগরীর নির্ভুল নগর ভূমি জরিপ' },
];

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { landRecords, verificationEvents } = useStore();
  const isBn = i18n.language === 'bn';
  const [activeType, setActiveType] = useState(0);

  const safeEvents = Array.isArray(verificationEvents) ? verificationEvents : [];
  const safeRecords = Array.isArray(landRecords) ? landRecords : [];

  const verifiedCount = useCounter(safeEvents.filter(e => e && (e.outcome === 'verified' || e.outcome === 'success')).length);
  const recordCount = useCounter(safeRecords.length);

  return (
    <div className="space-y-0 pb-0">

      {/* ══════════════════════════════════════════════════
          HERO SECTION: Bangladesh Land Background
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#071c0f] text-white min-h-[92vh] flex flex-col justify-center">
        {/* Real Bangladesh Land Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transform scale-100 transition-transform duration-1000 brightness-105 contrast-105"
          style={{ backgroundImage: `url('/hero-land.png')` }}
        />

        {/* Dynamic gradient overlays: strong readability on left, high image visibility on center & right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-black/5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04120a]/85 via-transparent to-black/25 pointer-events-none" />

        {/* Radial glow overlays for depth and liveness */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-lime-400/8 blur-[120px] rounded-full pointer-events-none" />

        {/* Subtle golden accent strip at top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="container mx-auto max-w-7xl px-4 relative z-10 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Title + Description */}
            <div className="space-y-8 animate-slide-up">
              {/* Official badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/50 border border-emerald-500/50 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-black/40">
                <BangladeshMapIcon className="w-4 h-4 text-emerald-400 shrink-0" withCircle={false} />
                <span>
                  {isBn
                    ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার • ভূমি মন্ত্রণালয়'
                    : "Government of the People's Republic of Bangladesh • Ministry of Land"}
                </span>
              </div>

              {/* Main headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.3] sm:leading-[1.3] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                  {isBn ? (
                    <>
                      স্মার্ট ভূমি সেবা ও{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-lime-300">
                        ডিজিটাল দলিল যাচাইকরণ
                      </span>
                    </>
                  ) : (
                    <>
                      Smart Land Registry &{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-lime-300">
                        Digital Title Verification
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-lg text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed max-w-xl font-medium">
                  {isBn
                    ? 'খতিয়ান, দাগ, নামজারি ও দলিলের ডিজিটাল অখণ্ডতা নিশ্চিত করুন। ভূমির মালিকানায় আনুন স্বচ্ছতা, নিরাপত্তা ও দ্রুত সেবা।'
                    : 'Verify deed authenticity, inspect khatian records, explore cadastral plots, and ensure transparent land ownership across Bangladesh.'}
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/verify"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-3.5 rounded-2xl transition shadow-lg shadow-emerald-500/30 text-sm"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{isBn ? 'দলিল যাচাই করুন' : 'Verify a Deed'}</span>
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl transition backdrop-blur-sm text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>{isBn ? 'জমির রেকর্ড খুঁজুন' : 'Search Land Records'}</span>
                </Link>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
                  <div className="text-2xl font-extrabold text-emerald-300 font-mono">
                    {toBanglaDigits(recordCount, isBn ? 'bn' : 'en')}
                  </div>
                  <div className="text-xs text-emerald-100/70 mt-0.5">{isBn ? 'নিবন্ধিত দলিল' : 'Registered Deeds'}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
                  <div className="text-2xl font-extrabold text-green-300 font-mono">
                    {toBanglaDigits(verifiedCount, isBn ? 'bn' : 'en')}
                  </div>
                  <div className="text-xs text-green-100/70 mt-0.5">{isBn ? 'সফল ভেরিফিকেশন' : 'Verified Records'}</div>
                </div>
              </div>
            </div>

            {/* Right: Visual Info Card */}
            <div className="hidden lg:block animate-float">
              <div className="relative">
                {/* Main card - Glassmorphic with high transparency so background image is clearly visible */}
                <div className="bg-black/25 border border-white/20 rounded-3xl p-6 shadow-2xl shadow-black/40 backdrop-blur-md space-y-5">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white drop-shadow-sm">{isBn ? 'ক্যাডাস্ট্রাল প্রিভিউ' : 'Cadastral Preview'}</div>
                        <div className="text-[11px] text-emerald-300 drop-shadow-sm">
                          {isBn ? 'আরএস ও বিএস ক্যাডাস্ট্রাল রেকর্ড' : 'RS & BS Survey Records'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                      {isBn ? '● লাইভ' : '● LIVE'}
                    </span>
                  </div>

                  {/* Land Classification Visual */}
                  <div className="space-y-2.5">
                    <div className="text-xs text-emerald-300 font-semibold drop-shadow-sm">{isBn ? 'জমির শ্রেণি বিভাগ' : 'Land Classification'}</div>
                    {LAND_TYPES.map((t) => (
                      <div key={t.code} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-sm ${t.color} shrink-0`} />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-xs text-emerald-100 font-medium drop-shadow-sm">{isBn ? t.nameBn : t.nameEn}</span>
                          <span className="text-xs text-emerald-300 font-mono font-bold">{t.pct}%</span>
                        </div>
                        <div className="w-20 h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sample records */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <div className="text-xs text-emerald-300 font-semibold drop-shadow-sm">{isBn ? 'সাম্প্রতিক নিবন্ধন' : 'Recent Registrations'}</div>
                    {[
                      { dag: 'DAG-2026-001', mouza: isBn ? 'হেমায়েতপুর, সাভার' : 'Hemayetpur, Savar', area: '১৫ শতক', status: 'active' },
                      { dag: 'DAG-2026-003', mouza: isBn ? 'কোতোয়ালি, চট্টগ্রাম' : 'Kotwali, Chittagong', area: '৮.৫ শতক', status: 'active' },
                    ].map((r) => (
                      <div key={r.dag} className="flex items-center justify-between p-3 rounded-xl bg-black/25 border border-white/10 backdrop-blur-sm">
                        <div>
                          <div className="text-xs font-bold text-white font-mono drop-shadow-sm">{r.dag}</div>
                          <div className="text-[10px] text-emerald-200">{r.mouza} • {r.area}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                          {isBn ? 'সক্রিয়' : 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Security badge: SHA-256 + PQC (Post-Quantum Cryptography) */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold text-emerald-200">
                          {isBn ? 'SHA-256 ও পোস্ট-কোয়ান্টাম ক্রিপ্টোগ্রাফি (PQC) সক্রিয়' : 'SHA-256 & Post-Quantum Cryptography (PQC) Active'}
                        </div>
                        <div className="text-[10px] text-emerald-300/80 font-mono">
                          {isBn ? 'ML-DSA-65 কোয়ান্টাম-প্রতিরোধী ডিজিটাল স্বাক্ষর' : 'ML-DSA-65 Quantum-Resistant Digital Signatures'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider shrink-0">
                      PQC Ready
                    </span>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white rounded-2xl px-4 py-2.5 shadow-lg shadow-emerald-500/40 text-xs font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{isBn ? '৬৪টি জেলা' : '64 Districts'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrolling national stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {BD_STATS.map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center backdrop-blur-sm">
                <div className={`text-2xl font-extrabold font-mono ${stat.color}`}>
                  {isBn
                    ? (stat.value >= 1000000
                        ? `${toBanglaDigits((stat.value / 1000000).toFixed(1), 'bn')}M${stat.suffix}`
                        : `${toBanglaDigits(stat.value, 'bn')}${stat.suffix}`)
                    : (stat.value >= 1000000
                        ? `${(stat.value / 1000000).toFixed(1)}M${stat.suffix}`
                        : `${stat.value}${stat.suffix}`)}
                </div>
                <div className="text-xs text-white/60 mt-1">{isBn ? stat.labelBn : stat.labelEn}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CORE SERVICES GRID
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#f0fdf4] py-20 px-4">
        <div className="container mx-auto max-w-6xl space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
              <Leaf className="w-3.5 h-3.5" />
              <span>{isBn ? 'নাগরিক ভূমি সেবাসমূহ' : 'Citizen Land Services'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {isBn ? 'ডিজিটাল ভূমি সেবার সকল দরজা' : 'All Your Land Services, Digitised'}
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              {isBn
                ? 'ঐতিহ্যবাহী ভূমি পরিভাষা (খতিয়ান, দাগ, মৌজা) এবং আধুনিক ক্রিপ্টোগ্রাফির সমন্বয়ে তৈরি নাগরিকবান্ধব ডিজিটাল ব্যবস্থা।'
                : 'Built on authentic Bangladesh land record standards combined with modern cryptographic verification and GIS cadastral intelligence.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_SERVICES.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <Link
                  key={i}
                  to={svc.link}
                  className={`group block bg-white p-6 rounded-3xl border ${svc.color} hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 space-y-4`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${svc.iconBg} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1.5">{isBn ? svc.titleBn : svc.titleEn}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{isBn ? svc.descBn : svc.descEn}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold group-hover:gap-2 transition-all">
                    <span>{isBn ? 'সেবা গ্রহণ করুন' : 'Access Service'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          LAND TYPES & SURVEY CLASSES INFORMATION
      ══════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-emerald-950 to-[#0d3b1e] py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 land-map-bg opacity-30 pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10 space-y-14">
          {/* Survey Types */}
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 text-xs font-bold">
                <Globe2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'জরিপ শ্রেণিবিভাগ' : 'Land Survey Classifications'}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                {isBn ? 'বাংলাদেশে প্রচলিত জরিপের ধরন' : 'Survey Types in Bangladesh'}
              </h2>
              <p className="text-sm text-emerald-200/70 max-w-xl mx-auto">
                {isBn
                  ? 'সিএস থেকে বিএস পর্যন্ত বাংলাদেশের ভূমি রেকর্ডের ইতিহাস ও বর্তমান ক্যাডাস্ট্রাল পদ্ধতি।'
                  : 'A complete reference to Bangladesh land cadastre survey systems from colonial CS to modern BS city surveys.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SURVEY_TYPES.map((survey) => (
                <div
                  key={survey.code}
                  className="bg-emerald-950/60 border border-emerald-700/40 rounded-2xl p-6 hover:border-emerald-500/60 hover:bg-emerald-900/40 transition-all space-y-3 backdrop-blur-sm"
                >
                  <div className="text-3xl font-extrabold text-emerald-300 font-mono">{survey.code}</div>
                  <div>
                    <div className="text-sm font-bold text-white">{isBn ? survey.nameBn : survey.nameEn}</div>
                    <div className="text-xs text-emerald-400 font-mono mt-0.5">{survey.year}</div>
                  </div>
                  <p className="text-xs text-emerald-200/60 leading-relaxed">
                    {isBn ? survey.descBn : survey.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Land Classification interactive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 text-xs font-bold">
                  <Wheat className="w-3.5 h-3.5" />
                  <span>{isBn ? 'জমির শ্রেণি' : 'Land Classification'}</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  {isBn ? 'বাংলাদেশে জমির প্রধান শ্রেণিসমূহ' : 'Major Land Categories in Bangladesh'}
                </h3>
                <p className="text-sm text-emerald-200/70 leading-relaxed">
                  {isBn
                    ? 'ভূমি রেকর্ডে প্রতিটি দাগের জমির ধরন নির্ধারণ করা হয়। কৃষিজমি (নাল), বাস্তুভিটা, বাণিজ্যিক জমি ও চরভূমি প্রধান শ্রেণি।'
                    : 'Every plot in Bangladesh is classified by land use type. Agricultural (Nal), homestead (Bastu), commercial, and riverine char land are the main categories.'}
                </p>
              </div>

              <div className="space-y-3">
                {LAND_TYPES.map((type, i) => (
                  <button
                    key={type.code}
                    onClick={() => setActiveType(i)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      activeType === i
                        ? 'border-emerald-400/60 bg-emerald-900/50'
                        : 'border-emerald-800/40 bg-emerald-950/40 hover:bg-emerald-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-sm ${type.color}`} />
                      <div>
                        <div className="text-sm font-bold text-white">{isBn ? type.nameBn : type.nameEn}</div>
                        <div className="text-xs text-emerald-400 font-mono">{type.code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-emerald-300 font-mono">{type.pct}%</div>
                      <div className="text-[10px] text-emerald-500">{isBn ? 'মোট ভূমির' : 'of total land'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual area chart */}
            <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-3xl p-8 backdrop-blur-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="text-5xl font-extrabold text-emerald-300 font-mono">
                  {LAND_TYPES[activeType].pct}%
                </div>
                <div className="text-lg font-bold text-white">{isBn ? LAND_TYPES[activeType].nameBn : LAND_TYPES[activeType].nameEn}</div>
                <div className="text-sm text-emerald-400">
                  {isBn ? 'বাংলাদেশের মোট ভূমির' : 'of Bangladesh total land area'}
                </div>
              </div>

              {/* Proportional visual */}
              <div className="space-y-2">
                {LAND_TYPES.map((type, i) => (
                  <div key={type.code} className="flex items-center gap-3">
                    <div className="text-[11px] text-emerald-400 w-16 text-right font-mono">{type.code}</div>
                    <div className="flex-1 h-5 bg-emerald-900/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${type.color} transition-all duration-500 ${activeType === i ? 'opacity-100' : 'opacity-40'}`}
                        style={{ width: `${type.pct}%` }}
                      />
                    </div>
                    <div className="text-xs text-emerald-300 font-mono w-8">{type.pct}%</div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-emerald-500 text-center border-t border-emerald-800/40 pt-4">
                {isBn
                  ? 'তথ্যসূত্র: ভূমি মন্ত্রণালয় বাংলাদেশ (জাতীয় ভূমি জরিপ প্রতিবেদন ২০২৫)'
                  : 'Source: Ministry of Land Bangladesh (National Land Survey Report 2025)'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,20 C480,60 960,0 1440,40 L1440,60 L0,60 Z" fill="#f0fdf4" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS: VERIFICATION PROCESS
      ══════════════════════════════════════════════════ */}
      <section className="bg-[#f0fdf4] py-20 px-4">
        <div className="container mx-auto max-w-6xl space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isBn ? 'যাচাইকরণ প্রক্রিয়া' : 'Verification Process'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {isBn ? 'মাত্র ৩টি ধাপে দলিল যাচাই' : '3 Steps to Verify Any Deed'}
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              {isBn
                ? '৩টি সহজ ধাপে সম্পূর্ণ স্বচ্ছ ও নির্ভরযোগ্য নাগরিক দলিল যাচাই'
                : '3 seamless steps to mathematically confirm document integrity and legal title consistency'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-emerald-200 via-green-300 to-emerald-200" />

            {[
              {
                num: '০১',
                icon: QrCode,
                titleEn: 'Enter or Scan',
                titleBn: 'দলিল নম্বর বা QR স্ক্যান',
                descEn: 'Enter the deed number (e.g. LP-2026-001) or scan the QR code printed on the official document.',
                descBn: 'দলিল নম্বর (যেমন: LP-2026-001) লিখুন অথবা সরকারি দলিলে থাকা QR কোডটি স্ক্যান করুন।',
                color: 'bg-emerald-600',
              },
              {
                num: '০২',
                icon: Lock,
                titleEn: 'SHA-256 & PQC Verification',
                titleBn: 'SHA-256 ও পোস্ট-কোয়ান্টাম (PQC) যাচাই',
                descEn: 'The system computes SHA-256 hash integrity and validates ML-DSA-65 post-quantum cryptographic signatures against the official registry.',
                descBn: 'ব্রাউজারে SHA-256 হ্যাশ এবং সার্ভারে ML-DSA-65 পোস্ট-কোয়ান্টাম ডিজিটাল স্বাক্ষর সরকারি মূল রেকর্ডের সাথে স্বয়ংক্রিয়ভাবে মিলিয়ে দেখা হয়।',
                color: 'bg-green-600',
              },
              {
                num: '০৩',
                icon: CheckCircle2,
                titleEn: 'Cadastral Certification',
                titleBn: 'ক্যাডাস্ট্রাল প্রত্যয়ন',
                descEn: 'Receive an instant digital verification certificate with plot ownership, boundary, and legal status.',
                descBn: 'দাগের মালিকানা, সীমানা ও আইনি স্থিতি সহ ডিজিটাল যাচাই সনদ তাৎক্ষণিকভাবে পান।',
                color: 'bg-teal-600',
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all space-y-4 relative">
                  <div className={`w-12 h-12 rounded-2xl ${step.color} text-white font-extrabold flex items-center justify-center text-sm font-mono shadow-md`}>
                    {step.num}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">{isBn ? step.titleBn : step.titleEn}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{isBn ? step.descBn : step.descEn}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-2xl transition shadow-lg shadow-emerald-600/30 text-sm"
            >
              <span>{isBn ? 'এখনই দলিল যাচাই শুরু করুন' : 'Start Deed Verification Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          KEY FACTS ABOUT BD LAND
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 px-4 border-y border-emerald-100">
        <div className="container mx-auto max-w-6xl space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isBn ? 'বাংলাদেশ ভূমি তথ্য' : 'Bangladesh Land Facts'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              {isBn ? 'কেন ভূমি নিরাপত্তা গুরুত্বপূর্ণ?' : 'Why Land Security Matters'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Wheat,
                iconBg: 'bg-emerald-100 text-emerald-700',
                statEn: '56%',
                statBn: '৫৬%',
                labelEn: 'of Bangladesh is agricultural land',
                labelBn: 'বাংলাদেশের মোট ভূমি কৃষিক্ষেত্র',
                descEn: 'Bangladesh is one of the most agriculturally dense nations on earth, making accurate land records critical.',
                descBn: 'বাংলাদেশ পৃথিবীর অন্যতম কৃষিঘন দেশ। সঠিক ভূমি রেকর্ড কৃষি খাতের জন্য অপরিহার্য।',
              },
              {
                icon: AlertTriangle,
                iconBg: 'bg-amber-100 text-amber-700',
                statEn: '70%',
                statBn: '৭০%',
                labelEn: 'of civil court cases involve land disputes',
                labelBn: 'দেওয়ানি মামলার সাথে ভূমি বিরোধ জড়িত',
                descEn: 'Land fraud and disputed title chains lead to millions of pending legal cases. Digital verification helps prevent this.',
                descBn: 'জমি জালিয়াতি ও বিতর্কিত মালিকানা লক্ষ লক্ষ মামলার কারণ। ডিজিটাল যাচাই এটি রোধ করে।',
              },
              {
                icon: Building2,
                iconBg: 'bg-teal-100 text-teal-700',
                statEn: '64',
                statBn: '৬৪',
                labelEn: 'districts under unified digital cadastre',
                labelBn: 'জেলা ডিজিটাল ক্যাডাস্ট্রের অধীনে',
                descEn: 'All 64 districts are integrated into the national digital land registry for unified, transparent governance.',
                descBn: 'সকল ৬৪টি জেলা জাতীয় ডিজিটাল ভূমি রেকর্ডে একত্রিত, স্বচ্ছ শাসনের জন্য।',
              },
            ].map((fact, i) => {
              const Icon = fact.icon;
              return (
                <div key={i} className="space-y-4 text-center">
                  <div className={`w-14 h-14 rounded-2xl ${fact.iconBg} flex items-center justify-center mx-auto`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-5xl font-extrabold text-slate-900">{isBn ? fact.statBn : fact.statEn}</div>
                    <div className="text-sm font-semibold text-slate-700 mt-1">{isBn ? fact.labelBn : fact.labelEn}</div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">{isBn ? fact.descBn : fact.descEn}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════
          HOTLINE RIBBON
      ══════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-emerald-900 via-green-900 to-emerald-900 py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 land-map-bg opacity-20 pointer-events-none" />
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
              <PhoneCall className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white">
                {isBn ? 'ভূমি সেবা হটলাইন: ১৬১২২' : 'Land Service Hotline: 16122'}
              </h3>
              <p className="text-emerald-200/80 text-sm mt-0.5">
                {isBn
                  ? 'ভূমি মন্ত্রণালয়ের ২৪/৭ কল সেন্টার ও অনলাইন সাপোর্ট'
                  : '24/7 Ministry of Land Call Centre & Online Citizen Grievance Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/verify"
              className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold px-7 py-3.5 rounded-2xl transition text-sm shadow-lg shrink-0"
            >
              {isBn ? 'দলিল যাচাই করুন' : 'Verify a Deed'}
            </Link>
            <Link
              to="/search"
              className="border border-emerald-400/40 hover:bg-emerald-800/40 text-emerald-200 font-semibold px-7 py-3.5 rounded-2xl transition text-sm shrink-0"
            >
              {isBn ? 'রেকর্ড অনুসন্ধান' : 'Search Records'}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
