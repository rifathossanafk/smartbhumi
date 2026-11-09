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
  Building
} from 'lucide-react';
import {
  fetchMutationCases,
  approveMutationCase,
  rejectMutationCase
} from '../api/client';
import { Button, Card, Badge, LoadingSpinner, EmptyState } from '../components/UIComponents';
import { toBanglaDigits } from '../styles/tokens';

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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isBn ? 'রেজিস্ট্রি হতে ই-নামজারি পাইপলাইন' : 'Registry to e-Mutation Pipeline'}
            </h1>
            <Badge variant="success">AC Land Court</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {isBn
              ? 'দলিল রেজিস্ট্রির সাথে সাথে স্বয়ংক্রিয় ই-নামজারি কেস তৈরি হয় এবং এসিল্যান্ড অনুমোদনে নতুন খতিয়ান সৃষ্টি হয়।'
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
              className="ml-2 px-2 py-1 bg-amber-200 hover:bg-amber-300 rounded text-[11px] font-bold text-amber-950"
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
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            statusFilter === 'pending'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'বিচারাধীন কেস (Pending Queue)' : 'Pending Queue'}
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            statusFilter === 'approved'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isBn ? 'অনুমোদিত (Approved)' : 'Approved'}
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
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
          {cases.map((c) => (
            <Card key={c.id} className="space-y-4 hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{c.deedNumber}</span>
                  <Badge
                    variant={
                      c.status === 'approved' ? 'success' : c.status === 'rejected' ? 'danger' : 'warning'
                    }
                  >
                    {c.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">Case #{c.id}</span>
                </div>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {c.createdAt}
                </span>
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
              {c.status === 'approved' && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">{isBn ? 'নতুন সৃষ্ট আরএস/বিএস খতিয়ান:' : 'Buyer New Khatian:'}</span>
                    <span className="font-mono text-emerald-800 font-bold text-sm">{c.newKhatianNumber}</span>
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    <span>অনুমোদনকারী: {c.approvedBy}</span>
                  </div>
                </div>
              )}

              {/* Rejection Status Meta */}
              {c.status === 'rejected' && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-900">
                  <span className="font-bold block">{isBn ? 'বাতিলের কারণ:' : 'Rejection Reason:'}</span>
                  <span>{c.rejectionReason}</span>
                </div>
              )}

              {/* 2-Click AC Land Action Bar (Only visible when pending) */}
              {c.status === 'pending' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-50"
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
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-300" />
                    <span>{isBn ? 'অনুমোদন ও নতুন খতিয়ান সৃষ্টি' : '2-Click Approve Mutation'}</span>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

