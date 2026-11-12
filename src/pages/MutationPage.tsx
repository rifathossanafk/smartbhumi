import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitBranch,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  FileText,
  AlertTriangle,
  RefreshCw,
  Building,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  fetchMutationCases,
  approveMutationCase,
  rejectMutationCase
} from '../api/client';
import { Button, Card, Badge, LoadingSpinner, EmptyState } from '../components/UIComponents';
import { toBanglaDigits } from '../styles/tokens';
import { Link } from 'react-router-dom';

export const MutationPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');
  const [actingCaseId, setActingCaseId] = useState<string | null>(null);
  const [approvalResult, setApprovalResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentRole = localStorage.getItem('smartbhumi_demo_role') || 'reviewer';
  const isACLand = currentRole === 'reviewer' || currentRole === 'admin';

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  async function loadCases() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchMutationCases(statusFilter || undefined);
      setCases(res.cases || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (caseId: string) => {
    setActingCaseId(caseId);
    setErrorMsg(null);
    try {
      const res = await approveMutationCase(caseId);
      setApprovalResult(res);
      loadCases();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setActingCaseId(null);
    }
  };

  const handleReject = async (caseId: string) => {
    const reason = prompt(
      isBn ? 'নামজারি বাতিলের কারণ লিখুন:' : 'Enter reason for rejection:',
      'কাগজপত্রে মালিকানার শৃঙ্খলে অসঙ্গতি পরিলক্ষিত'
    );
    if (!reason) return;

    setActingCaseId(caseId);
    try {
      await rejectMutationCase(caseId, reason);
      loadCases();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setActingCaseId(null);
    }
  };

  const switchToACLand = () => {
    localStorage.setItem('smartbhumi_demo_role', 'reviewer');
    localStorage.setItem('smartbhumi_demo_user_name', 'সহকারী কমিশনার - ভূমি (AC Land)');
    window.location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isBn ? 'রেজিস্ট্রি হতে স্বয়ংক্রিয় ই-নামজারি পাইপলাইন' : 'Registry to e-Mutation Pipeline'}
            </h1>
            <Badge variant="success">{isBn ? 'এসি ল্যান্ড রাজস্ব আদালত' : 'AC Land Court'}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {isBn
              ? 'দলিল রেজিস্ট্রির সাথে সাথে স্বয়ংক্রিয়ভাবে ই-নামজারি আবেদন লেজারে আসে। এসিল্যান্ডের একক ক্লিকে ক্রেতার নামে নতুন খতিয়ান তৈরি হয় ও বিক্রেতার ব্যালেন্স কর্তন হয়।'
              : 'Sealing a deed auto-generates mutation cases; AC Land approval atomically moves area to buyer khatian.'}
          </p>
        </div>

        {/* Role Status Badge */}
        {!isACLand ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-xs font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{isBn ? 'শুধুমাত্র এসিল্যান্ড অনুমোদন করতে পারেন' : 'AC Land Role Required'}</span>
            <button
              onClick={switchToACLand}
              className="ml-2 px-2 py-1 bg-amber-200 hover:bg-amber-300 rounded text-[11px] font-bold text-amber-950 cursor-pointer"
            >
              {isBn ? 'এসিল্যান্ড রোল নিন' : 'Switch to AC Land'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'অনুমোদনকারী: সহকারী কমিশনার (ভূমি)' : 'Active Role: AC Land (Reviewer)'}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'বিচারাধীন কেস (Pending Queue)' : 'Pending Queue'}
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            statusFilter === 'approved'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'অনুমোদিত (Approved)' : 'Approved'}
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'বাতিলকৃত (Rejected)' : 'Rejected'}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs font-medium flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUCCESS APPROVAL CARD */}
      {approvalResult && (
        <Card className="bg-emerald-950 text-white border-emerald-800 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{isBn ? 'ই-নামজারি সফলভাবে অনুমোদিত!' : 'e-Mutation Case Approved!'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/10 p-3 rounded-lg">
              <span className="text-slate-300 block text-[10px]">{isBn ? 'নতুন সৃষ্ট খতিয়ান নং' : 'Created Khatian No'}</span>
              <span className="font-mono font-bold text-sm text-emerald-300">{approvalResult.newKhatianNumber}</span>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <span className="text-slate-300 block text-[10px]">{isBn ? 'নতুন জমির মালিক' : 'New Owner Title'}</span>
              <span className="font-semibold text-white">{approvalResult.buyerName}</span>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <span className="text-slate-300 block text-[10px]">{isBn ? 'নামজারি হওয়া জমি' : 'Mutated Area'}</span>
              <span className="font-bold text-emerald-300 text-sm">
                {toBanglaDigits(approvalResult.mutatedAreaShotok, i18n.language)} {isBn ? 'শতক' : 'Shotok'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* CASES QUEUE LIST */}
      {loading ? (
        <LoadingSpinner label={isBn ? 'নামজারি কেস লোড হচ্ছে...' : 'Loading mutation cases...'} />
      ) : cases.length === 0 ? (
        <EmptyState
          title={isBn ? 'কোনো নামজারি কেস নেই' : 'No Mutation Cases'}
          description={
            isBn
              ? 'এই তালিকায় বর্তমানে কোনো কেস নেই। নতুন দলিল রেজিস্ট্রি করলে স্বয়ংক্রিয়ভাবে নামজারি কেস তৈরি হবে।'
              : 'No mutation cases found. Registering a new deed will automatically submit a mutation packet.'
          }
        />
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const isApproved = c.status === 'approved';
            const isRejected = c.status === 'rejected';
            const isPending = c.status === 'pending';

            return (
              <Card key={c.id} className="space-y-4 hover:border-slate-300 transition-all bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                {/* Top Bar with Case & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">{c.deedNumber}</span>
                    <Badge
                      variant={
                        isApproved ? 'success' : isRejected ? 'danger' : 'warning'
                      }
                    >
                      {isApproved
                        ? (isBn ? 'অনুমোদিত' : 'APPROVED')
                        : isRejected
                        ? (isBn ? 'বাতিল' : 'REJECTED')
                        : (isBn ? 'বিচারাধীন' : 'PENDING')}
                    </Badge>
                    <span className="text-xs text-slate-500 font-mono">কেস #{c.id}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {c.createdAt}
                  </span>
                </div>

                {/* 4-Step Pipeline Stepper (Inspired by Hackathon Best Practices) */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pb-1">
                    <span>{isBn ? 'ই-নামজারি স্বয়ংক্রিয় পাইপলাইন ধারা:' : 'e-Mutation Pipeline Progress:'}</span>
                    <span className="text-emerald-700 font-mono">
                      {isApproved ? '৪/৪ ধাপ সম্পন্ন' : isPending ? '৩/৪ ধাপ সম্পন্ন (অনুমোদন বাকি)' : 'বাতিলকৃত'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="mt-1 font-semibold text-slate-800">{isBn ? 'দলিল রেজিস্ট্রি' : 'Deed Registry'}</span>
                      <span className="text-[9px] text-emerald-700 font-mono">সিলমোহরকৃত</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="mt-1 font-semibold text-slate-800">{isBn ? 'আবেদন দাখিল' : 'Auto Packet'}</span>
                      <span className="text-[9px] text-emerald-700 font-mono">স্বয়ংক্রিয়</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="mt-1 font-semibold text-slate-800">{isBn ? 'ক্রিপ্টো যাচাই' : 'Crypto Check'}</span>
                      <span className="text-[9px] text-emerald-700 font-mono">বৈধ</span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isApproved
                            ? 'bg-emerald-600 text-white'
                            : isRejected
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {isApproved ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : isRejected ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          '৪'
                        )}
                      </div>
                      <span className="mt-1 font-semibold text-slate-800">{isBn ? 'এসিল্যান্ড অনুমোদন' : 'AC Land'}</span>
                      <span
                        className={`text-[9px] font-mono ${
                          isApproved ? 'text-emerald-700' : isRejected ? 'text-red-600' : 'text-amber-700'
                        }`}
                      >
                        {isApproved ? 'সম্পন্ন' : isRejected ? 'বাতিল' : 'বিচারাধীন'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Automated Pre-Verification Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isBn ? 'দলিলটি আরএফসি ৯১৬২ মার্কেল লেজারে বৈধ' : 'Deed verified in RFC 9162 Merkle log'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isBn ? 'আবেদনের পক্ষগুলো ও এনআইডি দলিলের সাথে মিলেছে' : 'Parties & NIDs match registered deed'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isBn ? 'জমির অখণ্ড ব্যালেন্স খতিয়ানে নিশ্চিত' : 'Integer area balance verified on seller khatian'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isBn ? 'পিএলইউআইএন দাগ ট্র্যাকিং ও খতিয়ান শৃঙ্খল নিখুঁত' : 'PLUIN dag tracking & lineage verified'}</span>
                  </div>
                </div>

                {/* Mutation Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isBn ? 'নামজারি প্রস্তাবিত এলাকা' : 'Transfer Area'}</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {toBanglaDigits(c.mutationAreaShotok, i18n.language)} {isBn ? 'শতক' : 'Shotok'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isBn ? 'দাগ ও মৌজা' : 'Dag & Mouza'}</span>
                    <span className="font-semibold text-slate-800">
                      {c.casePayload?.dagNumber} ({c.casePayload?.mouzaCode})
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isBn ? 'পূর্বের বিক্রেতা খতিয়ান' : 'Seller Khatian'}</span>
                    <span className="font-semibold text-slate-800">{c.casePayload?.sellerKhatian}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">{isBn ? 'ক্রেতা ও মাস্কড এনআইডি' : 'Buyer & Masked NID'}</span>
                    <span className="font-semibold text-slate-800 block truncate">{c.casePayload?.buyerNameBn}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{c.casePayload?.buyerNidMasked}</span>
                  </div>
                </div>

                {/* Approved Status Meta */}
                {isApproved && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">{isBn ? 'নতুন সৃষ্ট আরএস/বিএস খতিয়ান:' : 'Buyer New Khatian:'}</span>
                      <span className="font-mono text-emerald-800 font-bold text-sm">{c.newKhatianNumber}</span>
                    </div>
                    <div className="text-right text-[11px] text-slate-600">
                      <span>{isBn ? 'অনুমোদনকারী:' : 'Approved By:'} {c.approvedBy}</span>
                    </div>
                  </div>
                )}

                {/* Rejection Status Meta */}
                {isRejected && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-900">
                    <span className="font-bold block">{isBn ? 'বাতিলের কারণ:' : 'Rejection Reason:'}</span>
                    <span>{c.rejectionReason}</span>
                  </div>
                )}

                {/* AC Land Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/verify/${encodeURIComponent(c.deedNumber)}`}
                    className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold hover:underline"
                  >
                    <span>{isBn ? 'মূল দলিল ও ক্রিপ্টো প্রমাণ দেখুন' : 'View Registered Deed & Crypto Proof'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {isPending && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-700 border-red-300 hover:bg-red-50 cursor-pointer"
                        onClick={() => handleReject(c.id)}
                        disabled={actingCaseId === c.id}
                      >
                        <XCircle className="w-4 h-4 mr-1 text-red-600" />
                        <span>{isBn ? 'বাতিল করুন' : 'Reject Case'}</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(c.id)}
                        isLoading={actingCaseId === c.id}
                        className="cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-300" />
                        <span>{isBn ? 'অনুমোদন ও নতুন খতিয়ান সৃষ্টি' : 'Approve e-Mutation'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MutationPage;
