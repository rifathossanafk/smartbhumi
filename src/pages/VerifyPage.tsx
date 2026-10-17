import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { computeFileHash, computeBufferHash, validateFile } from '../utils/crypto';
import {
  getSampleDocumentBlob,
  getModifiedDocumentBlob,
  downloadSampleDocument,
  downloadModifiedDocument,
} from '../utils/sampleDocument';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import type { LandRecord, PlotOwnership, VerificationOutcome } from '../types';
import {
  FileCheck2,
  Search,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileQuestion,
  Lock,
  Download,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Building,
} from 'lucide-react';

export const VerifyPage: React.FC = () => {
  const { deedNumber: routeDeedNumber } = useParams<{ deedNumber?: string }>();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const navigate = useNavigate();
  const {
    currentUser,
    getRecordByDeedNumber,
    getOwnershipByDag,
    addEvent,
  } = useStore();

  const [inputDeedNumber, setInputDeedNumber] = useState(routeDeedNumber || '');
  const [activeRecord, setActiveRecord] = useState<LandRecord | null>(null);
  const [plotOwnership, setPlotOwnership] = useState<PlotOwnership | null>(null);
  const [searchedNotFound, setSearchedNotFound] = useState(false);

  // File & hash verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedHash, setUploadedHash] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [hasVerified, setHasVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    hashMatched: boolean;
    ownershipMatched: 'match' | 'mismatch' | 'notFound';
  } | null>(null);

  // If URL has deedNumber on mount or change, search immediately
  useEffect(() => {
    if (routeDeedNumber) {
      setInputDeedNumber(routeDeedNumber);
      handleLookup(routeDeedNumber);
    }
  }, [routeDeedNumber]);

  const handleLookup = (deedToSearch: string) => {
    const cleanNumber = deedToSearch.trim();
    if (!cleanNumber) return;

    setSearchedNotFound(false);
    setHasVerified(false);
    setVerificationResult(null);
    setUploadedHash('');
    setUploadedFile(null);
    setUploadError('');

    const record = getRecordByDeedNumber(cleanNumber);
    if (record) {
      setActiveRecord(record);
      // Retrieve corresponding plot ownership
      const ownership = getOwnershipByDag(record.dagNumber, record.mouza);
      setPlotOwnership(ownership || null);
    } else {
      setActiveRecord(null);
      setPlotOwnership(null);
      setSearchedNotFound(true);

      // Log unknown lookup attempt
      addEvent({
        recordRef: cleanNumber,
        eventType: 'unknownLookup',
        outcome: 'notFound',
        role: currentUser?.role || 'citizen',
        details: `Search attempted for unregistered deed reference: ${cleanNumber}`,
      });
    }
  };

  const executeVerification = async (hashToVerify: string, fileName: string) => {
    if (!activeRecord) return;

    setIsVerifying(true);
    setUploadedHash(hashToVerify);

    // 1. Cryptographic Document Match
    const hashMatched =
      activeRecord.documentHash.toLowerCase() === hashToVerify.toLowerCase();

    // 2. Ownership Consistency Check
    let ownershipMatched: 'match' | 'mismatch' | 'notFound' = 'notFound';
    if (plotOwnership) {
      if (activeRecord.sellerRef === plotOwnership.currentOwnerRef) {
        ownershipMatched = 'match';
      } else {
        ownershipMatched = 'mismatch';
      }
    }

    setVerificationResult({
      hashMatched,
      ownershipMatched,
    });
    setHasVerified(true);
    setIsVerifying(false);

    // 3. Log event into persistent store
    let outcome: VerificationOutcome = 'verified';
    if (!hashMatched) {
      outcome = 'mismatch';
    } else if (ownershipMatched === 'mismatch') {
      outcome = 'reviewRequired';
    }

    addEvent({
      recordRef: activeRecord.deedNumber,
      eventType: hashMatched ? 'verification' : 'verificationFailed',
      outcome,
      role: currentUser?.role || 'citizen',
      uploadedHash: hashToVerify,
      expectedHash: activeRecord.documentHash,
      sellerRef: activeRecord.sellerRef,
      ownerRef: plotOwnership?.currentOwnerRef,
      details: hashMatched
        ? ownershipMatched === 'match'
          ? 'File SHA-256 matched & seller matches recorded plot owner'
          : `File SHA-256 matched, but seller (${activeRecord.sellerRef}) differs from recorded plot owner (${plotOwnership?.currentOwnerRef || 'NONE'})`
        : `File SHA-256 mismatch detected for ${fileName}`,
    });
  };

  // Upload user file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeRecord) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(t(`register.errors.${validation.error}`));
      return;
    }

    setUploadError('');
    setUploadedFile(file);

    try {
      const hash = await computeFileHash(file);
      await executeVerification(hash, file.name);
    } catch {
      setUploadError('Failed to calculate SHA-256 fingerprint for uploaded file.');
    }
  };

  // One-click Test Original Document
  const handleTestOriginal = async () => {
    if (!activeRecord) return;
    setUploadError('');
    try {
      const blob = getSampleDocumentBlob();
      const buffer = await blob.arrayBuffer();
      const hash = await computeBufferHash(buffer);
      await executeVerification(hash, 'demo_deed_original.pdf');
    } catch {
      setUploadError('Failed to test original document.');
    }
  };

  // One-click Test Modified Document
  const handleTestModified = async () => {
    if (!activeRecord) return;
    setUploadError('');
    try {
      const blob = getModifiedDocumentBlob();
      const buffer = await blob.arrayBuffer();
      const hash = await computeBufferHash(buffer);
      await executeVerification(hash, 'demo_deed_modified.pdf');
    } catch {
      setUploadError('Failed to test modified document.');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 font-sans">
          {t('verify.title')}
        </h1>
        <p className="text-sm text-slate-600">
          {t('verify.subtitle')}
        </p>
      </div>

      <DisclaimerBanner condensed />

      {/* Search Bar & Quick Test Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
          {t('verify.searchByRef')}
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputDeedNumber}
              onChange={(e) => setInputDeedNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup(inputDeedNumber)}
              placeholder={t('verify.refPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 text-sm font-mono font-medium"
            />
          </div>
          <button
            onClick={() => handleLookup(inputDeedNumber)}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-sm transition"
          >
            <Search className="w-4 h-4" />
            <span>{t('verify.searchBtn')}</span>
          </button>
        </div>

        {/* Quick Test Presets */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {isBn ? 'নমুনা নিবন্ধিত দলিলসমূহ (Quick-Select Sample Deeds):' : 'Registered Sample Deeds for Verification:'}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setInputDeedNumber('LP-2026-001');
                handleLookup('LP-2026-001');
              }}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>LP-2026-001 (Valid Original Match)</span>
            </button>

            <button
              onClick={() => {
                setInputDeedNumber('LP-2026-002');
                handleLookup('LP-2026-002');
              }}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>LP-2026-002 (Seller-Owner Mismatch)</span>
            </button>

            <button
              onClick={() => {
                setInputDeedNumber('LP-2026-005');
                handleLookup('LP-2026-005');
              }}
              className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5"
            >
              <FileQuestion className="w-3.5 h-3.5 text-teal-700" />
              <span>LP-2026-005 (Missing Plot Ownership)</span>
            </button>

            <button
              onClick={() => {
                setInputDeedNumber('LP-UNKNOWN-999');
                handleLookup('LP-UNKNOWN-999');
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition font-medium"
            >
              <span>LP-UNKNOWN-999 (Unregistered Deed)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Case 1: Record Not Found */}
      {searchedNotFound && (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center space-y-4 shadow-sm animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {t('verify.results.notFound')}
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {t('verify.results.notFoundExplain')}
            </p>
          </div>
          <div className="pt-2">
            <span className="text-xs font-mono bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">
              Searched: {inputDeedNumber}
            </span>
          </div>
        </div>
      )}

      {/* Case 2: Record Found & Loaded */}
      {activeRecord && (
        <div className="space-y-6 animate-fade-in">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {activeRecord.deedNumber}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {t(`deedTypes.${activeRecord.deedType}`, activeRecord.deedType)}
                </span>
              </div>
              <Link
                to={`/record/${activeRecord.id}`}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>{t('search.viewDetails')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Grid Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">{t('fields.mouza')}:</span>
                <span className="font-semibold text-slate-800">{activeRecord.mouza}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.khatianNumber')}:</span>
                <span className="font-semibold text-slate-800">
                  {activeRecord.khatianType} — {activeRecord.khatianNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.dagNumber')}:</span>
                <span className="font-semibold text-slate-800">
                  {activeRecord.dagNumber} ({activeRecord.landArea} {t(`units.${activeRecord.landAreaUnit}`, activeRecord.landAreaUnit)})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t('fields.registrationDate')}:</span>
                <span className="font-semibold text-slate-800">{activeRecord.registrationDate}</span>
              </div>
            </div>

            {/* Registered Expected Hash (Read-Only) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('verify.results.expectedHash')}</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  {activeRecord.documentName}
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200 break-all select-all">
                {activeRecord.documentHash}
              </p>
            </div>
          </div>

          {/* Verification Actions Zone */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <span>{t('verify.uploadForVerify')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('verify.uploadHint')}
              </p>
            </div>

            {/* File Drag/Upload Box */}
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center space-y-3 transition bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <input
                type="file"
                id="verify-file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="verify-file"
                className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm"
              >
                {isBn ? 'কম্পিউটার/মোবাইল থেকে দলিল ফাইল আপলোড করুন' : 'Choose Local Deed File to Verify'}
              </label>

              {/* Instant Verification Pre-sets */}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">
                  {isBn ? 'সরাসরি ডিজিটাল ফাইল অখণ্ডতা পরীক্ষা:' : 'Direct Digital File Integrity Check:'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={handleTestOriginal}
                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isBn ? 'অনুমোদিত মূল দলিল ফাইল পরীক্ষা (বৈধ)' : 'Test Authentic Registered Deed (Pass)'}</span>
                  </button>

                  <button
                    onClick={handleTestModified}
                    className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>{isBn ? 'বিকৃত/জাল দলিল পরীক্ষা (ব্যর্থ)' : 'Test Altered Deed File (Fail)'}</span>
                  </button>
                </div>
              </div>

              {/* Download buttons for physical inspection */}
              <div className="pt-1 flex items-center justify-center gap-3 text-[11px] text-slate-500">
                <button
                  onClick={() => downloadSampleDocument()}
                  className="hover:text-emerald-700 flex items-center gap-1 underline"
                >
                  <Download className="w-3 h-3" />
                  <span>{isBn ? 'নমুনা দলিল PDF ডাউনলোড করুন' : 'Download sample PDF'}</span>
                </button>
                <span>•</span>
                <button
                  onClick={() => downloadModifiedDocument()}
                  className="hover:text-red-700 flex items-center gap-1 underline"
                >
                  <Download className="w-3 h-3" />
                  <span>Download altered PDF</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-red-600 font-semibold">{uploadError}</p>
            )}
          </div>

          {/* VERIFICATION RESULTS PANEL */}
          {hasVerified && verificationResult && (
            <div className="space-y-4 animate-fade-in">
              {/* 1. Cryptographic Document Verification Result */}
              <div
                className={`rounded-2xl border p-6 shadow-sm space-y-4 ${
                  verificationResult.hashMatched
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-red-50/70 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      verificationResult.hashMatched
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {verificationResult.hashMatched ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                          verificationResult.hashMatched
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-red-200 text-red-900'
                        }`}
                      >
                        {verificationResult.hashMatched ? 'VERIFIED' : 'DOCUMENT MISMATCH'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        {verificationResult.hashMatched
                          ? t('verify.results.verified')
                          : t('verify.results.mismatch')}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {verificationResult.hashMatched
                        ? t('verify.results.verifiedExplain')
                        : t('verify.results.mismatchExplain')}
                    </p>
                  </div>
                </div>

                {/* Hashes Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {t('verify.results.expectedHash')} (Original):
                    </span>
                    <p className="font-mono text-[10px] text-slate-800 break-all select-all">
                      {activeRecord.documentHash}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {t('verify.results.uploadedHash')} (Calculated):
                    </span>
                    <p
                      className={`font-mono text-[10px] break-all select-all ${
                        verificationResult.hashMatched ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'
                      }`}
                    >
                      {uploadedHash}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Synthetic Ownership-Consistency Check Result */}
              <div
                className={`rounded-2xl border p-6 shadow-sm space-y-4 ${
                  verificationResult.ownershipMatched === 'match'
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      verificationResult.ownershipMatched === 'match'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {verificationResult.ownershipMatched === 'match' ? (
                      <UserCheck className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                          verificationResult.ownershipMatched === 'match'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {verificationResult.ownershipMatched === 'match'
                          ? 'OWNERSHIP MATCH'
                          : 'MANUAL REVIEW REQUIRED'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        {verificationResult.ownershipMatched === 'match'
                          ? t('verify.results.ownershipMatch')
                          : verificationResult.ownershipMatched === 'notFound'
                          ? t('verify.results.ownershipNotFound')
                          : t('verify.results.ownershipMismatch')}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {verificationResult.ownershipMatched === 'match'
                        ? t('verify.results.ownershipMatchExplain')
                        : verificationResult.ownershipMatched === 'notFound'
                        ? t('verify.results.ownershipNotFoundExplain')
                        : t('verify.results.ownershipMismatchExplain', {
                            seller: activeRecord.sellerRef,
                            owner: plotOwnership?.currentOwnerRef || 'NONE',
                          })}
                    </p>
                  </div>
                </div>

                {/* Plot & Parties Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">{t('fields.sellerRef')}:</span>
                    <span className="font-mono font-bold text-slate-800">{activeRecord.sellerRef}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Recorded Plot Owner:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {plotOwnership ? plotOwnership.currentOwnerRef : 'No Record Found'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Consistency Check:</span>
                    <span
                      className={`font-semibold ${
                        verificationResult.ownershipMatched === 'match'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {verificationResult.ownershipMatched === 'match'
                        ? 'Passed (মিলেছে)'
                        : 'Review Needed (অসঙ্গতি)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Limitation Note */}
              <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                <strong>{t('verify.results.verifiedNote')}</strong>
                <p className="mt-1 text-[11px] text-emerald-900/80">
                  {isBn
                    ? 'এই প্ল্যাটফর্মটি ক্রিপ্টোগ্রাফিক ফাইল অখণ্ডতা ও কেন্দ্রীয় ক্যাডাস্ট্রাল দাগের মালিকানা তথ্য যাচাই করে। ডিজিটাল দলিলের পাশাপাশি মাঠপর্যায়ের নামজারি ও সীমানা রেকর্ড নিশ্চিত করুন।'
                    : 'This platform cryptographically validates digital deed file integrity and cadastral plot-owner registry matching under Ministry of Land standards.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
