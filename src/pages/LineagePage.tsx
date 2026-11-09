import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitCommit,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  BookOpen,
  Scale,
  Users,
  Search,
  FileSearch,
  Sparkles
} from 'lucide-react';
import { fetchPlotLineage, calculateFaraiz, checkOCRDiff } from '../api/client';
import { Button, Card, Badge, LoadingSpinner } from '../components/UIComponents';
import { toBanglaDigits } from '../styles/tokens';

export const LineagePage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [activeSection, setActiveSection] = useState<'lineage' | 'faraiz' | 'ocr'>('lineage');

  // LINEAGE STATES
  const [selectedDag, setSelectedDag] = useState<string>('DAG-2026-001');
  const [lineageData, setLineageData] = useState<any | null>(null);
  const [lineageLoading, setLineageLoading] = useState<boolean>(false);

  // FARAIZ STATES
  const [estateArea, setEstateArea] = useState<number>(48.0);
  const [hasSpouse, setHasSpouse] = useState<boolean>(true);
  const [hasMother, setHasMother] = useState<boolean>(true);
  const [hasFather, setHasFather] = useState<boolean>(true);
  const [numSons, setNumSons] = useState<number>(2);
  const [numDaughters, setNumDaughters] = useState<number>(1);
  const [faraizResult, setFaraizResult] = useState<any | null>(null);
  const [faraizLoading, setFaraizLoading] = useState<boolean>(false);

  // OCR DIFF STATES
  const [ocrFixture, setOcrFixture] = useState<'genuine' | 'area_tampered' | 'khas'>('area_tampered');
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);

  useEffect(() => {
    loadLineage(selectedDag);
  }, [selectedDag]);

  useEffect(() => {
    runFaraiz();
  }, [estateArea, hasSpouse, hasMother, hasFather, numSons, numDaughters]);

  useEffect(() => {
    runOcrDiff(ocrFixture);
  }, [ocrFixture]);

  async function loadLineage(dag: string) {
    setLineageLoading(true);
    try {
      const res = await fetchPlotLineage(dag);
      setLineageData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLineageLoading(false);
    }
  }

  async function runFaraiz() {
    setFaraizLoading(true);
    try {
      const res = await calculateFaraiz({
        totalArea: Number(estateArea),
        hasSpouse,
        hasMother,
        hasFather,
        numSons: Number(numSons),
        numDaughters: Number(numDaughters),
      });
      setFaraizResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setFaraizLoading(false);
    }
  }

  async function runOcrDiff(fixture: 'genuine' | 'area_tampered' | 'khas') {
    setOcrLoading(true);
    try {
      const res = await checkOCRDiff(fixture);
      setOcrResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setOcrLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isBn ? 'জরিপ ধারাবাহিকতা, ফারায়েজ ও ওসিআর ডিফারেন্স' : 'Lineage, Faraiz-lite & Scan-Tolerant OCR'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isBn
              ? 'সিএস হতে বিএস জরিপ শৃঙ্খল বিশ্লেষণ, উত্তরাধিকার বণ্টন ক্যালকুলেটর ও স্ক্যান ডিফারেন্স।'
              : 'Survey lineage verification (CS->BS), Islamic inheritance calculator, and scan-tolerant OCR diff.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 text-sm font-semibold select-none">
        <button
          onClick={() => setActiveSection('lineage')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeSection === 'lineage'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>{isBn ? 'জরিপ ধারাবাহিকতা (Lineage Chain)' : 'Cadastral Survey Lineage'}</span>
        </button>
        <button
          onClick={() => setActiveSection('faraiz')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeSection === 'faraiz'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{isBn ? 'ফারায়েজ ক্যালকুলেটর (Faraiz-lite)' : 'Faraiz-lite Calculator'}</span>
        </button>
        <button
          onClick={() => setActiveSection('ocr')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeSection === 'ocr'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>{isBn ? 'ওসিআর টোকেন ডিফারেন্স (OCR Diff)' : 'Scan-Tolerant OCR Diff'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: CADASTRAL SURVEY LINEAGE GRAPH (CS -> SA -> RS -> BS) */}
      {/* ======================================================== */}
      {activeSection === 'lineage' && (
        <div className="space-y-6 animate-fade-in">
          {/* Plot Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-1">
              {isBn ? 'টেস্ট দাগ নির্বাচন করুন:' : 'Select Test Dag:'}
            </span>
            <button
              onClick={() => setSelectedDag('DAG-2026-001')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedDag === 'DAG-2026-001'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              DAG-2026-001 ({isBn ? 'অক্ষত শৃঙ্খল' : 'Complete Chain'})
            </button>
            <button
              onClick={() => setSelectedDag('DAG-2026-007')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedDag === 'DAG-2026-007'
                  ? 'bg-red-800 text-white border-red-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              DAG-2026-007 ({isBn ? 'ভাঙা শৃঙ্খল / RS অনুপস্থিত' : 'Broken Chain / Missing RS'})
            </button>
            <button
              onClick={() => setSelectedDag('DAG-2026-003')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedDag === 'DAG-2026-003'
                  ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              DAG-2026-003 ({isBn ? '১নং খাস জমি' : 'Khas Land'})
            </button>
          </div>

          {/* SVG Cadastral Survey Graph */}
          <Card className="p-6 bg-slate-900 text-white border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400 block uppercase">Cadastral Survey Flow</span>
                <span className="font-bold text-emerald-400 text-base">{selectedDag}</span>
              </div>
              <div>
                {lineageData?.hasBrokenLinks ? (
                  <Badge variant="danger">
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    {isBn ? 'ভাঙা ধারাবাহিকতা চিহ্নিত' : 'Broken Chain Detected'}
                  </Badge>
                ) : (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {isBn ? 'সম্পূর্ণ বৈধ শৃঙ্খল' : 'Verified Continuous Chain'}
                  </Badge>
                )}
              </div>
            </div>

            {/* SVG Visual Graph */}
            <div className="w-full overflow-x-auto py-4">
              <svg viewBox="0 0 760 160" className="w-full min-w-[650px] h-36">
                {/* Node 1: CS */}
                <g transform="translate(40, 30)">
                  <rect width="130" height="90" rx="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                  <text x="65" y="28" fill="#60a5fa" fontSize="13" fontWeight="bold" textAnchor="middle">CS Survey</text>
                  <text x="65" y="48" fill="#cbd5e1" fontSize="10" textAnchor="middle">~1910-1940</text>
                  <text x="65" y="70" fill="#94a3b8" fontSize="9" textAnchor="middle">Zamindari Record</text>
                </g>

                {/* Arrow 1: CS -> SA */}
                <line x1="170" y1="75" x2="220" y2="75" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow-green)" />

                {/* Node 2: SA */}
                <g transform="translate(220, 30)">
                  <rect width="130" height="90" rx="10" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                  <text x="65" y="28" fill="#34d399" fontSize="13" fontWeight="bold" textAnchor="middle">SA Survey</text>
                  <text x="65" y="48" fill="#cbd5e1" fontSize="10" textAnchor="middle">~1956-1962</text>
                  <text x="65" y="70" fill="#94a3b8" fontSize="9" textAnchor="middle">State Acquisition</text>
                </g>

                {/* Arrow 2: SA -> RS (Broken or Green) */}
                {selectedDag === 'DAG-2026-007' ? (
                  <>
                    <line x1="350" y1="75" x2="400" y2="75" stroke="#ef4444" strokeWidth="3" strokeDasharray="5,5" />
                    <text x="375" y="65" fill="#f87171" fontSize="12" fontWeight="bold" textAnchor="middle">❌ GAP</text>
                  </>
                ) : (
                  <line x1="350" y1="75" x2="400" y2="75" stroke="#10b981" strokeWidth="3" />
                )}

                {/* Node 3: RS */}
                <g transform="translate(400, 30)">
                  <rect
                    width="130"
                    height="90"
                    rx="10"
                    fill="#1e293b"
                    stroke={selectedDag === 'DAG-2026-007' ? '#ef4444' : '#10b981'}
                    strokeWidth="2"
                    strokeDasharray={selectedDag === 'DAG-2026-007' ? '4,4' : undefined}
                  />
                  <text x="65" y="28" fill={selectedDag === 'DAG-2026-007' ? '#f87171' : '#34d399'} fontSize="13" fontWeight="bold" textAnchor="middle">
                    RS Survey
                  </text>
                  <text x="65" y="48" fill="#cbd5e1" fontSize="10" textAnchor="middle">
                    {selectedDag === 'DAG-2026-007' ? 'অনুপস্থিত (MISSING)' : 'Revisional Survey'}
                  </text>
                  <text x="65" y="70" fill="#94a3b8" fontSize="9" textAnchor="middle">
                    {selectedDag === 'DAG-2026-007' ? 'ভলিউম ফাঁক চিহ্নিত' : 'Valid Title Holder'}
                  </text>
                </g>

                {/* Arrow 3: RS -> BS */}
                <line x1="530" y1="75" x2="580" y2="75" stroke={selectedDag === 'DAG-2026-007' ? '#ef4444' : '#10b981'} strokeWidth="3" />

                {/* Node 4: BS */}
                <g transform="translate(580, 30)">
                  <rect width="130" height="90" rx="10" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
                  <text x="65" y="28" fill="#c084fc" fontSize="13" fontWeight="bold" textAnchor="middle">BS / City Survey</text>
                  <text x="65" y="48" fill="#cbd5e1" fontSize="10" textAnchor="middle">Modern Survey</text>
                  <text x="65" y="70" fill="#94a3b8" fontSize="9" textAnchor="middle">
                    {selectedDag === 'DAG-2026-007' ? 'ভিত্তিহীন লিপবদ্ধতা' : 'Current Khatian'}
                  </text>
                </g>
              </svg>
            </div>

            {/* Broken Chain Warning Box */}
            {lineageData?.breakSummary && (
              <div className="p-3 bg-red-950/80 rounded-xl border border-red-800 text-xs text-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-red-300">
                    {isBn ? 'সতর্কতা: জরিপ ধারাবাহিকতায় ফাঁক পাওয়া গেছে!' : 'Broken Survey Link Warning:'}
                  </span>
                  <span>{lineageData.breakSummary}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Historical Survey Records Table */}
          {lineageData?.chain && (
            <Card className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isBn ? 'রেকর্ডকৃত জরিপ প্রমাণসমূহ' : 'Historical Cadastral Survey Records'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">জরিপ টাইপ</th>
                      <th className="p-2.5">খতিয়ান নম্বর</th>
                      <th className="p-2.5">মালিকানা রেকর্ড</th>
                      <th className="p-2.5">জমির পরিমাণ</th>
                      <th className="p-2.5">ধারাবাহিকতা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {lineageData.chain.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold font-mono text-emerald-800">{c.surveyType}</td>
                        <td className="p-2.5 font-mono">{c.khatianNumber}</td>
                        <td className="p-2.5">{c.ownerName || '—'}</td>
                        <td className="p-2.5">{toBanglaDigits(c.areaShotok ?? '—', i18n.language)} শতক</td>
                        <td className="p-2.5">
                          {c.isBroken ? (
                            <Badge variant="danger">ভাঙা লিংক</Badge>
                          ) : (
                            <Badge variant="success">সঠিক লিংক</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: FARAIZ-LITE INHERITANCE CALCULATOR */}
      {/* ======================================================== */}
      {activeSection === 'faraiz' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base font-bold text-slate-900">
                  {isBn ? 'মুসলিম ব্যক্তিগত উত্তরাধিকার বণ্টন (ফারায়েজ-লাইট)' : 'Faraiz-lite Islamic Inheritance'}
                </h2>
              </div>
              <Badge variant="warning">Illustrative Only</Badge>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'মোট ভূমির পরিমাণ (শতক)' : 'Total Estate Area (Shotok)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={estateArea}
                  onChange={(e) => setEstateArea(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-700"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {isBn ? 'স্ট্যান্ডার্ড টেস্ট মান: ৪৮.০০ শতক' : 'Standard Test: 48.00 shotok'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'জীবিত পুত্রের সংখ্যা' : 'Number of Sons'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={numSons}
                  onChange={(e) => setNumSons(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'জীবিত কন্যার সংখ্যা' : 'Number of Daughters'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={numDaughters}
                  onChange={(e) => setNumDaughters(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Checkboxes: Spouse, Parents */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSpouse}
                  onChange={(e) => setHasSpouse(e.target.checked)}
                  className="w-4 h-4 text-emerald-700 rounded"
                />
                <span>{isBn ? 'স্ত্রী জীবিত আছেন (১/৮ অংশ)' : 'Surviving Wife (1/8 share)'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasMother}
                  onChange={(e) => setHasMother(e.target.checked)}
                  className="w-4 h-4 text-emerald-700 rounded"
                />
                <span>{isBn ? 'মাতা জীবিত আছেন (১/৬ অংশ)' : 'Surviving Mother (1/6 share)'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFather}
                  onChange={(e) => setHasFather(e.target.checked)}
                  className="w-4 h-4 text-emerald-700 rounded"
                />
                <span>{isBn ? 'পিতা জীবিত আছেন (১/৬ অংশ)' : 'Surviving Father (1/6 share)'}</span>
              </label>
            </div>
          </Card>

          {/* Faraiz Distribution Result Table */}
          {faraizResult && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isBn ? 'ওয়ারিশগণের প্রাপ্য অংশ বণ্টন' : 'Heir Legal Share Breakdown'}
                </span>
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {isBn ? 'বণ্টনকৃত:' : 'Total Distributed:'}{' '}
                  {toBanglaDigits(faraizResult.totalDistributedShotok, i18n.language)} /{' '}
                  {toBanglaDigits(estateArea, i18n.language)} {isBn ? 'শতক' : 'Shotok'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">ওয়ারিশ / উত্তরাধিকারী</th>
                      <th className="p-3">আইনি অনুপাত (Fraction)</th>
                      <th className="p-3">প্রাপ্য জমির পরিমাণ (শতক)</th>
                      <th className="p-3">আইনি ব্যাখ্যা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {faraizResult.shares.map((share: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{isBn ? share.heirBn : share.heir}</td>
                        <td className="p-3 font-mono font-semibold text-indigo-700">{share.fraction}</td>
                        <td className="p-3 font-mono font-bold text-emerald-800 text-sm">
                          {toBanglaDigits(share.shareShotok, i18n.language)} {isBn ? 'শতক' : 'Shotok'}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">{share.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Strict Legal Disclaimer */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{isBn ? faraizResult.disclaimerBn : faraizResult.disclaimer}</span>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: SCAN-TOLERANT OCR TOKEN DIFF */}
      {/* ======================================================== */}
      {activeSection === 'ocr' && (
        <div className="space-y-6 animate-fade-in">
          {/* Fixture Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-1">
              {isBn ? 'সিন্থেটিক দলিল টেস্ট ফিক্সচার:' : 'Synthetic Deed Fixture:'}
            </span>
            <button
              onClick={() => setOcrFixture('genuine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                ocrFixture === 'genuine'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ১. আসল দলিল (Genuine 15.00)
            </button>
            <button
              onClick={() => setOcrFixture('area_tampered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                ocrFixture === 'area_tampered'
                  ? 'bg-red-800 text-white border-red-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ২. এলাকা পরিবর্তন (Altered 25.00)
            </button>
            <button
              onClick={() => setOcrFixture('khas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                ocrFixture === 'khas'
                  ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ৩. খাস জমি অবৈধ ক্লেইম
            </button>
          </div>

          {ocrLoading && <LoadingSpinner label={isBn ? 'ওসিআর ক্যানোনিকাল ফিল্ড বিশ্লেষণ হচ্ছে...' : 'Analyzing canonical document fields...'} />}

          {ocrResult && (
            <div className="space-y-4">
              {/* Overall Diff Verdict Card */}
              <div
                className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  ocrResult.overallMatch
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                    : 'bg-red-100 text-red-950 border-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {ocrResult.overallMatch ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-700" />
                  )}
                  <span>{isBn ? ocrResult.verdictBn : ocrResult.verdictEn}</span>
                </div>
                <Badge variant={ocrResult.overallMatch ? 'success' : 'danger'}>
                  {ocrResult.overallMatch ? 'MATCH' : 'MISMATCH'}
                </Badge>
              </div>

              {/* Token-Level Visual Diff (Altered Field Pinpointed) */}
              {ocrResult.tokenLevelDiff && (
                <Card className="border-red-300 bg-red-50/50 space-y-3">
                  <div className="flex items-center gap-2 text-red-900 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>{isBn ? 'বাংলা টোকেন-লেভেল জালিয়াতি চিহ্নিত স্থান:' : 'Bangla Token-Level Discrepancy:'}</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-red-200 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-xs text-slate-500 font-medium">স্ক্যানকৃত টেক্সট:</span>
                    {ocrResult.tokenLevelDiff.tokens.map((token: any, i: number) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-xs font-bold font-mono transition-transform ${
                          !token.match
                            ? 'bg-red-600 text-white animate-pulse shadow-sm scale-105'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {token.scannedToken}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-red-800 font-medium">
                    {isBn ? ocrResult.tokenLevelDiff.summaryBn : ocrResult.tokenLevelDiff.summary}
                  </p>
                </Card>
              )}

              {/* Side-by-Side Field Comparison Table */}
              <Card className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isBn ? 'ফিল্ড-বাই-ফিল্ড তুলনামূলক পর্যালোচনা' : 'Field-by-Field Canonical Comparison'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">ফিল্ড নাম</th>
                        <th className="p-3">সরকারি ডিজিটাল রেকর্ড</th>
                        <th className="p-3">স্ক্যানকৃত দলিলের দাবি</th>
                        <th className="p-3">ফলাফল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {ocrResult.fieldDiffs.map((f: any, i: number) => (
                        <tr key={i} className={!f.match ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                          <td className="p-3 font-semibold text-slate-900">{isBn ? f.fieldBn : f.field}</td>
                          <td className="p-3 font-mono text-emerald-800 font-semibold">{f.officialValue}</td>
                          <td className={`p-3 font-mono ${!f.match ? 'text-red-700 font-bold' : ''}`}>
                            {f.scannedValue}
                          </td>
                          <td className="p-3">
                            {f.match ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> মিল আছে
                              </span>
                            ) : (
                              <span className="text-red-700 font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> অমিল!
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

