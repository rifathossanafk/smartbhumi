import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useStore, hasPermission, updateReviewStatus } from '../store/useStore';
import { getVerificationUrl, formatTimestamp } from '../utils/crypto';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { RoleBadge } from '../components/RoleBadge';
import type { ReviewStatus } from '../types';
import {
  FileText,
  FileCheck2,
  MapPin,
  QrCode,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export const RecordDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, getRecordById, verificationEvents, getOwnershipByDag } = useStore();

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<ReviewStatus>('underReview');
  const [reviewSaved, setReviewSaved] = useState(false);

  const record = id ? getRecordById(id) : undefined;
  const currentLang = i18n.language;
  const isBn = currentLang === 'bn';

  if (!record) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">{isBn ? 'রেকর্ড পাওয়া যায়নি' : 'Record Not Found'}</h2>
        <p className="text-xs text-slate-600">{isBn ? 'এই নম্বরে কোনো নিবন্ধিত ভূমি রেকর্ড ডাটাবেসে পাওয়া যায়নি।' : 'No land deed record exists with this identifier.'}</p>
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'অনুসন্ধান পাতায় ফিরে যান' : 'Back to Search'}</span>
        </Link>
      </div>
    );
  }

  const plotOwnership = getOwnershipByDag(record.dagNumber, record.mouza);
  const verificationUrl = getVerificationUrl(record.deedNumber);
  const recordEvents = verificationEvents.filter(
    (e) => e.recordRef.toLowerCase() === record.deedNumber.toLowerCase()
  );

  const handleCopyHash = () => {
    navigator.clipboard.writeText(record.documentHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSaveReview = () => {
    if (!currentUser) return;
    updateReviewStatus(record.id, selectedReviewStatus, reviewNote, currentUser.role);
    setReviewSaved(true);
    setTimeout(() => setReviewSaved(false), 3000);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-sans">
                {record.deedNumber}
              </h1>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {t(`deedTypes.${record.deedType}`, record.deedType)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t('fields.registrationDate')}: {record.registrationDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/verify/${encodeURIComponent(record.deedNumber)}`}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{t('record.verifyDocument')}</span>
          </Link>
          <Link
            to={`/map?record=${record.id}`}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition"
          >
            <MapPin className="w-4 h-4" />
            <span>{t('nav.map')}</span>
          </Link>
        </div>
      </div>

      <DisclaimerBanner condensed />

      {/* Flagged Status Alert if applicable */}
      {(record.status === 'flagged' || record.status === 'under_review') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900">
            <h4 className="font-bold text-amber-950">
              {t('record.sections.warnings')}: {record.status === 'flagged' ? 'Flagged Inconsistency' : 'Under Review'}
            </h4>
            <p>{record.flagReason || 'Requires manual review by registry staff'}</p>
          </div>
        </div>
      )}

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Section: Location & Survey */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{t('record.sections.location')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">{t('fields.division')}:</span>
                <span className="font-semibold text-slate-800 capitalize">{record.division}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.district')}:</span>
                <span className="font-semibold text-slate-800 capitalize">{record.district}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.upazila')}:</span>
                <span className="font-semibold text-slate-800 capitalize">{record.upazila}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.mouza')}:</span>
                <span className="font-semibold text-slate-800">{record.mouza} (JL {record.jlNumber})</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.surveyType')}:</span>
                <span className="font-semibold text-slate-800">{record.surveyType} ({t(`surveys.${record.surveyType}`, record.surveyType)})</span>
              </div>
              <div>
                <span className="text-slate-400 block">{isBn ? 'জিপিএস স্থানাঙ্ক:' : 'GPS Coordinates:'}</span>
                <span className="font-mono text-slate-800">{record.lat.toFixed(4)}, {record.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Section: Khatian & Dag */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{t('record.sections.khatianDag')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">{t('fields.khatianType')}:</span>
                <span className="font-semibold text-slate-800">{record.khatianType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.khatianNumber')}:</span>
                <span className="font-semibold font-mono text-slate-800">{record.khatianNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.dagNumber')}:</span>
                <span className="font-semibold font-mono text-slate-800">{record.dagNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.landArea')}:</span>
                <span className="font-semibold text-slate-800">
                  {record.landArea} {t(`units.${record.landAreaUnit}`, record.landAreaUnit)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.landClassification')}:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {t(`landClass.${record.landClassification}`, record.landClassification)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.status')}:</span>
                <span className="font-semibold text-slate-800 capitalize">{record.status}</span>
              </div>
            </div>
          </div>

          {/* Section: Parties & Ownership */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('record.sections.parties')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-400 block">{t('fields.sellerRef')}:</span>
                <span className="font-mono font-bold text-slate-800">{record.sellerRef}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-400 block">{t('fields.buyerRef')}:</span>
                <span className="font-mono font-bold text-slate-800">{record.buyerRef}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-400 block">Deed Current Owner Ref:</span>
                <span className="font-mono font-bold text-slate-800">{record.ownerRef}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-slate-400 block">Registered Plot Owner Ref:</span>
                <span className="font-mono font-bold text-slate-800">
                  {plotOwnership ? plotOwnership.currentOwnerRef : 'No Plot Record'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Cryptographic Fingerprint */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>{t('record.sections.document')}</span>
              </h3>
              <button
                onClick={handleCopyHash}
                className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
              </button>
            </div>

            <p className="font-mono text-[11px] text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 break-all select-all">
              {record.documentHash}
            </p>
            <p className="text-[11px] text-slate-500">
              Registered original document: <strong>{record.documentName}</strong>
            </p>
          </div>
        </div>

        {/* Right Col: QR Code, Actions & Verification Trail */}
        <div className="space-y-6">
          {/* QR Code Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>{t('record.sections.qr')}</span>
            </h3>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 inline-block shadow-inner">
              <QRCodeSVG
                value={verificationUrl}
                size={160}
                level="M"
                includeMargin={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                Scanning this QR code opens the live verification page for {record.deedNumber}.
              </p>
              <button
                onClick={handleCopyUrl}
                className="w-full text-xs py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                {copiedUrl ? 'Verification URL Copied!' : 'Copy Verification URL'}
              </button>
            </div>
          </div>

          {/* Verification Activity on This Record */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{t('record.sections.verification')} ({recordEvents.length})</span>
            </h3>

            {recordEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">{t('record.noVerifications')}</p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {recordEvents.map((evt) => (
                  <div key={evt.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {t(`history.outcomes.${evt.outcome}`, evt.outcome)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTimestamp(evt.timestamp, currentLang)}
                      </span>
                    </div>
                    {evt.details && (
                      <p className="text-[11px] text-slate-600 leading-tight">{evt.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Workflow Box (Reviewer & Admin) */}
          {hasPermission(currentUser?.role, 'review') && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Reviewer Actions</span>
              </h3>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('flagged.currentStatus')}
                  </label>
                  <select
                    value={selectedReviewStatus}
                    onChange={(e) => setSelectedReviewStatus(e.target.value as ReviewStatus)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="new">{t('flagged.statuses.new')}</option>
                    <option value="underReview">{t('flagged.statuses.underReview')}</option>
                    <option value="additionalReview">{t('flagged.statuses.additionalReview')}</option>
                    <option value="completed">{t('flagged.statuses.completed')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('flagged.reviewNote')}
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder={t('flagged.reviewNotePlaceholder')}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <button
                  onClick={handleSaveReview}
                  className="w-full text-xs py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-sm transition"
                >
                  {t('flagged.updateStatus')}
                </button>

                {reviewSaved && (
                  <p className="text-[11px] text-emerald-700 text-center font-semibold">
                    Review status updated & audit logged!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
