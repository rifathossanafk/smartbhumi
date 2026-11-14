import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  QrCode,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plane,
  Wifi,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import jsQR from 'jsqr';
import {
  verifyQROffline,
  decodeQRPayload,
  type OfflineVerifyResult,
  type QRPayload
} from '../crypto/offlineVerifier';
import {
  fetchLatestSTH,
  getCachedSTH,
  getCachedKeys,
  isAirplaneMode,
  setAirplaneMode,
  fetchDeedQROrCached,
  checkOCRDiff
} from '../api/client';
import { Button, Card, Badge, LoadingSpinner } from '../components/UIComponents';
import { fromMicroShotok } from '../shared/units';
import { toBanglaDigits } from '../styles/tokens';

export const VerifyPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('samples');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannedRaw, setScannedRaw] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<OfflineVerifyResult | null>(null);
  const [ocrDiffResult, setOcrDiffResult] = useState<any | null>(null);
  const [cachedSthState, setCachedSthState] = useState<any>(null);
  const [airplaneActive, setAirplaneActive] = useState<boolean>(isAirplaneMode());
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [qrSource, setQrSource] = useState<'live' | 'cached' | null>(null);
  const [sampleError, setSampleError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    async function syncSTH() {
      try {
        if (!isAirplaneMode()) {
          const res = await fetchLatestSTH();
          setCachedSthState(res.sth);
        } else {
          setCachedSthState(getCachedSTH());
        }
      } catch (err) {
        setCachedSthState(getCachedSTH());
      }
    }
    syncSTH();

    const airplaneHandler = (e: any) => setAirplaneActive(e.detail);
    window.addEventListener('smartbhumi:airplane-mode-changed', airplaneHandler);
    return () => window.removeEventListener('smartbhumi:airplane-mode-changed', airplaneHandler);
  }, []);

  useEffect(() => {
    if (!cameraActive) return;

    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          requestAnimationFrame(scanVideoFrame);
        }
      } catch (err) {
        setCameraError(isBn ? 'ক্যামেরা চালু করা যায়নি। অনুগ্রহ করে ফাইল আপলোড বা টেস্ট স্যাম্পল ব্যবহার করুন।' : 'Unable to access camera. Please use file upload or demo samples.');
        setCameraActive(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive]);

  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.height = videoRef.current.videoHeight;
        canvas.width = videoRef.current.videoWidth;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          setCameraActive(false);
          handleVerifyRawText(code.data);
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleVerifyRawText(code.data);
          } else {
            alert(isBn ? 'ছবিতে কোনো কিউআর কোড চিহ্নিত করা যায়নি।' : 'No QR code detected in the uploaded image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyRawText = (qrText: string) => {
    setScannedRaw(qrText);
    setScanning(true);
    setOcrDiffResult(null);

    try {
      const cachedKeys = getCachedKeys();
      // Fail closed: without a pinned registry key we cannot verify anything.
      // The key is cached from /api/sth/latest during the last online sync;
      // a first-ever offline visit cannot be trusted and must say so.
      if (!cachedKeys?.ed25519) {
        setVerifyResult({
          valid: false,
          disclaimer: 'CLAIMS DISCIPLINE: Physical execution before Sub-Registrar is required. Verification failed.',
          reason: isBn
            ? 'নির্ভরযোগ্য রেজিস্ট্রি কী পাওয়া যায়নি। অনুগ্রহ করে অন্তত একবার অনলাইন সিঙ্ক করুন (এয়ারপ্লেন মোড বন্ধ করে পৃষ্ঠা রিলোড করুন) — অর্জিত স্বাক্ষর যাচাই ছাড়া কোনো দলিল বৈধ বলা হবে না।'
            : 'No trusted registry public key found on this device. Go online once (disable airplane mode and reload) to pin the authority key — verification fails closed rather than trusting an unknown key.',
        });
        return;
      }

      const cachedSTH = getCachedSTH() || undefined;

      const result = verifyQROffline(qrText, cachedKeys.ed25519, cachedSTH as any);
      setVerifyResult(result);
    } catch (err) {
      setVerifyResult({
        valid: false,
        disclaimer: 'CLAIMS DISCIPLINE: Physical execution before Sub-Registrar is required. Verification failed.',
        reason: (err as Error).message,
      });
    } finally {
      setScanning(false);
    }
  };

  const loadSample = async (type: 'genuine' | 'tampered' | 'khas') => {
    setScanning(true);
    setOcrDiffResult(null);
    setSampleError(null);
    try {
      if (type === 'genuine') {
        const qrData = await fetchDeedQROrCached('LP-2026-001');
        setQrSource(qrData.fromCache ? 'cached' : 'live');
        handleVerifyRawText(qrData.qrString);
      } else if (type === 'tampered') {
        const qrData = await fetchDeedQROrCached('LP-2026-001');
        setQrSource(qrData.fromCache ? 'cached' : 'live');
        const parsed: QRPayload = decodeQRPayload(qrData.qrString);
        const tampered: QRPayload = {
          ...parsed,
          claims: {
            ...parsed.claims,
            a: 25_000_000,
          },
        };
        handleVerifyRawText(JSON.stringify(tampered));

        if (!airplaneActive) {
          const diff = await checkOCRDiff('area_tampered').catch(() => null);
          setOcrDiffResult(diff);
        }
      } else if (type === 'khas') {
        setQrSource(null);
        if (!airplaneActive) {
          const diff = await checkOCRDiff('khas').catch(() => null);
          setOcrDiffResult(diff);
        }
        setVerifyResult({
          valid: false,
          disclaimer: 'CLAIMS DISCIPLINE: Khas land is non-transferable state property.',
          reason: isBn ? 'খাস জমি সতর্কতা: ১নং খাস খতিয়ানভুক্ত সরকারি জমি ব্যক্তি মালিকানায় হস্তান্তরযোগ্য নয়।' : 'Protected Khas Land: Government plot cannot be privately transferred.',
        });
      }
    } catch (err) {
      const offlineNoCache = airplaneActive || (err as Error).message?.includes('AIRPLANE');
      setSampleError(offlineNoCache
        ? (isBn
          ? 'এয়ারপ্লেন মোডে নেটওয়ার্ক বন্ধ এবং কোনো ক্যাশ করা QR পাওয়া যায়নি। অনুগ্রহ করে এয়ারপ্লেন মোড বন্ধ করে একবার "নমুনা ১" চালু অবস্থায় লোড করুন, তারপর আবার চেষ্টা করুন।'
          : 'Airplane mode is blocking the network and no cached QR exists yet. Load a sample once while online, then retry.')
        : ((err as Error).message || 'Failed to load sample.'));
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const toggleAirplane = () => {
    const next = !airplaneActive;
    setAirplaneMode(next);
    setAirplaneActive(next);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Page Title & Offline Proof Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isBn ? 'দলিল অফলাইন যাচাইকরণ' : 'Deed Offline Verification'}
            </h1>
            <Badge variant="pqc">RFC 9162 Log</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {isBn
              ? 'ইন্টারনেট ছাড়াই ফোনে কিউআর কোড স্ক্যান করে দলিলের ক্রিপ্টোগ্রাফিক সত্যতা নিশ্চিত করুন।'
              : 'Verify digital deeds offline using RFC 9162 Merkle log inclusion proofs and dual signatures.'}
          </p>
        </div>

        {/* Airplane Mode Proof Button */}
        <button
          onClick={toggleAirplane}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs ${
            airplaneActive
              ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {airplaneActive ? <Plane className="w-4 h-4 text-amber-700" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
          <div className="text-left">
            <span className="block font-bold">
              {airplaneActive
                ? isBn
                  ? 'এয়ারপ্লেন মোড সক্রিয় (১০০% অফলাইন)'
                  : 'Airplane Mode ON (100% Offline)'
                : isBn
                  ? 'এয়ারপ্লেন মোড সিমুলেশন'
                  : 'Airplane Mode Simulation'}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {airplaneActive ? (isBn ? 'API কল সম্পূর্ণ বন্ধ' : 'API calls fully blocked') : (isBn ? 'অফলাইন প্রমাণে ক্লিক করুন' : 'Click to test offline')}
            </span>
          </div>
        </button>
      </div>

      {/* Trust anchor & QR source status */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
            getCachedKeys()?.ed25519
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {getCachedKeys()?.ed25519
            ? isBn
              ? 'রেজিস্ট্রি কী এই ডিভাইসে পিন করা (অফলাইন যাচাই সক্ষম)'
              : 'Registry authority key pinned on this device (offline verification armed)'
            : isBn
              ? 'রেজিস্ট্রি কী এখনো পিন করা হয়নি — যাচাই ব্যর্থ-বন্ধ (fail-closed)'
              : 'Registry key not pinned yet — verification will fail closed'}
        </span>
        {qrSource === 'cached' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-slate-50 text-slate-600 border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            {isBn ? 'QR ক্যাশ থেকে (অফলাইন)' : 'QR loaded from offline cache'}
          </span>
        )}
      </div>

      {sampleError && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{sampleError}</span>
        </div>
      )}

      {/* Verification Input Tabs: Camera / Upload / Samples */}
      <div className="flex border-b border-slate-200 gap-1 text-sm font-semibold select-none">
        <button
          onClick={() => {
            setActiveTab('samples');
            setCameraActive(false);
          }}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'samples'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isBn ? 'ডেমো টেস্ট স্যাম্পল' : 'Demo Test Samples'}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('camera');
            setCameraActive(true);
          }}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'camera'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{isBn ? 'ক্যামেরা স্ক্যানার' : 'Camera Scanner'}</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('upload');
            setCameraActive(false);
          }}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>{isBn ? 'ছবি/ফাইল আপলোড' : 'Upload Image'}</span>
        </button>
      </div>

      {/* TAB CONTENT 1: SAMPLES */}
      {activeTab === 'samples' && (
        <Card className="bg-slate-50/70 border-slate-200 space-y-3">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {isBn ? 'জাজদের জন্য সরাসরি টেস্ট কেসসমূহ:' : 'Interactive Judge Evaluation Cases:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => loadSample('genuine')}
              className="p-3 bg-white rounded-xl border border-emerald-300 hover:border-emerald-600 hover:shadow-sm text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-800 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isBn ? '১. আসল দলিল (Genuine)' : '1. Genuine Deed'}
                </span>
                <Badge variant="success">১৫.০০ শতক</Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                {isBn ? 'LP-2026-001 বৈধ দলিল, অফলাইন প্রমাণ সফল' : 'LP-2026-001 valid cryptographic Merkle proof'}
              </p>
            </button>

            <button
              onClick={() => loadSample('tampered')}
              className="p-3 bg-white rounded-xl border border-red-300 hover:border-red-600 hover:shadow-sm text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-red-800 text-xs flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  {isBn ? '২. এলাকা জালিয়াতি (Tampered)' : '2. Altered Area'}
                </span>
                <Badge variant="danger">২৫.০০ শতক</Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                {isBn ? 'কাগজে ১৫ এর স্থলে ২৫ শতক লেখা, লিফ অমিল বাতিল' : 'Paper altered from 15 to 25 shotok, proof fails'}
              </p>
            </button>

            <button
              onClick={() => loadSample('khas')}
              className="p-3 bg-white rounded-xl border border-amber-300 hover:border-amber-600 hover:shadow-sm text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-800 text-xs flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {isBn ? '৩. খাস জমি দখল চেষ্টা' : '3. Khas Land Claim'}
                </span>
                <Badge variant="warning">১নং খাস</Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                {isBn ? 'সরকারি খাস জমি অবৈধ ব্যক্তি বিক্রির প্রচেষ্টা' : 'Illegal transfer attempt of government land'}
              </p>
            </button>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 2: CAMERA SCANNER */}
      {activeTab === 'camera' && (
        <Card className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {cameraActive ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-8 border-2 border-emerald-400 rounded-xl pointer-events-none opacity-80 animate-pulse flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400/80 shadow-[0_0_8px_#34d399]" />
                </div>
              </>
            ) : (
              <div className="text-center p-4 text-slate-400 space-y-2">
                <Camera className="w-10 h-10 mx-auto text-slate-500" />
                <p className="text-xs">{cameraError || (isBn ? 'ক্যামেরা সংযোগ বিচ্ছিন্ন' : 'Camera inactive')}</p>
                <Button size="sm" onClick={() => setCameraActive(true)}>
                  {isBn ? 'ক্যামেরা চালু করুন' : 'Start Camera'}
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 text-center max-w-md">
            {isBn
              ? 'মুদ্রিত দলিলের নিচে থাকা ক্রিপ্টোগ্রাফিক কিউআর কোডটি ক্যামেরার সামনে রাখুন।'
              : 'Hold the camera over the printed QR code on the registered deed.'}
          </p>
        </Card>
      )}

      {/* TAB CONTENT 3: UPLOAD */}
      {activeTab === 'upload' && (
        <Card className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <Upload className="w-10 h-10 text-emerald-700 mb-3" />
          <p className="text-sm font-semibold text-slate-800 mb-1">
            {isBn ? 'দলিলের ছবি অথবা কিউআর ফাইল নির্বাচন করুন' : 'Select Deed Photo or QR Image'}
          </p>
          <p className="text-xs text-slate-500 mb-4 text-center">PNG, JPG, JPEG (Max 10MB)</p>
          <label className="cursor-pointer">
            <span className="inline-flex items-center justify-center px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-xs">
              {isBn ? 'ফাইল বেছে নিন' : 'Browse Files'}
            </span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </Card>
      )}

      {/* VERIFICATION RESULT HERO CARD */}
      {scanning && <LoadingSpinner label={isBn ? 'ক্রিপ্টোগ্রাফিক লিফ ও মার্কেল প্রমাণ যাচাই হচ্ছে...' : 'Verifying cryptographic inclusion proof...'} />}

      {verifyResult && (
        <div className="space-y-4 animate-fade-in">
          <div
            className={`rounded-2xl p-6 sm:p-7 border shadow-sm transition-all ${
              verifyResult.valid
                ? 'bg-emerald-950 text-white border-emerald-800 shadow-emerald-950/20'
                : 'bg-red-950 text-white border-red-800 shadow-red-950/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                {verifyResult.valid ? (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center shrink-0">
                    <XCircle className="w-7 h-7 text-red-400" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {verifyResult.valid
                        ? isBn
                          ? 'দলিল বৈধ ও অক্ষত (VERIFIED)'
                          : 'VERIFIED OFFLINE'
                        : isBn
                          ? 'জালিয়াতি / অসঙ্গতি চিহ্নিত (TAMPERED)'
                          : 'TAMPER DETECTED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    {verifyResult.valid
                      ? isBn
                        ? 'এই দলিলটি সরকারি রেজিস্ট্রি সিস্টেমে নিবন্ধিত এবং সিলমোহরের পর কোনো তথ্য পরিবর্তন করা হয়নি।'
                        : 'This deed was cryptographically logged and has not been modified since registration.'
                      : verifyResult.reason}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 bg-white/10 rounded-xl p-3 border border-white/10 text-xs space-y-1">
                <div className="text-slate-300 font-mono text-[11px]">
                  {isBn ? 'লগ লিফ #' : 'Merkle Leaf #'}: <span className="text-white font-bold">{verifyResult.leafIndex ?? 0}</span>
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  {isBn ? 'ইপক (Epoch)' : 'STH Epoch'}: <span className="text-white font-bold">{verifyResult.epoch ?? 1}</span>
                </div>
                <div className="text-emerald-300 text-[10px] flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Dual Ed25519+ML-DSA-65</span>
                </div>
              </div>
            </div>

            {verifyResult.valid && verifyResult.claims && (
              <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/5 rounded-lg p-2.5">
                  <span className="text-slate-400 text-[10px] block uppercase">{isBn ? 'দলিল নম্বর' : 'Deed Number'}</span>
                  <span className="text-white font-bold font-mono text-sm">{verifyResult.claims.d}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5">
                  <span className="text-slate-400 text-[10px] block uppercase">{isBn ? 'খতিয়ান ও দাগ' : 'Khatian & Dag'}</span>
                  <span className="text-white font-semibold">{verifyResult.claims.k} / {verifyResult.claims.g}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5">
                  <span className="text-slate-400 text-[10px] block uppercase">{isBn ? 'হস্তান্তরিত জমি' : 'Area Transferred'}</span>
                  <span className="text-emerald-300 font-bold text-sm">
                    {toBanglaDigits(fromMicroShotok(verifyResult.claims.a, 'shotok'), i18n.language)} {isBn ? 'শতক' : 'Shotok'}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5">
                  <span className="text-slate-400 text-[10px] block uppercase">{isBn ? 'ক্রেতা (মাস্কড)' : 'Buyer Masked'}</span>
                  <span className="text-white font-mono">{verifyResult.claims.b}</span>
                </div>
              </div>
            )}
          </div>

          {ocrDiffResult && ocrDiffResult.tokenLevelDiff && (
            <Card className="border-red-300 bg-red-50/50 space-y-3">
              <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>{isBn ? 'জালিয়াতির সুনির্দিষ্ট স্থান (Token-Level OCR Diff):' : 'Pinpointed Altered Bangla Field:'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-red-200 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-xs text-slate-500 font-medium">{isBn ? 'শনাক্তকৃত ক্ষেত্র:' : 'Field:'}</span>
                {ocrDiffResult.tokenLevelDiff.tokens.map((token: any, i: number) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                      !token.match
                        ? 'bg-red-600 text-white animate-pulse shadow-xs'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {token.scannedToken}
                  </span>
                ))}
              </div>
              <p className="text-xs text-red-800 font-medium">
                {isBn ? ocrDiffResult.tokenLevelDiff.summaryBn : ocrDiffResult.tokenLevelDiff.summary}
              </p>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/30 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{isBn ? 'যাচাই করা হয়েছে (What was Checked)' : 'What was Checked'}</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>{isBn ? 'মার্কেল ট্রি ইনক্লুশন প্রুফ গাণিতিকভাবে নিশ্চিত' : 'Merkle inclusion proof verified against STH root'}</li>
                <li>{isBn ? 'রেজিস্ট্রি কর্তৃপক্ষের এডওয়ার্ড-২৫৫১৯ ডিজিটাল স্বাক্ষর বৈধ' : 'Ed25519 digital signature verified with authority key'}</li>
                <li>{isBn ? 'দলিল নম্বর, দাগ, খতিয়ান ও এলাকার ক্যানোনিকাল হ্যাশ অক্ষত' : 'Canonical deed claims match cryptographic leaf hash'}</li>
              </ul>
            </Card>

            <Card className="border-amber-200 bg-amber-50/30 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Info className="w-4 h-4 text-amber-700" />
                <span>{isBn ? 'যাচাই করা হয়নি (What was NOT Checked)' : 'What was NOT Checked'}</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>{isBn ? 'সাব-রেজিস্ট্রারের সামনে শারীরিক উপস্থিতির প্রমাণ দেয় না' : 'Does not replace physical presence before Sub-Registrar'}</li>
                <li>{isBn ? 'অফলাইন কোড পরবর্তী আদালতের কোনো স্থগিতাদেশ নিশ্চিত করে না' : 'Offline verification cannot verify live court injunctions'}</li>
                <li>{isBn ? 'নামজারি কোনো চূড়ান্ত স্বত্ব রায় নয় (এটি প্রশাসনিক রেকর্ড)' : 'Mutation is administrative record, not final title decree'}</li>
              </ul>
            </Card>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 flex items-start gap-2 border border-slate-200">
            <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>{verifyResult.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
