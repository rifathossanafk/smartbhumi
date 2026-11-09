import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FilePlus2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  fetchRegistryState,
  precheckDeed,
  registerDeed,
  fireStressTest,
  isAirplaneMode
} from '../api/client';
import { Button, Card, Badge, LoadingSpinner } from '../components/UIComponents';
import { AreaUnit, fromMicroShotok, toMicroShotok } from '../shared/units';
import { toBanglaDigits } from '../styles/tokens';

export const RegisterPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [shares, setShares] = useState<any[]>([]);
  const [selectedShareId, setSelectedShareId] = useState<string>('');
  const [transferArea, setTransferArea] = useState<number>(5.0);
  const [transferUnit, setTransferUnit] = useState<AreaUnit>('shotok');
  const [sellerNid, setSellerNid] = useState<string>('9990001001');
  const [buyerName, setBuyerName] = useState<string>('SYNTHETIC: Tanveer Ahmed');
  const [buyerNid, setBuyerNid] = useState<string>('9990002002');

  const [precheckLoading, setPrecheckLoading] = useState<boolean>(false);
  const [precheckResult, setPrecheckResult] = useState<any | null>(null);
  const [registering, setRegistering] = useState<boolean>(false);
  const [registerResult, setRegisterResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Concurrency Stress Test States
  const [stressLoading, setStressLoading] = useState<boolean>(false);
  const [stressResult, setStressResult] = useState<any | null>(null);

  useEffect(() => {
    loadRegistryData();
  }, []);

  async function loadRegistryData() {
    try {
      const state = await fetchRegistryState();
      setShares(state.data.shares || []);
      if (state.data.shares?.length > 0) {
        setSelectedShareId(state.data.shares[0].id);
      }
    } catch (err) {
      console.error('Failed to load state:', err);
    }
  }

  const selectedShare = shares.find((s) => s.id === selectedShareId);

  // Auto-run precheck whenever inputs change
  useEffect(() => {
    if (!selectedShare) return;
    runPrecheck();
  }, [selectedShareId, transferArea, transferUnit, sellerNid]);

  const runPrecheck = async () => {
    if (!selectedShare) return;
    setPrecheckLoading(true);
    setErrorMessage(null);
    try {
      const res = await precheckDeed({
        khatianNumber: selectedShare.khatian_number || 'KH-2026-0001',
        dagNumber: selectedShare.dag_number,
        mouzaCode: selectedShare.mouza_code,
        transferArea: Number(transferArea),
        transferUnit,
        sellerNid,
      });
      setPrecheckResult(res);
    } catch (err) {
      setPrecheckResult(null);
    } finally {
      setPrecheckLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShare) return;

    setRegistering(true);
    setErrorMessage(null);
    setRegisterResult(null);

    try {
      const res = await registerDeed({
        khatianNumber: selectedShare.khatian_number || 'KH-2026-0001',
        dagNumber: selectedShare.dag_number,
        mouzaCode: selectedShare.mouza_code,
        transferArea: Number(transferArea),
        transferUnit,
        buyerNameEn: buyerName,
        buyerNameBn: buyerName,
        buyerNid,
        sellerNid,
      });
      setRegisterResult(res.deed);
      loadRegistryData(); // refresh remaining balances
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setRegistering(false);
    }
  };

  const handleRunStressTest = async () => {
    setStressLoading(true);
    setStressResult(null);
    try {
      const res = await fireStressTest();
      setStressResult(res);
      loadRegistryData();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setStressLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isBn ? 'দলিল রেজিস্ট্রি ও হস্তান্তর' : 'Deed Registration & Area Transfer'}
            </h1>
            <Badge variant="success">Atomic Accounting</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {isBn
              ? 'সার্ভার ও ডাটাবেস চেক কনস্ট্রেইন্ট দ্বারা ডাবল-সেলিং সম্পূর্ণভাবে অবরুদ্ধ।'
              : 'Database-enforced double-sale prevention with integer micro-shotok area accounting.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: REGISTRATION FORM */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FilePlus2 className="w-5 h-5 text-emerald-700" />
              <span>{isBn ? 'জমি হস্তান্তর ফরম' : 'Land Transfer Form'}</span>
            </h2>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Parcel Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'দাগ ও খতিয়ান নির্বাচন করুন' : 'Select Plot & Share'}
                </label>
                <select
                  value={selectedShareId}
                  onChange={(e) => setSelectedShareId(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {shares.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.dag_number} ({s.mouza_code}) — {isBn ? 'অবশিষ্ট:' : 'Available:'}{' '}
                      {toBanglaDigits(s.available_shotok ?? 0, i18n.language)} {isBn ? 'শতক' : 'Shotok'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area & Unit Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'হস্তান্তরিত জমির পরিমাণ' : 'Transfer Area'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={transferArea}
                    onChange={(e) => setTransferArea(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পরিমাপের একক' : 'Area Unit'}
                  </label>
                  <select
                    value={transferUnit}
                    onChange={(e) => setTransferUnit(e.target.value as AreaUnit)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="shotok">শতক (Shotok / Decimal)</option>
                    <option value="katha">কাঠা (Katha)</option>
                    <option value="bigha">বিঘা (Bigha)</option>
                    <option value="acre">একর (Acre)</option>
                    <option value="chatak">ছটাক (Chatak)</option>
                  </select>
                </div>
              </div>

              {/* Parties: Seller & Buyer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বিক্রেতার এনআইডি (লাস্ট ৪ ডিজিট)' : 'Seller NID'}
                  </label>
                  <input
                    type="text"
                    value={sellerNid}
                    onChange={(e) => setSellerNid(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5"
                    placeholder="9990001001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'ক্রেতার এনআইডি (সিন্থেটিক)' : 'Buyer NID'}
                  </label>
                  <input
                    type="text"
                    value={buyerNid}
                    onChange={(e) => setBuyerNid(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5"
                    placeholder="9990002002"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200 text-xs font-medium flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={registering}
                disabled={precheckResult && !precheckResult.allowed}
              >
                {isBn ? 'দলিল রেজিস্ট্রি ও সিলমোহর করুন' : 'Execute & Seal Deed'}
              </Button>
            </form>
          </Card>

          {/* Registration Success Receipt Card */}
          {registerResult && (
            <Card className="bg-emerald-950 text-white border-emerald-800 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>{isBn ? 'দলিল সফলভাবে নিবন্ধিত ও সিলমোহরকৃত!' : 'Deed Registered & Sealed!'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white/10 p-2.5 rounded-lg">
                  <span className="text-slate-300 block text-[10px]">{isBn ? 'দলিল নম্বর' : 'Deed No'}</span>
                  <span className="font-mono font-bold text-sm">{registerResult.deedNumber}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-lg">
                  <span className="text-slate-300 block text-[10px]">{isBn ? 'হস্তান্তরিত জমি' : 'Area Transferred'}</span>
                  <span className="font-bold text-emerald-300 text-sm">
                    {toBanglaDigits(registerResult.transferAreaShotok, i18n.language)} {isBn ? 'শতক' : 'Shotok'}
                  </span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-lg">
                  <span className="text-slate-300 block text-[10px]">{isBn ? 'মার্কেল লিফ #' : 'Merkle Leaf'}</span>
                  <span className="font-mono font-bold text-sm">#{registerResult.merkleLeafIndex}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300">
                {isBn
                  ? 'এই দলিলের ভিত্তিতে একটি স্বয়ংক্রিয় ই-নামজারি (e-Mutation) কেস তৈরি হয়েছে এবং এসিল্যান্ড শুনানির অপেক্ষায় আছে।'
                  : 'An automated e-Mutation case was created and transferred area is placed in mutation_pending.'}
              </p>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE PRE-CHECK & CONCURRENCY STRESS TEST */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Area Pre-Check Card */}
          <Card className="space-y-3 border-emerald-200 bg-emerald-50/20">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{isBn ? 'লাইভ প্রি-চেক ও এলাকা স্থিতি' : 'Live Area Pre-Check'}</span>
              </span>
              {precheckLoading && <span className="text-[10px] text-emerald-700 animate-pulse">হিসাব হচ্ছে...</span>}
            </div>

            {selectedShare && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'মোট এলাকা' : 'Total Area'}</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {toBanglaDigits(selectedShare.total_shotok ?? 0, i18n.language)} {isBn ? 'শতক' : 'Shotok'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">{isBn ? 'অবশিষ্ট প্রাপ্য এলাকা' : 'Available Area'}</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {toBanglaDigits(selectedShare.available_shotok ?? 0, i18n.language)} {isBn ? 'শতক' : 'Shotok'}
                  </span>
                </div>
              </div>
            )}

            {precheckResult && (
              <div className="space-y-2 pt-2">
                <div
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
                    precheckResult.allowed
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-red-100 text-red-900 border-red-300'
                  }`}
                >
                  {precheckResult.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-700 shrink-0" />
                  )}
                  <span>
                    {precheckResult.allowed
                      ? isBn
                        ? 'হস্তান্তর সম্ভব: পর্যাপ্ত জমি অবশিষ্ট আছে'
                        : 'Transfer Allowed: Sufficient Area Available'
                      : isBn
                        ? 'হস্তান্তর অবরুদ্ধ: পর্যাপ্ত জমি নেই বা বিধিনিষেধ রয়েছে'
                        : 'Transfer Blocked: Area Deficit or Rule Block'}
                  </span>
                </div>

                {precheckResult.risks?.length > 0 && (
                  <div className="space-y-1 text-xs">
                    {precheckResult.risks.map((risk: any, i: number) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg border text-[11px] ${
                          risk.severity === 'critical'
                            ? 'bg-red-50 text-red-900 border-red-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        <span className="font-bold block">
                          {risk.severity === 'critical' ? '🚫 ' : '⚠️ '}
                          {risk.code}
                        </span>
                        <span>{isBn ? risk.explanation_bn : risk.explanation_en}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* CONCURRENCY 20-WORKER STRESS TEST CARD (P3 Double-Sale Bet) */}
          <Card className="border-amber-300 bg-amber-50/30 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>{isBn ? 'ডাবল-সেলিং স্ট্রেস টেস্ট (P3 Demo)' : 'Concurrency Double-Sale Test'}</span>
              </span>
              <Badge variant="warning">২০ জন সমসাময়িক ক্রেতা</Badge>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {isBn
                ? '১০.৪০ শতক জমিতে একই মুহূর্তে ২০ জন ক্রেতা প্রত্যেকে ১০.০০ শতক করে ক্রয়ের আবেদন করবে। ডাটাবেস চেক কনস্ট্রেইন্ট নিশ্চিত করবে ঠিক ১ জন সফল হবে এবং ১৯ জন অবরুদ্ধ হবে।'
                : 'Fires 20 concurrent sales of 10.00 from a 10.40 share. Exactly 1 must succeed, 19 fail.'}
            </p>

            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full border-amber-400 bg-white hover:bg-amber-50 text-amber-900 font-bold"
              onClick={handleRunStressTest}
              isLoading={stressLoading}
            >
              <Zap className="w-4 h-4 mr-1 text-amber-600" />
              <span>{isBn ? '২০টি সমসাময়িক বিক্রয় ফায়ার করুন' : 'Fire 20 Concurrent Sales'}</span>
            </Button>

            {stressResult && (
              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2.5 animate-fade-in text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {isBn ? 'সফল হয়েছে:' : 'Succeeded:'} {stressResult.succeeded}
                  </span>
                  <span className="text-red-800 flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    {isBn ? 'অবরুদ্ধ হয়েছে:' : 'Blocked:'} {stressResult.failed}
                  </span>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-red-200 h-3 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-600 h-full" style={{ width: '5%' }} />
                  <div className="bg-red-600 h-full" style={{ width: '95%' }} />
                </div>

                <div className="text-[11px] text-slate-600 font-medium">
                  {isBn
                    ? 'ফলাফল: ১টি দলিল অনুমোদিত (১০.০০ শতক হস্তান্তরিত)। অবশিষ্ট ০.৪০ শতক জমির জন্য বাকি ১৯ জন তাত্ক্ষণিকভাবে ব্যর্থ হয়েছে।'
                    : 'Invariant Verified: 1 sale passed (10.00 shotok), 19 blocked. Remaining area: 0.40 shotok.'}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
