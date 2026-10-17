import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore, hasPermission, updateReviewStatus } from '../store/useStore';
import { RoleBadge } from '../components/RoleBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import type { ReviewStatus, LandRecord } from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Clock,
  Send,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export const FlaggedReviewPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, landRecords } = useStore();
  const isBn = i18n.language === 'bn';

  const [activeReviewRecord, setActiveReviewRecord] = useState<LandRecord | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus>('underReview');
  const [reviewNote, setReviewNote] = useState('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const flaggedRecords = landRecords.filter(
    (r) => r.status === 'flagged' || r.status === 'under_review'
  );

  const handleOpenReviewModal = (record: LandRecord) => {
    setActiveReviewRecord(record);
    setSelectedStatus(record.reviewStatus || 'underReview');
    setReviewNote('');
    setStatusMessage('');
  };

  const handleSaveReview = () => {
    if (!activeReviewRecord || !currentUser) return;

    updateReviewStatus(
      activeReviewRecord.id,
      selectedStatus,
      reviewNote || 'Status updated by verification reviewer',
      currentUser.role
    );

    setStatusMessage(isBn ? 'পর্যালোচনার অবস্থান সফলভাবে আপডেট হয়েছে' : 'Review status updated successfully');
    setTimeout(() => {
      setActiveReviewRecord(null);
      setStatusMessage('');
    }, 1500);
  };

  // If user does not have permission, show access denied message
  if (!hasPermission(currentUser?.role, 'review')) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {isBn ? 'প্রবেশাধিকার নেই' : 'Access Restricted'}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {isBn
              ? 'বিরোধপূর্ণ রেকর্ড পর্যালোচনা ও শুনানির জন্য সহকারী কমিশনার (ভূমি) বা মহাপরিচালক অ্যাকাউন্ট প্রয়োজন। অনুগ্রহ করে উপযুক্ত পরিচয়পত্র দিয়ে লগইন করুন।'
              : 'Access to the Dispute Review Panel requires an AC Land (Assistant Commissioner of Land) or Admin account. Please log in with the appropriate authorized credentials.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'ড্যাশবোর্ডে ফিরে যান' : 'Return to Dashboard'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-sans">
              {t('flagged.title')}
            </h1>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {flaggedRecords.length} {isBn ? 'কেস' : 'Cases'}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            {t('flagged.subtitle')}
          </p>
        </div>
        {currentUser && <RoleBadge role={currentUser.role} />}
      </div>

      <DisclaimerBanner condensed />

      {/* Flagged Cases List */}
      <div className="space-y-4">
        {flaggedRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">{t('flagged.noFlagged')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isBn
                ? 'সকল নিবন্ধিত দলিলের মালিকানা রেফারেন্স সামঞ্জস্যপূর্ণ এবং ডকুমেন্ট হ্যাশ যাচাইকৃত।'
                : 'All registered deeds have matching ownership references and verified document hashes.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flaggedRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        {record.deedNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">
                        {t(`deedTypes.${record.deedType}`, record.deedType)}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {record.reviewStatus ? t(`flagged.statuses.${record.reviewStatus}`) : (isBn ? 'নতুন' : 'New')}
                    </span>
                  </div>

                  {/* Reason Flagged Callout */}
                  <div className="bg-red-50/60 p-3 rounded-xl border border-red-100 text-xs text-red-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>{t('flagged.reason')}:</span>
                    </span>
                    <p className="leading-relaxed text-red-800 font-medium">
                      {record.flagReason || (isBn ? 'মালিকানা সামঞ্জস্য পরীক্ষা ব্যর্থ হয়েছে।' : 'Ownership consistency check failed.')}
                    </p>
                  </div>

                  {/* Record references */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block">{t('fields.mouza')}:</span>
                      <span className="font-medium text-slate-800">{record.mouza}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('fields.dagNumber')}:</span>
                      <span className="font-medium text-slate-800">{record.dagNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('fields.sellerRef')}:</span>
                      <span className="font-mono text-slate-800 font-semibold">{record.sellerRef}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{t('fields.ownerRef')}:</span>
                      <span className="font-mono text-slate-800 font-semibold">{record.ownerRef}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs">
                    <Link
                      to={`/record/${record.id}`}
                      className="text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      <span>{t('flagged.viewRecord')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <Link
                      to={`/verify/${encodeURIComponent(record.deedNumber)}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                    >
                      <span>{isBn ? 'যাচাই করুন' : 'Verify'}</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => handleOpenReviewModal(record)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition"
                  >
                    {isBn ? 'কেস পর্যালোচনা' : 'Review Case'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Workflow Modal */}
      {activeReviewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {activeReviewRecord.deedNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {isBn ? 'পর্যালোচনা ও অবস্থান আপডেট' : 'Case Review & Status Update'}
                </h3>
              </div>
              <button
                onClick={() => setActiveReviewRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="bg-red-50/70 p-3 rounded-xl border border-red-100 text-xs text-red-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>{isBn ? 'পতাকা কারণ:' : 'Flag Reason:'}</strong> {activeReviewRecord.flagReason}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('flagged.updateStatus')}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ReviewStatus)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                >
                  <option value="new">{t('flagged.statuses.new')}</option>
                  <option value="underReview">{t('flagged.statuses.underReview')}</option>
                  <option value="additionalReview">{t('flagged.statuses.additionalReview')}</option>
                  <option value="completed">{t('flagged.statuses.completed')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('flagged.reviewNote')}
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={t('flagged.reviewNotePlaceholder')}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                />
              </div>
            </div>

            {statusMessage && (
              <p className="text-xs text-emerald-700 font-semibold text-center bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                {statusMessage}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveReviewRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBn ? 'পর্যালোচনা সংরক্ষণ করুন' : 'Save Review Status'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
