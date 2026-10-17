import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useStore, hasPermission } from '../store/useStore';
import { DIVISIONS } from '../data/seedData';
import { computeFileHash, generateDeedNumber, generateId, validateFile, getVerificationUrl } from '../utils/crypto';
import { getSampleDocumentBlob, getSampleDocumentHash } from '../utils/sampleDocument';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { RoleBadge } from '../components/RoleBadge';
import type { LandRecord, UserRole } from '../types';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, login, addLandRecord, addEvent, getOwnershipByDag } = useStore();
  const isBn = i18n.language === 'bn';

  // Form state
  const [deedNumber, setDeedNumber] = useState(generateDeedNumber());
  const [deedType, setDeedType] = useState('sale');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);
  const [division, setDivision] = useState('dhaka');
  const [district, setDistrict] = useState('dhaka-d');
  const [upazila, setUpazila] = useState('savar');
  const [mouza, setMouza] = useState('Hemayetpur');
  const [mouzaCode, setMouzaCode] = useState('MOUZA-DEMO-001');
  const [jlNumber, setJlNumber] = useState('101');
  const [khatianType, setKhatianType] = useState('RS');
  const [khatianNumber, setKhatianNumber] = useState('KH-2026-0099');
  const [dagNumber, setDagNumber] = useState('DAG-2026-099');
  const [landArea, setLandArea] = useState(12);
  const [landAreaUnit, setLandAreaUnit] = useState('decimal');
  const [landClassification, setLandClassification] = useState('residential');
  const [surveyType, setSurveyType] = useState('RS');
  const [sellerRef, setSellerRef] = useState('SELLER-2026-099');
  const [buyerRef, setBuyerRef] = useState('BUYER-2026-099');
  const [ownerRef, setOwnerRef] = useState('SELLER-2026-099');
  const [notes, setNotes] = useState('Registered for demonstration purposes');

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [documentHash, setDocumentHash] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>('');

  // Submit / Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredRecord, setRegisteredRecord] = useState<LandRecord | null>(null);

  // Administrative chained selections
  const currentDiv = DIVISIONS.find((d) => d.id === division) || DIVISIONS[0];
  const currentDist = currentDiv.districts.find((d) => d.id === district) || currentDiv.districts[0];
  const currentUpz = currentDist.upazilas.find((u) => u.id === upazila) || currentDist.upazilas[0];

  const handleDivisionChange = (divId: string) => {
    setDivision(divId);
    const d = DIVISIONS.find((item) => item.id === divId);
    if (d && d.districts[0]) {
      setDistrict(d.districts[0].id);
      if (d.districts[0].upazilas[0]) {
        setUpazila(d.districts[0].upazilas[0].id);
        if (d.districts[0].upazilas[0].mouzas[0]) {
          const mz = d.districts[0].upazilas[0].mouzas[0];
          setMouza(mz.nameEn);
          setMouzaCode(mz.code);
          setJlNumber(mz.jlNumber);
        }
      }
    }
  };

  const handleDistrictChange = (distId: string) => {
    setDistrict(distId);
    const dist = currentDiv.districts.find((d) => d.id === distId);
    if (dist && dist.upazilas[0]) {
      setUpazila(dist.upazilas[0].id);
      if (dist.upazilas[0].mouzas[0]) {
        const mz = dist.upazilas[0].mouzas[0];
        setMouza(mz.nameEn);
        setMouzaCode(mz.code);
        setJlNumber(mz.jlNumber);
      }
    }
  };

  const handleUpazilaChange = (upzId: string) => {
    setUpazila(upzId);
    const upz = currentDist.upazilas.find((u) => u.id === upzId);
    if (upz && upz.mouzas[0]) {
      const mz = upz.mouzas[0];
      setMouza(mz.nameEn);
      setMouzaCode(mz.code);
      setJlNumber(mz.jlNumber);
    }
  };

  const handleMouzaChange = (mzId: string) => {
    const mz = currentUpz.mouzas.find((m) => m.id === mzId);
    if (mz) {
      setMouza(mz.nameEn);
      setMouzaCode(mz.code);
      setJlNumber(mz.jlNumber);
    }
  };

  // Handle uploaded file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setFileError(t(`register.errors.${validation.error}`));
      return;
    }

    setFileError('');
    setFile(selectedFile);
    setDocumentName(selectedFile.name);
    setIsHashing(true);

    try {
      const hash = await computeFileHash(selectedFile);
      setDocumentHash(hash);
    } catch (err) {
      setFileError('Could not compute cryptographic hash of file');
    } finally {
      setIsHashing(false);
    }
  };

  // Instant Default Sample File Button
  const handleUseSampleFile = async () => {
    setIsHashing(true);
    setFileError('');
    try {
      const hash = await getSampleDocumentHash();
      setDocumentHash(hash);
      setDocumentName(`demo_deed_${deedNumber}.pdf`);
      setFile(null); // Indicates using built-in synthetic blob
    } catch {
      setFileError('Failed to generate sample document hash');
    } finally {
      setIsHashing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentHash) {
      setFileError('Please attach a document or use the default demo document');
      return;
    }

    setIsSubmitting(true);

    // Consistency check against existing plot ownership
    const existingPlot = getOwnershipByDag(dagNumber, mouza);
    let recordStatus: 'active' | 'flagged' = 'active';
    let flagReason: string | undefined = undefined;

    if (existingPlot) {
      if (existingPlot.currentOwnerRef !== sellerRef) {
        recordStatus = 'flagged';
        flagReason = `Seller reference (${sellerRef}) does not match registered plot owner reference (${existingPlot.currentOwnerRef})`;
      }
    }

    const newRecord: LandRecord = {
      id: generateId('rec'),
      deedNumber,
      deedType,
      registrationDate,
      division,
      district,
      upazila,
      mouza,
      mouzaCode,
      jlNumber,
      khatianType,
      khatianNumber,
      dagNumber,
      landArea: Number(landArea),
      landAreaUnit,
      landClassification,
      surveyType,
      sellerRef,
      buyerRef,
      ownerRef,
      documentHash,
      documentName: documentName || `demo_deed_${deedNumber}.pdf`,
      notes,
      status: recordStatus,
      flagReason,
      lat: 23.8103 + (Math.random() - 0.5) * 0.1,
      lng: 90.4125 + (Math.random() - 0.5) * 0.1,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.role || 'officer',
      isSynthetic: true,
    };

    addLandRecord(newRecord);

    addEvent({
      recordRef: deedNumber,
      eventType: 'registration',
      outcome: recordStatus === 'flagged' ? 'flagged' : 'success',
      role: currentUser?.role || 'officer',
      uploadedHash: documentHash,
      expectedHash: documentHash,
      sellerRef,
      ownerRef,
      details: flagReason || 'Demo deed successfully registered with SHA-256 fingerprint',
    });

    setRegisteredRecord(newRecord);
    setIsSubmitting(false);
  };

  // If not logged in as officer or admin, show switch role prompt
  if (!hasPermission(currentUser?.role, 'register')) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {isBn ? 'নিবন্ধন কর্মকর্তা অনুমতি প্রয়োজন' : 'Land Officer Authorization Required'}
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          {isBn
            ? 'নতুন ভূমি দলিল নিবন্ধন ও ডিজিটাল সিলমোহর প্রদানের জন্য সংশ্লিষ্ট সাব-রেজিস্ট্রার বা সহকারী কমিশনার (ভূমি) হিসেবে লগইন করুন।'
            : 'To register new official land deeds, you must be signed in as an authorized Land Officer or Administrator.'}
        </p>
        <button
          onClick={() => login('officer')}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isBn ? 'ভূমি কর্মকর্তা হিসেবে প্রবেশ করুন' : 'Sign in as Land Officer'}</span>
        </button>
      </div>
    );
  }

  // Registration Success View
  if (registeredRecord) {
    const qrUrl = getVerificationUrl(registeredRecord.deedNumber);

    return (
      <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 font-sans">
              {t('register.success.title')}
            </h1>
            <p className="text-xs text-slate-600">
              {t('register.success.message')}
            </p>
          </div>

          {/* Record summary pill */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">{t('register.success.deedRef')}:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {registeredRecord.deedNumber}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{t('fields.mouza')}:</span>
              <span className="font-medium text-slate-800">{registeredRecord.mouza}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{t('fields.dagNumber')}:</span>
              <span className="font-medium text-slate-800">{registeredRecord.dagNumber}</span>
            </div>
          </div>

          {/* SHA-256 Hash Display */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('register.success.hash')}</span>
            </div>
            <p className="font-mono text-[11px] text-emerald-950 bg-white/80 p-2.5 rounded-lg border border-emerald-200/50 break-all select-all">
              {registeredRecord.documentHash}
            </p>
            <p className="text-[10px] text-emerald-700/90 leading-relaxed">
              {t('register.success.hashExplain')}
            </p>
          </div>

          {/* Generated QR Code */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block text-center space-y-3">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 inline-block">
              <QRCodeSVG
                value={qrUrl}
                size={180}
                level="M"
                includeMargin={true}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('register.success.qrCode')}</span>
              </div>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                {t('register.success.qrExplain')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to={`/verify/${encodeURIComponent(registeredRecord.deedNumber)}`}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20"
            >
              <span>{t('record.verifyDocument')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to={`/record/${registeredRecord.id}`}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              <span>{t('register.success.viewRecord')}</span>
            </Link>

            <button
              onClick={() => {
                setRegisteredRecord(null);
                setDeedNumber(generateDeedNumber());
                setDocumentHash('');
                setFile(null);
              }}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('register.success.registerAnother')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 font-sans">
            {t('register.title')}
          </h1>
          <p className="text-sm text-slate-600">
            {t('register.subtitle')}
          </p>
        </div>
        <RoleBadge role={currentUser.role} />
      </div>

      <DisclaimerBanner condensed />

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Section 1: Deed Reference & Category */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">1</span>
            <span>{t('register.steps.record')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.deedNumber')} *
              </label>
              <input
                type="text"
                required
                value={deedNumber}
                onChange={(e) => setDeedNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.deedType')}
              </label>
              <select
                value={deedType}
                onChange={(e) => setDeedType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="sale">{t('deedTypes.sale')}</option>
                <option value="gift">{t('deedTypes.gift')}</option>
                <option value="inheritance">{t('deedTypes.inheritance')}</option>
                <option value="exchange">{t('deedTypes.exchange')}</option>
                <option value="mortgage">{t('deedTypes.mortgage')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.registrationDate')}
              </label>
              <input
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Administrative Location & Survey */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">2</span>
            <span>{t('register.steps.location')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.division')}
              </label>
              <select
                value={division}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
              >
                {DIVISIONS.map((d) => (
                  <option key={d.id} value={d.id}>{isBn ? d.nameBn : d.nameEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.district')}
              </label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
              >
                {currentDiv.districts.map((d) => (
                  <option key={d.id} value={d.id}>{isBn ? d.nameBn : d.nameEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.upazila')}
              </label>
              <select
                value={upazila}
                onChange={(e) => handleUpazilaChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
              >
                {currentDist.upazilas.map((u) => (
                  <option key={u.id} value={u.id}>{isBn ? u.nameBn : u.nameEn}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.mouza')}
              </label>
              <select
                value={currentUpz.mouzas.find((m) => m.nameEn === mouza)?.id || ''}
                onChange={(e) => handleMouzaChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
              >
                {currentUpz.mouzas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {isBn ? m.nameBn : m.nameEn} (JL {m.jlNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.khatianType')}
              </label>
              <select
                value={khatianType}
                onChange={(e) => setKhatianType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
              >
                <option value="RS">RS (রিভিশনাল সার্ভে)</option>
                <option value="BS">BS (বাংলাদেশ সার্ভে)</option>
                <option value="CS">CS (কেডাস্ট্রাল সার্ভে)</option>
                <option value="SA">SA (স্টেট অ্যাকুইজিশন)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.khatianNumber')} *
              </label>
              <input
                type="text"
                required
                value={khatianNumber}
                onChange={(e) => setKhatianNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.dagNumber')} *
              </label>
              <input
                type="text"
                required
                value={dagNumber}
                onChange={(e) => setDagNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t('fields.landArea')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={landArea}
                  onChange={(e) => setLandArea(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t('fields.landAreaUnit')}
                </label>
                <select
                  value={landAreaUnit}
                  onChange={(e) => setLandAreaUnit(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                >
                  <option value="decimal">{t('units.decimal')}</option>
                  <option value="katha">{t('units.katha')}</option>
                  <option value="acre">{t('units.acre')}</option>
                  <option value="bigha">{t('units.bigha')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Parties & Ownership References */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">3</span>
            <span>{t('register.steps.parties')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.sellerRef')} *
              </label>
              <input
                type="text"
                required
                value={sellerRef}
                onChange={(e) => setSellerRef(e.target.value)}
                placeholder="SELLER-2026-XXX"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.buyerRef')} *
              </label>
              <input
                type="text"
                required
                value={buyerRef}
                onChange={(e) => setBuyerRef(e.target.value)}
                placeholder="BUYER-2026-XXX"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('fields.ownerRef')} *
              </label>
              <input
                type="text"
                required
                value={ownerRef}
                onChange={(e) => setOwnerRef(e.target.value)}
                placeholder="OWNER-2026-XXX"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Document Upload & Cryptographic Fingerprinting */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">4</span>
            <span>{t('register.steps.document')}</span>
          </h2>

          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center space-y-3 transition">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800">
                {t('register.dragDrop')}
              </p>
              <p className="text-[11px] text-slate-500">
                {t('register.uploadHint')}
              </p>
            </div>

            <input
              type="file"
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              Browse Files
            </label>

            {/* Quick Demo Document Button for Evaluators */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-2">
                — স্ট্যান্ডার্ড ফরম্যাট সরকারি দলিল সংযুক্ত করুন —
              </span>
              <button
                type="button"
                onClick={handleUseSampleFile}
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>মানসম্মত নমুনা দলিল সংযুক্ত করুন (Attach Standard Deed)</span>
              </button>
            </div>

            {isHashing && (
              <p className="text-xs text-emerald-600 font-medium animate-pulse">
                {t('register.calculating')}
              </p>
            )}

            {fileError && (
              <p className="text-xs text-red-600 font-medium">
                {fileError}
              </p>
            )}

            {documentHash && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 text-left border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>File Fingerprint Computed (SHA-256)</span>
                  </span>
                  <span className="text-[11px] font-normal text-emerald-700">
                    {documentName}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-emerald-950 bg-white p-2 rounded border border-emerald-200/60 break-all select-all">
                  {documentHash}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {t('fields.notes')}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isHashing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition hover:shadow"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering...' : t('register.submit')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
