import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  FileText,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  FileCheck2,
  Building,
  MapPin,
  User,
  Shield,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDeedQROrCached } from '../api/client';
import { toBanglaDigits } from '../styles/tokens';
import { useStore } from '../store/useStore';

interface DeedCustomData {
  deedNumber: string;
  mouza: string;
  jlNumber: string;
  khatianNumber: string;
  dagNumber: string;
  transferAreaShotok: string;
  landClass: string;
  sellerName: string;
  sellerFather: string;
  sellerNid: string;
  sellerAddress: string;
  buyerName: string;
  buyerFather: string;
  buyerNid: string;
  buyerAddress: string;
  priceAmount: string;
  priceWords: string;
  boundaryNorth: string;
  boundarySouth: string;
  boundaryEast: string;
  boundaryWest: string;
  witness1: string;
  witness2: string;
}

export const PrintDeedsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const { landRecords } = useStore();

  const [qrString, setQrString] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [printMode, setPrintMode] = useState<'both' | 'page1' | 'page2'>('both');
  const [customizerOpen, setCustomizerOpen] = useState<boolean>(false);

  // Editable Deed Data
  const [deedData, setDeedData] = useState<DeedCustomData>({
    deedNumber: 'LP-2026-001',
    mouza: 'তেজগাঁও (TEJ-102)',
    jlNumber: '১০২',
    khatianNumber: 'KHT-2026-001 (RS)',
    dagNumber: 'DAG-2026-001 (RS)',
    transferAreaShotok: '15.00',
    landClass: 'আবাসিক ও ভিটা জমি (বাস্তু)',
    sellerName: 'মো: আব্দুল করিম',
    sellerFather: 'মৃত হাজী কাসেম আলী',
    sellerNid: '9990001234567',
    sellerAddress: 'গ্রাম: তেজগাঁও, থানা: তেজগাঁও, জেলা: ঢাকা',
    buyerName: 'মো: রহিম উদ্দিন',
    buyerFather: 'জনাব রফিকুল ইসলাম',
    buyerNid: '9990007654321',
    buyerAddress: 'গ্রাম: গুলশান, থানা: গুলশান, জেলা: ঢাকা',
    priceAmount: '২৫,০০,০০০/- (পঁচিশ লক্ষ টাকা)',
    priceWords: 'পঁচিশ লক্ষ টাকা মাত্র',
    boundaryNorth: 'জনাব আক্কাস আলীর বাড়ি',
    boundarySouth: 'সরকারি ১২ ফুট পাকা রাস্তা',
    boundaryEast: 'দাগ নং ০২ এর জমি',
    boundaryWest: 'মাস্টার করিম সাহেবের সীমানা প্রাচীর',
    witness1: 'জনাব মোখলেছুর রহমান (NID: 1982761524312)',
    witness2: 'অ্যাডভোকেট সাজ্জাদ হোসেন (NID: 1990281625341)',
  });

  // Fallback synthetic QR string if offline and not cached yet
  const fallbackQR = JSON.stringify({
    v: 1,
    alg: 'ed25519',
    ep: 1,
    idx: 0,
    claims: {
      deedNumber: deedData.deedNumber,
      khatianNumber: 'KHT-2026-001',
      dagNumber: 'DAG-2026-001',
      mouzaCode: 'TEJ-102',
      transferMicroShotok: 15000000,
      sellerNidMasked: '999000****567',
      buyerNidMasked: '999000****321',
      deedType: 'saf-kabala',
      registrationTimestamp: '2026-11-09T08:00:00.000Z',
    },
    proof: [],
    root: '1111111111111111111111111111111111111111111111111111111111111111',
    ts: '2026-11-09T08:00:00.000Z',
    sig: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  });

  useEffect(() => {
    let mounted = true;
    fetchDeedQROrCached(deedData.deedNumber)
      .then((res) => {
        if (mounted && res?.qrString) {
          setQrString(res.qrString);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setQrString(fallbackQR);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [deedData.deedNumber]);

  const handlePrint = (mode: 'both' | 'page1' | 'page2') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleLoadPreset = (record: any) => {
    setDeedData({
      deedNumber: record.deedNumber,
      mouza: `${record.mouza} (JL ${record.jlNumber})`,
      jlNumber: record.jlNumber,
      khatianNumber: `${record.khatianNumber} (${record.khatianType})`,
      dagNumber: `${record.dagNumber} (${record.khatianType})`,
      transferAreaShotok: String(record.landArea),
      landClass: 'আবাসিক ও কৃষি জমি',
      sellerName: record.sellerRef,
      sellerFather: 'মৃত রমিজ উদ্দিন',
      sellerNid: '9990001234567',
      sellerAddress: `${record.upazila}, ${record.district}`,
      buyerName: record.buyerRef,
      buyerFather: 'জনাব রফিকুল ইসলাম',
      buyerNid: '9990007654321',
      buyerAddress: `${record.upazila}, ${record.district}`,
      priceAmount: `${toBanglaDigits((record.landArea * 150000).toLocaleString(), isBn ? 'bn' : 'en')}/- টাকা`,
      priceWords: 'ধার্যকৃত মৌজা রেট অনুযায়ী পরিশোধিত',
      boundaryNorth: 'জনাব আক্কাস আলীর সীমানা',
      boundarySouth: 'সরকারি ১২ ফুট পাকা রাস্তা',
      boundaryEast: 'পূর্ব পার্শ্বের ব্যক্তিমালিকানাধীন জমি',
      boundaryWest: 'মাস্টার করিম সাহেবের বাড়ি',
      witness1: 'জনাব মোখলেছুর রহমান (NID: 1982761524312)',
      witness2: 'অ্যাডভোকেট সাজ্জাদ হোসেন (NID: 1990281625341)',
    });
  };

  return (
    <div className="print-deed-container max-w-5xl mx-auto px-4 py-6 print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SCREEN-ONLY CONTROL HEADER & INTERACTIVE DEED CUSTOMIZER              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="print:hidden mb-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? 'বিচারক ও ডেমো কিট: এ৪ প্রিন্ট ও ক্যামেরা স্ক্যান টেস্টিং' : 'Judge Demo Kit: Printable A4 Deeds'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isBn ? 'ডিজিটাল সাফ-কবলা দলিল প্রিন্ট ও স্ক্যান কিট' : 'Digital Land Deed Print & Scan Kit'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {isBn
                ? 'আসল ও জাল দলিলের পার্থক্য প্রমাণে নিচে সম্পূর্ণ এ৪ সাইজের দলিল প্রস্তুত করা আছে। আপনি যেকোনো তথ্য কাস্টমাইজ বা এডিট করতে পারেন।'
                : 'A4 deeds formatted to standard legal size with revenue stamps, boundaries, recitals, and QR verification.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handlePrint('both')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isBn ? 'উভয় দলিল প্রিন্ট (A4)' : 'Print Both (A4)'}</span>
            </button>
            <button
              onClick={() => handlePrint('page1')}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs hover:bg-emerald-100 transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isBn ? '১ম পেজ (আসল)' : 'Page 1 Only'}</span>
            </button>
            <button
              onClick={() => handlePrint('page2')}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-50 text-red-800 border border-red-300 font-bold text-xs hover:bg-red-100 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>{isBn ? '২য় পেজ (জাল)' : 'Page 2 Only'}</span>
            </button>
            <Link
              to="/verify"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>{isBn ? 'স্ক্যানার' : 'Scanner'}</span>
            </Link>
          </div>
        </div>

        {/* Live Camera Testing Tip */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">
              {isBn ? 'লাইভ ডেমো কৌশল (Live Pitch Tip): ' : 'Live Demo Pitch Tip: '}
            </span>
            {isBn
              ? 'মোবাইল ফোনে SmartBhumi ক্যামেরা স্ক্যানার চালু করে পৃষ্ঠা ১-এর QR কোড স্ক্যান করলে তাৎক্ষণিক "বৈধ (VERIFIED)" আসবে। কিন্তু পৃষ্ঠা ২-এ থাকা দলিলের ২৫.০০ শতকের জাল দাবি স্ক্যান করলে সাথে সাথে "লাল TAMPERED" সতর্কবার্তা আসবে।'
              : 'Scan Deed 1 with mobile camera for instant VERIFIED. Comparing Deed 2 demonstrates offline paper tamper detection!'}
          </div>
        </div>

        {/* Interactive Deed Customizer Accordion */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/70">
          <button
            type="button"
            onClick={() => setCustomizerOpen(!customizerOpen)}
            className="w-full flex items-center justify-between p-4 bg-slate-100/80 hover:bg-slate-200/70 transition cursor-pointer text-xs font-bold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>{isBn ? 'দলিলের তথ্য এডিট ও কাস্টমাইজেশন টুল (ঐচ্ছিক)' : 'Customize Deed Data & Boundaries (Optional)'}</span>
              <span className="text-[10px] text-slate-500 font-normal">
                {isBn ? 'নাম, দাগ, খতিয়ান, সীমানা বা জমির পরিমাণ পরিবর্তন করুন' : 'Change plot, khatian, boundary or area'}
              </span>
            </div>
            {customizerOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {customizerOpen && (
            <div className="p-5 space-y-4 bg-white border-t border-slate-200 text-xs">
              {/* Presets */}
              <div className="flex items-center gap-2 flex-wrap pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">{isBn ? 'রেকর্ড লোড করুন:' : 'Load from Records:'}</span>
                {landRecords.slice(0, 4).map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => handleLoadPreset(rec)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold hover:bg-emerald-100 transition cursor-pointer text-[11px]"
                  >
                    {rec.deedNumber} ({rec.mouza})
                  </button>
                ))}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'দলিল নম্বর' : 'Deed Number'}
                  </label>
                  <input
                    type="text"
                    value={deedData.deedNumber}
                    onChange={(e) => setDeedData({ ...deedData, deedNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'হস্তান্তরিত জমির পরিমাণ (শতক)' : 'Area (Shotok)'}
                  </label>
                  <input
                    type="text"
                    value={deedData.transferAreaShotok}
                    onChange={(e) => setDeedData({ ...deedData, transferAreaShotok: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'দাগ নম্বর (CS/RS)' : 'Dag Number'}
                  </label>
                  <input
                    type="text"
                    value={deedData.dagNumber}
                    onChange={(e) => setDeedData({ ...deedData, dagNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'খতিয়ান নম্বর (R.S.)' : 'Khatian Number'}
                  </label>
                  <input
                    type="text"
                    value={deedData.khatianNumber}
                    onChange={(e) => setDeedData({ ...deedData, khatianNumber: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'মৌজা ও জে.এল.' : 'Mouza & JL'}
                  </label>
                  <input
                    type="text"
                    value={deedData.mouza}
                    onChange={(e) => setDeedData({ ...deedData, mouza: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'জমির শ্রেণি' : 'Land Classification'}
                  </label>
                  <input
                    type="text"
                    value={deedData.landClass}
                    onChange={(e) => setDeedData({ ...deedData, landClass: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'বিক্রেতার নাম' : 'Seller Name'}
                  </label>
                  <input
                    type="text"
                    value={deedData.sellerName}
                    onChange={(e) => setDeedData({ ...deedData, sellerName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'ক্রেতার নাম' : 'Buyer Name'}
                  </label>
                  <input
                    type="text"
                    value={deedData.buyerName}
                    onChange={(e) => setDeedData({ ...deedData, buyerName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'মোট পণমূল্য / বিক্রয় মূল্য' : 'Consideration Price'}
                  </label>
                  <input
                    type="text"
                    value={deedData.priceAmount}
                    onChange={(e) => setDeedData({ ...deedData, priceAmount: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Boundary Inputs */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  {isBn ? 'চৌহদ্দি ও সীমানা বিবরণ (Boundaries)' : 'Boundary Specifications'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="উত্তরে..."
                    value={deedData.boundaryNorth}
                    onChange={(e) => setDeedData({ ...deedData, boundaryNorth: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="দক্ষিণে..."
                    value={deedData.boundarySouth}
                    onChange={(e) => setDeedData({ ...deedData, boundarySouth: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="পূর্বে..."
                    value={deedData.boundaryEast}
                    onChange={(e) => setDeedData({ ...deedData, boundaryEast: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <input
                    type="text"
                    placeholder=" পশ্চিমে..."
                    value={deedData.boundaryWest}
                    onChange={(e) => setDeedData({ ...deedData, boundaryWest: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DEED 1: GENUINE DEED (15.00 SHOTOK) - FILLS FULL A4 PAGE               */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {(printMode === 'both' || printMode === 'page1') && (
        <section className="print-deed-section print-deed-page-1 bg-white border-4 border-double border-emerald-900 rounded-2xl p-6 sm:p-7 mb-8 shadow-lg print:shadow-none print:border-4 print:border-black print:p-6 print:mb-0 print:rounded-none">
          {/* Top Non-Judicial Government Stamp Simulation */}
          <div className="border-b-2 border-slate-900 pb-2 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-900 flex items-center justify-center font-black text-emerald-900 text-sm">
                  গণ
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার • রাজস্ব প্রশাসন ও নিবন্ধন পরিদপ্তর
                  </div>
                  <div className="text-[10px] text-slate-500">
                    বাংলাদেশ নন-জুডিশিয়াল স্ট্যাম্প প্রতিকৃতি • মূল্য: ১০০০০ টাকা • ক্রমিক: BG-8849204
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black text-[11px] border border-emerald-300 uppercase">
                  মূল রেজিস্ট্রি দলিল
                </span>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Leaf #0 | STH Epoch #1
                </div>
              </div>
            </div>
          </div>

          {/* Deed Title & Basic Identity */}
          <div className="text-center py-1 border-b border-slate-300 mb-3 bg-slate-50/60 rounded">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              ভূমি সাফ-কবলা হস্তান্তর দলিলপত্র (Saf-Kabala Deed)
            </h2>
            <div className="text-xs text-emerald-900 font-bold flex items-center justify-center gap-2 mt-0.5">
              <span>সাব-রেজিস্ট্রারের কার্যালয়: তেজগাঁও, ঢাকা</span>
              <span>•</span>
              <span className="font-mono">দলিল নং: {deedData.deedNumber} (বৈধ ও সিলমোহরকৃত)</span>
            </div>
          </div>

          {/* 1st Party & 2nd Party (Seller & Buyer Particulars) */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-[11px]">
                ১ম পক্ষ (বিক্রেতা / হস্তান্তকারী):
              </div>
              <div className="font-semibold text-slate-800">{deedData.sellerName}</div>
              <div className="text-[10px] text-slate-600">পিতা: {deedData.sellerFather}</div>
              <div className="text-[10px] text-slate-600 font-mono">NID: {deedData.sellerNid}</div>
              <div className="text-[10px] text-slate-500">{deedData.sellerAddress}</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-[11px]">
                ২য় পক্ষ (ক্রেতা / গ্রহীতা):
              </div>
              <div className="font-semibold text-slate-800">{deedData.buyerName}</div>
              <div className="text-[10px] text-slate-600">পিতা: {deedData.buyerFather}</div>
              <div className="text-[10px] text-slate-600 font-mono">NID: {deedData.buyerNid}</div>
              <div className="text-[10px] text-slate-500">{deedData.buyerAddress}</div>
            </div>
          </div>

          {/* Schedule of Land (তফসিলভুক্ত হস্তান্তরিত ভূমির বিবরণ) */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs space-y-2 mb-3">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
              <span>তফসিলভুক্ত হস্তান্তরিত ভূমির বিবরণ (Schedule of Land):</span>
              <span className="text-[10px] font-mono text-emerald-800">জেলা: ঢাকা, থানা: তেজগাঁও</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">মৌজা ও জে.এল. নম্বর:</span>
                <span className="font-bold text-slate-900 font-mono">{deedData.mouza}</span>
              </div>
              <div>
                <span className="text-slate-500 block">খতিয়ান নম্বর (R.S.):</span>
                <span className="font-bold text-slate-900 font-mono">{deedData.khatianNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">দাগ নম্বর (CS/RS):</span>
                <span className="font-bold text-slate-900 font-mono">{deedData.dagNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200 items-center">
              <div>
                <span className="text-slate-500 block">জমির শ্রেণি:</span>
                <span className="font-semibold text-slate-800">{deedData.landClass}</span>
              </div>
              <div className="bg-emerald-100/80 p-1.5 rounded border border-emerald-300">
                <span className="text-emerald-950 font-bold block text-[10px]">হস্তান্তরিত ভূমির পরিমাণ:</span>
                <span className="font-black text-emerald-900 text-sm font-mono">
                  {toBanglaDigits(deedData.transferAreaShotok, isBn ? 'bn' : 'en')} শতাংশ (শতক)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">পরিশোধিত পণমূল্য:</span>
                <span className="font-bold text-slate-900">{deedData.priceAmount}</span>
              </div>
            </div>
          </div>

          {/* Boundary Specifications (চৌহদ্দি বা সীমানা বিবরণ) */}
          <div className="bg-white border border-slate-300 rounded-lg p-2.5 text-xs mb-3 space-y-1">
            <span className="font-bold text-slate-800 block text-[11px] border-b border-slate-200 pb-1">
              চৌহদ্দি ও সীমানা বিবরণ (Boundaries):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div><strong className="text-slate-700">উত্তরে:</strong> {deedData.boundaryNorth}</div>
              <div><strong className="text-slate-700">দক্ষিণে:</strong> {deedData.boundarySouth}</div>
              <div><strong className="text-slate-700">পূর্বে:</strong> {deedData.boundaryEast}</div>
              <div><strong className="text-slate-700">পশ্চিমে:</strong> {deedData.boundaryWest}</div>
            </div>
          </div>

          {/* Legal Recital & Conditions (স্বত্ব অর্পণ ঘোষণা ও শর্তাবলী) */}
          <div className="text-[10px] leading-relaxed text-slate-700 border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 mb-3">
            <p>
              <strong>শর্তাবলী ও স্বত্ব অর্পণ ঘোষণা:</strong> বিক্রেতা সাব-রেজিস্ট্রারের সম্মুখে উপস্থিত হইয়া স্বেচ্ছায় ও সুস্থ মস্তিষ্কে তাহার বৈধ খতিয়ানভুক্ত রেকর্ডীয় স্বত্ব হইতে উপরিউক্ত {toBanglaDigits(deedData.transferAreaShotok, isBn ? 'bn' : 'en')} শতক ভূমি সাফ-কবলা বিক্রয় করিলেন। অত্র ভূমি সম্পূর্ণ নির্দায়, নির্ভেজাল এবং যেকোনো সরকারি বা বেসরকারি দায়মুক্ত। এই রেজিস্ট্রি দলিলের ফলে সার্ভার-ভেরিফায়েড ইন্টিজার মাইক্রো-শতক ব্যালেন্স থেকে জমি কর্তন হইয়া ক্রেতার নামে স্বয়ংক্রিয় ই-নামজারি (e-Mutation) পাইপলাইনে স্থানান্তরিত হইল।
            </p>
          </div>

          {/* Witnesses & Attestation Box (সাক্ষী ও শনাক্তকারীর স্বাক্ষর) */}
          <div className="grid grid-cols-3 gap-2 text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 mb-3 text-[10px]">
            <div>
              <span className="font-bold text-slate-800 block">১ম সাক্ষী:</span>
              <span className="text-slate-600 block">{deedData.witness1}</span>
              <span className="text-slate-400 font-mono mt-1 block">স্বাক্ষরিত: ✓</span>
            </div>
            <div>
              <span className="font-bold text-slate-800 block">২য় সাক্ষী:</span>
              <span className="text-slate-600 block">{deedData.witness2}</span>
              <span className="text-slate-400 font-mono mt-1 block">স্বাক্ষরিত: ✓</span>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="font-bold text-slate-800 block">শনাক্তকারী:</span>
              <span className="text-slate-600 block">অ্যাডভোকেট কামরুল হাসান</span>
              <span className="text-slate-400 font-mono mt-1 block">আইনজীবী বার আইডি: 8841</span>
            </div>
          </div>

          {/* Sub-Registrar Seal, QR Verification & Cryptographic Stamp Footer */}
          <div className="grid grid-cols-3 gap-3 items-center pt-2 border-t-2 border-slate-900 text-xs">
            {/* Left: Signatures Simulation */}
            <div className="space-y-2">
              <div className="border-b border-dashed border-slate-400 pb-1">
                <span className="text-[9px] text-slate-400 block font-mono">হস্তান্তরকারীর স্বাক্ষর ও টিপসহি:</span>
                <span className="font-bold text-slate-800 text-xs">মো: আব্দুল করিম</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-mono">গ্রহীতার স্বাক্ষর:</span>
                <span className="font-bold text-slate-800 text-xs">মো: রহিম উদ্দিন</span>
              </div>
            </div>

            {/* Middle: Official Seal & Cryptographic Info */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-900 mx-auto flex items-center justify-center font-black text-emerald-900 text-[10px]">
                সিলমোহর
              </div>
              <div className="font-bold text-slate-800 text-[10px]">সাব-রেজিস্ট্রারের ডিজিটাল সিলমোহর</div>
              <div className="text-[9px] text-slate-500 font-mono">Ed25519 + NIST ML-DSA-65</div>
              <div className="text-[8px] text-slate-400 font-mono">2026-11-09T08:00:00Z</div>
            </div>

            {/* Right: High-Contrast Offline QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-1.5 rounded border-2 border-black">
                {loading ? (
                  <div className="w-24 h-24 flex items-center justify-center text-slate-400 text-[10px]">
                    QR...
                  </div>
                ) : (
                  <QRCodeSVG
                    value={qrString || fallbackQR}
                    size={110}
                    level="M"
                    includeMargin={true}
                    className="w-full h-auto max-w-[110px]"
                  />
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-800 mt-1 block">
                অফলাইন প্রমাণীকরণ কিউআর
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                RFC 9162 Merkle Leaf #0
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black text-[9px] mt-0.5">
                বৈধ (VERIFIED)
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DEED 2: TAMPERED PAPER DEED (25.00 SHOTOK - RED-TEAM AUDIT SCENARIO)    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {(printMode === 'both' || printMode === 'page2') && (
        <section className="print-deed-section print-deed-page-2 bg-white border-4 border-double border-red-700 rounded-2xl p-6 sm:p-7 shadow-lg print:shadow-none print:border-4 print:border-red-700 print:p-6 print:rounded-none">
          {/* Top Non-Judicial Government Stamp Simulation with Tamper Flag */}
          <div className="border-b-2 border-red-700 pb-2 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-red-700 bg-red-50 flex items-center justify-center font-black text-red-700 text-sm">
                  রেড
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-red-800">
                    রেড-টিম সাইবার অডিট দৃশ্যকল্প • কাগজে কলম দিয়ে জালিয়াতি টেস্ট
                  </div>
                  <div className="text-[10px] text-red-600">
                    কাগজে কলম দিয়ে ২৫.০০ শতক লেখা হলেও QR কোডে মূল ক্রিপ্টোগ্রাফিক রেকর্ড বহাল
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded bg-red-100 text-red-900 font-black text-[11px] border border-red-300 uppercase">
                  জাল দলিল (TAMPERED)
                </span>
                <div className="text-[9px] text-red-600 font-mono mt-0.5 font-bold">
                  দাবি অসঙ্গতি শনাক্ত
                </div>
              </div>
            </div>
          </div>

          {/* Deed Title & Basic Identity */}
          <div className="text-center py-1 border-b border-red-300 mb-3 bg-red-50/50 rounded">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <span>ভূমি সাফ-কবলা দলিল (কাগজ বিকৃত টেস্ট)</span>
              <span className="text-xs px-2 py-0.5 bg-red-600 text-white rounded font-mono font-bold">
                DEMO TAMPER
              </span>
            </h2>
            <div className="text-xs text-red-700 font-bold flex items-center justify-center gap-2 mt-0.5">
              <span>সাব-রেজিস্ট্রারের কার্যালয়: তেজগাঁও, ঢাকা</span>
              <span>•</span>
              <span className="font-mono">দলিল নং: {deedData.deedNumber} (কাগজের দাবি ভুয়া)</span>
            </div>
          </div>

          {/* 1st Party & 2nd Party (Seller & Buyer Particulars) */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-[11px]">
                ১ম পক্ষ (বিক্রেতা / হস্তান্তকারী):
              </div>
              <div className="font-semibold text-slate-800">{deedData.sellerName}</div>
              <div className="text-[10px] text-slate-600">পিতা: {deedData.sellerFather}</div>
              <div className="text-[10px] text-slate-600 font-mono">NID: {deedData.sellerNid}</div>
              <div className="text-[10px] text-slate-500">{deedData.sellerAddress}</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-[11px]">
                ২য় পক্ষ (ক্রেতা / গ্রহীতা):
              </div>
              <div className="font-semibold text-slate-800">{deedData.buyerName}</div>
              <div className="text-[10px] text-slate-600">পিতা: {deedData.buyerFather}</div>
              <div className="text-[10px] text-slate-600 font-mono">NID: {deedData.buyerNid}</div>
              <div className="text-[10px] text-slate-500">{deedData.buyerAddress}</div>
            </div>
          </div>

          {/* Schedule of Land with FORGED AREA HIGHLIGHT */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs space-y-2 mb-3">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
              <span>তফসিলভুক্ত হস্তান্তরিত ভূমির বিবরণ (Schedule of Land):</span>
              <span className="text-[10px] font-mono text-red-700 font-bold">জালিয়াতিপূর্ণ জমি পরিবর্তন</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">মৌজা ও জে.এল. নম্বর:</span>
                <span className="font-bold text-slate-900 font-mono">{deedData.mouza}</span>
              </div>
              <div>
                <span className="text-slate-500 block">খতিয়ান নম্বর (R.S.):</span>
                <span className="font-bold text-slate-900 font-mono">{deedData.khatianNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">দাগ নম্বর (CS/RS):</span>
                <span className="font-bold text-slate-900 font-mono">{deedData.dagNumber}</span>
              </div>
            </div>

            {/* Fraudulent Area Field Highlighted in Red */}
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200 items-center">
              <div>
                <span className="text-slate-500 block">জমির শ্রেণি:</span>
                <span className="font-semibold text-slate-800">{deedData.landClass}</span>
              </div>
              <div className="bg-red-50 p-1.5 rounded border-2 border-red-600 relative overflow-hidden">
                <span className="text-red-950 font-bold block text-[10px]">হস্তান্তরিত জমির পরিমাণ (জালকৃত):</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-bold text-red-500 line-through text-xs font-mono">
                    {toBanglaDigits('15.00', isBn ? 'bn' : 'en')}
                  </span>
                  <span className="font-black text-red-900 text-sm font-mono bg-white px-1.5 py-0.2 rounded border border-red-400">
                    {toBanglaDigits('25.00', isBn ? 'bn' : 'en')} শতাংশ (শতক)
                  </span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">পরিশোধিত পণমূল্য:</span>
                <span className="font-bold text-slate-900">{deedData.priceAmount}</span>
              </div>
            </div>
          </div>

          {/* Boundary Specifications (চৌহদ্দি বা সীমানা বিবরণ) */}
          <div className="bg-white border border-slate-300 rounded-lg p-2.5 text-xs mb-3 space-y-1">
            <span className="font-bold text-slate-800 block text-[11px] border-b border-slate-200 pb-1">
              চৌহদ্দি ও সীমানা বিবরণ (Boundaries):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div><strong className="text-slate-700">উত্তরে:</strong> {deedData.boundaryNorth}</div>
              <div><strong className="text-slate-700">দক্ষিণে:</strong> {deedData.boundarySouth}</div>
              <div><strong className="text-slate-700">পূর্বে:</strong> {deedData.boundaryEast}</div>
              <div><strong className="text-slate-700">পশ্চিমে:</strong> {deedData.boundaryWest}</div>
            </div>
          </div>

          {/* Security Property Box */}
          <div className="p-2.5 bg-slate-900 text-white rounded-lg text-xs space-y-1 mb-3">
            <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>ক্রিপ্টোগ্রাফিক সুরক্ষা বৈশিষ্ট্য (Cryptographic Property):</span>
            </div>
            <p className="text-slate-300 text-[10px] leading-relaxed">
              যেহেতু অফলাইন কিউআর কোডের ভেতরে claims.transferMicroShotok = 15000000 সাব-রেজিস্ট্রারের Ed25519 ও ML-DSA কী দ্বারা সিলমোহরকৃত, তাই কাগজে জালিয়াতি করে ২৫.০০ শতক লিখলেও স্মার্টভূমি অফলাইন ভেরিফায়ার তাৎক্ষণিক দাবি-অসঙ্গতি (Claim Mismatch) শনাক্ত করে বাতিল ঘোষণা করে।
            </p>
          </div>

          {/* Witnesses & Attestation Box */}
          <div className="grid grid-cols-3 gap-2 text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 mb-3 text-[10px]">
            <div>
              <span className="font-bold text-slate-800 block">১ম সাক্ষী:</span>
              <span className="text-slate-600 block">{deedData.witness1}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800 block">২য় সাক্ষী:</span>
              <span className="text-slate-600 block">{deedData.witness2}</span>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="font-bold text-slate-800 block">শনাক্তকারী:</span>
              <span className="text-slate-600 block">অ্যাডভোকেট কামরুল হাসান</span>
            </div>
          </div>

          {/* Sub-Registrar Seal, QR Verification & Cryptographic Stamp Footer */}
          <div className="grid grid-cols-3 gap-3 items-center pt-2 border-t-2 border-red-700 text-xs">
            {/* Left: Signatures Simulation */}
            <div className="space-y-2">
              <div className="border-b border-dashed border-slate-400 pb-1">
                <span className="text-[9px] text-slate-400 block font-mono">হস্তান্তরকারীর স্বাক্ষর:</span>
                <span className="font-bold text-slate-800 text-xs">মো: আব্দুল করিম</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-mono">গ্রহীতার স্বাক্ষর:</span>
                <span className="font-bold text-slate-800 text-xs">মো: রহিম উদ্দিন</span>
              </div>
            </div>

            {/* Middle: Official Seal & Cryptographic Info */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full border-2 border-red-600 bg-red-50 mx-auto flex items-center justify-center font-black text-red-700 text-[10px]">
                বাতিল
              </div>
              <div className="font-bold text-red-800 text-[10px]">দাবি অসঙ্গতি পরিলক্ষিত</div>
              <div className="text-[9px] text-slate-500 font-mono">কাগজের ২৫.০০ ≠ কিউআরের ১৫.০০</div>
            </div>

            {/* Right: High-Contrast Offline QR Code with TAMPER Verdict */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-1.5 rounded border-2 border-red-600 relative">
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded uppercase">
                  TAMPER
                </div>
                {loading ? (
                  <div className="w-24 h-24 flex items-center justify-center text-slate-400 text-[10px]">
                    QR...
                  </div>
                ) : (
                  <QRCodeSVG
                    value={qrString || fallbackQR}
                    size={110}
                    level="M"
                    includeMargin={true}
                    className="w-full h-auto max-w-[110px]"
                  />
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-800 mt-1 block">
                আসল কিউআর (১৫.০০ শতক)
              </span>
              <span className="text-[8px] text-red-600 font-mono font-bold">
                মৌলিক রেকর্ডের সাথে অসঙ্গতি
              </span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 font-black text-[9px] mt-0.5">
                জাল/বাতিল (TAMPERED)
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Screen-Only Footer Tip */}
      <div className="print:hidden mt-6 text-center text-xs text-slate-500">
        <p>
          {isBn
            ? 'টিপস: ব্রাউজারের প্রিন্ট ডায়ালগে "Background Graphics" টিক মার্ক দেওয়া আছে কিনা নিশ্চিত করুন যাতে সিল ও হাইলাইটার স্পষ্ট দেখা যায়।'
            : 'Tip: Ensure "Background graphics" is enabled in browser print settings for optimal seal and highlighter reproduction.'}
        </p>
      </div>
    </div>
  );
};

export default PrintDeedsPage;
