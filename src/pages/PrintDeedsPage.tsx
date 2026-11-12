import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, AlertTriangle, CheckCircle2, QrCode, FileText, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchDeedQR } from '../api/client';
import { toBanglaDigits } from '../styles/tokens';

export const PrintDeedsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [qrString, setQrString] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback synthetic QR string if offline and not cached yet
  const fallbackQR = JSON.stringify({
    v: 1,
    alg: 'ed25519',
    ep: 1,
    idx: 0,
    claims: {
      deedNumber: 'LP-2026-001',
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
    fetchDeedQR('LP-2026-001')
      .then((res) => {
        if (mounted && res?.qrString) {
          setQrString(res.qrString);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.warn('Using fallback synthetic QR payload:', err.message);
          setQrString(fallbackQR);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-deed-container max-w-5xl mx-auto px-4 py-6 print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white">
      {/* Screen-Only Control Header */}
      <div className="print:hidden mb-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? 'বিচারক ও ডেমো কিট: এ৪ প্রিন্ট দলিল' : 'Judge & Demo Kit: Printable Deeds'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isBn ? 'দলিল প্রিন্ট ও স্ক্যান টেস্টিং কিট' : 'Printable Deeds & Scan Testing Kit'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {isBn
                ? 'বিচারকদের সামনে অফলাইন মোবাইল ক্যামেরা স্ক্যানের মাধ্যমে লাইভ ট্যাম্পার প্রমাণের জন্য নিচে দুটি এ৪ সাইজের দলিল প্রস্তুত করা আছে: পৃষ্ঠা ১-এ বৈধ ১৫.০০ শতকের মূল দলিল এবং পৃষ্ঠা ২-এ জালকৃত ২৫.০০ শতকের দলিল (কাগজে কলম দিয়ে ২৫.০০ লেখা কিন্তু QR কোডে মূল ক্রিপ্টোগ্রাফিক রেকর্ড বহাল)।'
                : 'Two standard A4 deeds are prepared for live camera testing in front of the judges: Page 1 is authentic 15.00 shotok, while Page 2 is physically altered to 25.00 shotok with the same QR code to prove paper-tamper rejection.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>{isBn ? 'দলিল প্রিন্ট করুন (A4)' : 'Print Deeds (A4)'}</span>
            </button>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              <QrCode className="w-5 h-5" />
              <span>{isBn ? 'স্ক্যানার' : 'Scanner'}</span>
            </Link>
          </div>
        </div>

        {/* Live Camera Testing Tip */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">
              {isBn ? 'লাইভ ডেমো কৌশল (Live Pitch Tip): ' : 'Live Demo Pitch Tip: '}
            </span>
            {isBn
              ? 'মোবাইল ফোনে SmartBhumi ক্যামেরা স্ক্যানার চালু করে সরাসরি স্ক্রিনে বা প্রিন্ট করা কাগজে থাকা QR কোডটি স্ক্যান করুন। আসল দলিলে সাথে সাথে "সবুজ VERIFIED" আসবে; কিন্তু কাগজের ২৫.০০ শতকের দাবি যাচাই করলে তাৎক্ষণিক "লাল TAMPERED" সতর্কবার্তা আসবে!'
              : 'Open SmartBhumi camera scanner on your mobile phone and scan the QR directly from the screen or printed paper. Deed 1 yields VERIFIED, while comparing against Deed 2 demonstrates offline tamper detection!'}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEED 1: GENUINE DEED (15.00 SHOTOK) - FITS ON PAGE 1                     */}
      {/* ========================================================================= */}
      <section className="print-deed-section print-deed-page-1 bg-white border-2 border-emerald-900/60 rounded-2xl p-6 sm:p-8 mb-8 shadow-md print:shadow-none print:border-2 print:border-black print:p-5 print:mb-0 print:rounded-none">
        {/* Synthetic Demo Header Ribbon */}
        <div className="border-b-2 border-slate-800 pb-3 mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-emerald-800 flex items-center justify-center font-bold text-emerald-900 text-base sm:text-lg shrink-0">
              {isBn ? 'স্মার্ট' : 'Smart'}
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isBn ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার - সাব-রেজিস্ট্রার কার্যালয় (ডেমো)' : "Govt of Bangladesh - Sub-Registrar's Office (Demo)"}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {isBn ? 'ভূমি সাফ-কবলা রেজিস্ট্রি দলিল' : 'Land Sale & Transfer Deed (Saf-Kabala)'}
              </h2>
              <div className="text-[11px] sm:text-xs text-emerald-800 font-bold flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{isBn ? 'দলিল নম্বর: LP-2026-001 (বৈধ ও সিলমোহরকৃত)' : 'Deed No: LP-2026-001 (Genuine)'}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold text-xs uppercase border border-emerald-300">
              {isBn ? 'মূল দলিল' : 'Genuine Deed'}
            </span>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              {isBn ? 'লিফ #০ | এসটিএইচ ইপক #১' : 'Leaf #0 | STH Epoch #1'}
            </div>
          </div>
        </div>

        {/* Deed Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start print:gap-4">
          {/* Left 2 Cols: Legal Particulars */}
          <div className="md:col-span-2 space-y-3 print:space-y-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2 text-xs print:p-2.5 print:space-y-1.5">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isBn ? 'মৌজা ও জে.এল নম্বর:' : 'Mouza & JL:'}</span>
                <span className="font-bold text-slate-900 font-mono">{isBn ? 'তেজগাঁও (TEJ-102)' : 'Tejgaon (TEJ-102)'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isBn ? 'খতিয়ান নম্বর (R.S.):' : 'Khatian Number:'}</span>
                <span className="font-bold text-slate-900 font-mono">KHT-2026-001</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isBn ? 'দাগ নম্বর (CS/RS):' : 'Dag / Plot Number:'}</span>
                <span className="font-bold text-slate-900 font-mono">DAG-2026-001</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 bg-emerald-50/70 p-1.5 rounded-lg">
                <span className="text-emerald-900 font-bold">{isBn ? 'হস্তান্তরিত ভূমির পরিমাণ:' : 'Transfer Area:'}</span>
                <span className="font-black text-emerald-900 text-sm font-mono">
                  {toBanglaDigits('15.00', isBn ? 'bn' : 'en')} {isBn ? 'শতক (শতাংশ)' : 'Shotok'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isBn ? 'বিক্রেতার নাম ও এনআইডি:' : 'Seller Details:'}</span>
                <span className="font-medium text-slate-800">
                  {isBn ? 'আব্দুল করিম' : 'Abdul Karim'} (NID: <span className="font-mono font-bold">999000****567</span>)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">{isBn ? 'ক্রেতার নাম ও এনআইডি:' : 'Buyer Details:'}</span>
                <span className="font-medium text-slate-800">
                  {isBn ? 'রহিম উদ্দিন' : 'Rahim Uddin'} (NID: <span className="font-mono font-bold">999000****321</span>)
                </span>
              </div>
            </div>

            {/* Legal Recital Text in Bangla */}
            <div className="text-[11px] leading-relaxed text-slate-600 border border-slate-200 rounded-xl p-3 bg-white font-serif print:p-2 print:text-[10px]">
              <p>
                <strong>{isBn ? 'শর্তাবলী ও ঘোষণা:' : 'Terms & Conditions:'}</strong> {isBn
                  ? 'বিক্রেতা সাব-রেজিস্ট্রারের সম্মুখে উপস্থিত হইয়া স্বেচ্ছায় ও সজ্ঞানে তাহার খতিয়ানভুক্ত অংশের মধ্য হইতে উপরিউক্ত ১৫.০০ শতক ভূমি সাফ-কবলা হস্তান্তর করিলেন। এই হস্তান্তরের ফলে সার্ভার-ভেরিফায়েড ইন্টিজার মাইক্রো-শতক ব্যালেন্স থেকে ১৫.০০ শতক কর্তন হইয়া ক্রেতার নামে ই-নামজারি (e-Mutation) পেন্ডিং অবস্থায় স্থানান্তরিত হইল।'
                  : 'The seller appeared before the Sub-Registrar knowingly and voluntarily transferred the above 15.00 shotok land under Saf-Kabala deed. This transfer deducted 15.00 shotok from verified integer micro-shotok balance and queued automatic e-mutation to the buyer.'}
              </p>
            </div>

            {/* Sub-Registrar Seal Signature Simulation */}
            <div className="flex items-center justify-between pt-1.5 px-2 text-xs text-slate-500 border-t border-slate-200 print:text-[10px]">
              <div>
                <div className="font-mono font-bold text-slate-700">{isBn ? 'ডিজিটাল সিলমোহর: Ed25519 + ML-DSA-65' : 'Digital Seal: Ed25519 + ML-DSA-65'}</div>
                <div className="text-[10px]">{isBn ? 'অফিস অব দ্য সাব-রেজিস্ট্রার, তেজগাঁও, ঢাকা' : "Office of the Sub-Registrar, Tejgaon, Dhaka"}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-700">{isBn ? 'স্বাক্ষরিত ও সিলমোহরকৃত' : 'Signed & Sealed'}</div>
                <div className="text-[10px] text-slate-400 font-mono">2026-11-09T08:00:00Z</div>
              </div>
            </div>
          </div>

          {/* Right Col: High-Contrast Scannable QR Code */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl print:p-2">
            <div className="bg-white p-2.5 rounded-lg border-2 border-black shadow-xs mb-2 print:p-2">
              {loading ? (
                <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                  {isBn ? 'কিউআর তৈরি হচ্ছে...' : 'Generating QR...'}
                </div>
              ) : (
                <QRCodeSVG
                  value={qrString || fallbackQR}
                  size={155}
                  level="M"
                  includeMargin={true}
                  className="w-full h-auto max-w-[155px]"
                />
              )}
            </div>

            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-800 block">
                {isBn ? 'অফলাইন প্রমাণীকরণ কিউআর' : 'Offline Verifiable QR'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                {isBn ? 'আরএফসি ৯১৬২ মার্কেল লিফ #০' : 'RFC 9162 Merkle Leaf #0'}
              </span>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {isBn ? 'যাচাই ফলাফল: বৈধ (VERIFIED)' : 'Status: GENUINE'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DEED 2: TAMPERED PAPER DEED (25.00 SHOTOK - PAPER ALTERATION SCENARIO)    */}
      {/* ========================================================================= */}
      <section className="print-deed-section print-deed-page-2 bg-white border-2 border-red-600/60 rounded-2xl p-6 sm:p-8 shadow-md print:shadow-none print:border-2 print:border-red-600 print:p-5 print:rounded-none">
        {/* Synthetic Demo Header Ribbon with Tamper Alert */}
        <div className="border-b-2 border-red-500 pb-3 mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-red-600 bg-red-50 flex items-center justify-center font-bold text-red-700 text-base sm:text-lg shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-700">
                {isBn ? 'রেড-টিম টেস্ট সিনারিও ১: কাগজে কলম দিয়ে জালিয়াতি (Paper Alteration)' : 'Red-Team Test 1: Physical Paper Forgery Simulation'}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>{isBn ? 'জালকৃত সাফ-কবলা দলিল (কাগজ বিকৃত)' : 'Tampered Paper Deed (Forged Area)'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-300">
                  DEMO TAMPER
                </span>
              </h2>
              <div className="text-[11px] sm:text-xs text-red-700 font-bold flex items-center gap-1.5 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>
                  {isBn
                    ? 'আসল QR কোড ঠিক রেখে দলিলের জমিতে ১৫.০০ এর বদলে ২৫.০০ শতক লেখা হয়েছে!'
                    : 'Physical deed altered to 25.00 shotok while keeping genuine QR code'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block px-2.5 py-1 rounded-md bg-red-100 text-red-800 font-bold text-xs uppercase border border-red-300">
              {isBn ? 'জাল দলিল (TAMPERED)' : 'Tampered Deed'}
            </span>
            <div className="text-[10px] text-red-600 mt-0.5 font-mono font-bold">
              {isBn ? 'অসঙ্গতি শনাক্ত হয়েছে' : 'Mismatch Detected'}
            </div>
          </div>
        </div>

        {/* Deed Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start print:gap-4">
          {/* Left 2 Cols: Legal Particulars with Tampered Highlight */}
          <div className="md:col-span-2 space-y-3 print:space-y-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2 text-xs print:p-2.5 print:space-y-1.5">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isBn ? 'মৌজা ও জে.এল নম্বর:' : 'Mouza & JL:'}</span>
                <span className="font-bold text-slate-900 font-mono">{isBn ? 'তেজগাঁও (TEJ-102)' : 'Tejgaon (TEJ-102)'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isBn ? 'খতিয়ান নম্বর (R.S.):' : 'Khatian Number:'}</span>
                <span className="font-bold text-slate-900 font-mono">KHT-2026-001</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isBn ? 'দাগ নম্বর (CS/RS):' : 'Dag / Plot Number:'}</span>
                <span className="font-bold text-slate-900 font-mono">DAG-2026-001</span>
              </div>

              {/* Fraudulent Area Field Highlighted */}
              <div className="flex justify-between border-2 border-red-500 bg-red-50 p-2 rounded-lg relative overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="text-red-900 font-black">{isBn ? 'হস্তান্তরিত ভূমির পরিমাণ (জালকৃত):' : 'Tampered Area:'}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-red-700 text-sm sm:text-base font-mono line-through opacity-60 mr-2">
                    {toBanglaDigits('15.00', isBn ? 'bn' : 'en')}
                  </span>
                  <span className="font-black text-red-900 text-base sm:text-lg font-mono bg-white px-2 py-0.5 rounded border border-red-400">
                    {toBanglaDigits('25.00', isBn ? 'bn' : 'en')} {isBn ? 'শতক' : 'Shotok'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">{isBn ? 'বিক্রেতার নাম ও এনআইডি:' : 'Seller Details:'}</span>
                <span className="font-medium text-slate-800">
                  {isBn ? 'আব্দুল করিম' : 'Abdul Karim'} (NID: <span className="font-mono font-bold">999000****567</span>)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">{isBn ? 'ক্রেতার নাম ও এনআইডি:' : 'Buyer Details:'}</span>
                <span className="font-medium text-slate-800">
                  {isBn ? 'রহিম উদ্দিন' : 'Rahim Uddin'} (NID: <span className="font-mono font-bold">999000****321</span>)
                </span>
              </div>
            </div>

            {/* Recital with Forged Bangla Text */}
            <div className="text-[11px] leading-relaxed text-slate-700 border-2 border-dashed border-red-300 rounded-xl p-3 bg-red-50/40 font-serif print:p-2 print:text-[10px]">
              <p>
                <strong>{isBn ? 'জালিয়াতিপূর্ণ শর্তাবলী:' : 'Forged Recital Terms:'}</strong> {isBn
                  ? 'বিক্রেতা তাহার খতিয়ানভুক্ত অংশের মধ্য হইতে উপরিউক্ত ২৫.০০ শতক (জাল লিখিত) ভূমি হস্তান্তর করিলেন বলিয়া জালিয়াতি করা হইয়াছে। তবে সাব-রেজিস্ট্রারের মূল ক্রিপ্টোগ্রাফিক সিলমোহরকৃত কিউআরে এটি এখনো ১৫.০০ শতক বহাল আছে।'
                  : 'The deed recites 25.00 shotok (forged), while the authentic Sub-Registrar cryptographic seal in the QR code enforces 15.00 shotok.'}
              </p>
            </div>

            {/* Red-Team Security Explanation Box */}
            <div className="p-2.5 sm:p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1 print:p-2 print:text-[10px]">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{isBn ? 'ক্রিপ্টোগ্রাফিক সুরক্ষা বৈশিষ্ট্য (Security Property):' : 'Cryptographic Security Assurance:'}</span>
              </div>
              <p className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed">
                {isBn
                  ? 'যেহেতু অফলাইন কিউআর কোডের ভেতরে claims.transferMicroShotok = 15000000 সংরক্ষিত এবং এটি সাব-রেজিস্ট্রারের Ed25519 কী দ্বারা সিলমোহরকৃত, তাই কাগজে জালিয়াতি করে ২৫.০০ শতক লিখলেও স্মার্টভূমি অফলাইন ভেরিফায়ার তাৎক্ষণিক দাবি-অসঙ্গতি (Claim Mismatch) শনাক্ত করে দলিলটি বাতিল ঘোষণা করে।'
                  : 'Because the offline QR payload cryptographically seals transferMicroShotok = 15000000 signed by the Sub-Registrar key, any paper alteration to 25.00 shotok triggers instant offline claim mismatch rejection.'}
              </p>
            </div>
          </div>

          {/* Right Col: Genuine QR Code Stamped on Tampered Paper */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl print:p-2">
            <div className="bg-white p-2.5 rounded-lg border-2 border-red-600 shadow-xs mb-2 relative print:p-2">
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                {isBn ? 'জাল পরীক্ষা' : 'Tampered Test'}
              </div>
              {loading ? (
                <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                  {isBn ? 'কিউআর তৈরি হচ্ছে...' : 'Generating QR...'}
                </div>
              ) : (
                <QRCodeSVG
                  value={qrString || fallbackQR}
                  size={155}
                  level="M"
                  includeMargin={true}
                  className="w-full h-auto max-w-[155px]"
                />
              )}
            </div>

            <div className="text-center">
              <span className="text-[11px] font-bold text-slate-800 block">
                {isBn ? 'আসল কিউআর (১৫.০০ শতক)' : 'Genuine QR (15.00 Shotok)'}
              </span>
              <span className="text-[10px] text-red-600 font-mono font-bold block mt-0.5">
                {isBn ? 'কাগজের ২৫.০০ ≠ কিউআরের ১৫.০০' : 'Paper 25.00 ≠ QR 15.00'}
              </span>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                {isBn ? 'যাচাই ফলাফল: জাল/বাতিল (TAMPERED)' : 'Verdict: TAMPERED'}
              </span>
            </div>
          </div>
        </div>
      </section>

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
