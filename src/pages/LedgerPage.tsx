import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Layers,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
  Terminal,
  Cpu,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import {
  fetchRegistryState,
  fetchLatestSTH,
  runRedTeamSimulation,
  resetDatabase
} from '../api/client';
import { Button, Card, Badge, LoadingSpinner } from '../components/UIComponents';
import { toBanglaDigits } from '../styles/tokens';

export const LedgerPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [stateData, setStateData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchRegistryState();
      setStateData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleRunSimulation = async (scenario: 'paper_tamper' | 'db_tamper' | 'key_compromise') => {
    setActiveSimulation(scenario);
    setSimLoading(true);
    setSimulationResult(null);
    try {
      const res = await runRedTeamSimulation(scenario);
      setSimulationResult(res);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleReset = async () => {
    await resetDatabase();
    setSimulationResult(null);
    loadData();
  };

  if (loading) return <LoadingSpinner label={isBn ? 'লেজার ডাটা লোড হচ্ছে...' : 'Loading transparency log...'} />;

  const sth = stateData?.latestSTH;
  const deeds = stateData?.deeds || [];
  const auditLog = stateData?.auditLog || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {isBn ? 'মার্কেল ট্রান্সপারেন্সি লেজার ও রেড-টিম ল্যাব' : 'Merkle Transparency Log & Red-Team Lab'}
            </h1>
            <Badge variant="pqc">Dual PQC STH</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            {isBn
              ? 'RFC 9162 স্ট্যান্ডার্ড মোতাবেক প্রতিটি দলিল ক্রিপ্টোগ্রাফিক ট্রিতে সিলমোহরকৃত।'
              : 'RFC 9162 Certificate Transparency style Merkle tree with dual digital signatures.'}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-1 text-slate-600" />
          <span>{isBn ? 'ডাটাবেস রিসেট (<১০০ms)' : 'Fast DB Reset'}</span>
        </Button>
      </div>

      {/* TOP HERO: SIGNED TREE HEAD (STH) STATUS */}
      {sth && (
        <Card className="bg-slate-900 text-white border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Signed Tree Head (STH) — Epoch #{sth.epoch}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="pqc">Ed25519 (Classical)</Badge>
              <Badge variant="pqc">ML-DSA-65 (NIST FIPS 204)</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] block uppercase">Current Merkle Root</span>
              <span className="font-mono text-emerald-300 font-bold break-all text-xs block mt-1">
                {sth.rootHash}
              </span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] block uppercase">Tree Size / Sealed Deeds</span>
              <span className="text-2xl font-bold text-white block mt-1">
                {toBanglaDigits(sth.treeSize, i18n.language)} {isBn ? 'দলিল' : 'Leaves'}
              </span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] block uppercase">STH Timestamp</span>
              <span className="font-mono text-slate-200 block mt-1 text-xs">{sth.timestamp}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Domain: smartbhumi-sth-v1:</span>
            </div>
          </div>
        </Card>
      )}

      {/* RED-TEAM ATTACK SIMULATION CONSOLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {isBn ? 'রেড-টিম সাইবার ও নিরাপত্তা সিমুলেশন' : 'Red-Team Adversarial Security Lab'}
            </h2>
          </div>
          <Badge variant="danger">simulation on our own prototype</Badge>
        </div>

        <p className="text-xs text-slate-600 max-w-3xl">
          {isBn
            ? 'ভূমি রেজিস্ট্রি ব্যবস্থায় প্রধান ৩টি আক্রমণ ভেক্টর প্রোটোটাইপে লাইভ পরীক্ষা করুন। প্রতিটি দৃশ্যকল্পে সিস্টেমের প্রতিক্রিয়া পর্যবেক্ষণ করুন।'
            : 'Simulate the 3 primary land fraud attack vectors. Shows how the dual-signature and Merkle root integrity defend against attacks.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* SIMULATION 1: Paper Area Alteration */}
          <Card className="hover:border-red-400 transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px]">1</span>
                  {isBn ? 'কাগজে এলাকা পরিবর্তন' : 'Paper Area Alteration'}
                </span>
                <Badge variant="danger">অফলাইন ড্রাফট</Badge>
              </div>
              <p className="text-xs text-slate-600">
                {isBn
                  ? 'দলিলের কাগজে ১৫ শতকের স্থলে ২৫ শতক বসিয়ে জালিয়াতির চেষ্টা। কিউআর কোডের লিফ হ্যাশ অমিল হয়ে অফলাইনেই বাতিল।'
                  : 'Alters deed area on printed paper from 15 to 25 shotok. Leaf hash mismatch immediately fails offline verify.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold text-red-700 border-red-300 hover:bg-red-50"
              onClick={() => handleRunSimulation('paper_tamper')}
              isLoading={simLoading && activeSimulation === 'paper_tamper'}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              <span>{isBn ? 'সিমুলেশন ১ ফায়ার করুন' : 'Simulate Paper Tamper'}</span>
            </Button>
          </Card>

          {/* SIMULATION 2: Database Row Editing */}
          <Card className="hover:border-red-400 transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px]">2</span>
                  {isBn ? 'ডাটাবেস রো পরিবর্তন' : 'DB Row Tampering'}
                </span>
                <Badge variant="danger">অভ্যন্তরীণ আক্রমণ</Badge>
              </div>
              <p className="text-xs text-slate-600">
                {isBn
                  ? 'দুর্নীতিবাজ এডমিন কর্তৃক সরাসরি ডাটাবেসে পূর্বের রেকর্ডের রো এডিট করা। রুট অমিল হয়ে সুনির্দিষ্ট লিফ চিহ্নিত হয়।'
                  : 'Rogue DB admin edits a historical SQLite row. Tree recomputation produces root mismatch isolating the tampered leaf.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold text-red-700 border-red-300 hover:bg-red-50"
              onClick={() => handleRunSimulation('db_tamper')}
              isLoading={simLoading && activeSimulation === 'db_tamper'}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              <span>{isBn ? 'সিমুলেশন ২ ফায়ার করুন' : 'Simulate DB Tamper'}</span>
            </Button>
          </Card>

          {/* SIMULATION 3: Classical Key Compromise */}
          <Card className="hover:border-red-400 transition-all space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">3</span>
                  {isBn ? 'এডওয়ার্ড কি কম্প্রোমাইজ' : 'Key Compromise (PQC)'}
                </span>
                <Badge variant="pqc">ML-DSA-65</Badge>
              </div>
              <p className="text-xs text-slate-600">
                {isBn
                  ? 'এডওয়ার্ড-২৫৫১৯ প্রাইভেট কি চুরি হলেও জালিয়াতি সম্ভব নয়; পোস্ট-কোয়ান্টাম এমএল-ডিএসএ-৬৫ স্বাক্ষর না থাকায় অবরুদ্ধ।'
                  : 'Stolen Ed25519 key attempts forging an STH. Classical signature validates, but ML-DSA-65 rejects: BLOCKED.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold text-indigo-800 border-indigo-300 hover:bg-indigo-50"
              onClick={() => handleRunSimulation('key_compromise')}
              isLoading={simLoading && activeSimulation === 'key_compromise'}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              <span>{isBn ? 'সিমুলেশন ৩ ফায়ার করুন' : 'Simulate Key Compromise'}</span>
            </Button>
          </Card>
        </div>

        {/* SIMULATION OUTPUT VIEWER CARD */}
        {simulationResult && (
          <Card className="bg-slate-950 text-white border-red-800/80 space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Terminal className="w-5 h-5 text-amber-400" />
                <span className="text-red-400">Simulation Output: {simulationResult.scenario}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Verdict:</span>
                <span className="px-3 py-1 rounded bg-red-600 text-white font-bold text-xs uppercase tracking-wider">
                  {simulationResult.verdict}
                </span>
              </div>
            </div>

            {/* Scenario 3 Dual Comparison Box */}
            {simulationResult.scenario === 'key_compromise' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Classical Ed25519 Layer (Stolen Key):</span>
                  <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {simulationResult.details.classicalEd25519Status}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Attacker successfully used stolen classical key</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-red-900/60 space-y-1">
                  <span className="text-slate-400 text-[11px] block">NIST ML-DSA-65 Layer (Post-Quantum):</span>
                  <span className="text-red-400 font-bold text-sm flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    {simulationResult.details.postQuantumMlDsaStatus}
                  </span>
                  <span className="text-[10px] text-red-300 block">Dual signature policy strictly enforced: FAIL CLOSED</span>
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
              <p className="text-slate-400 font-sans text-xs font-semibold mb-1">
                {isBn ? 'ব্যাখ্যা ও অনুসন্ধান:' : 'Cryptographic Explanation:'}
              </p>
              <p>{simulationResult.explanation}</p>
            </div>
          </Card>
        )}
      </div>

      {/* MERKLE LEAF EXPLORER TABLE */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-bold text-slate-900">
              {isBn ? 'মার্কেল ট্রি লিফ ও রেজিস্ট্রি রেকর্ডস' : 'Merkle Tree Leaf Explorer'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {isBn ? 'মোট নিবন্ধিত দলিল:' : 'Total Deeds:'} {deeds.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">লিফ #</th>
                <th className="p-3">দলিল নং</th>
                <th className="p-3">দাগ ও মৌজা</th>
                <th className="p-3">পরিমাণ</th>
                <th className="p-3">ক্রেতা (মাস্কড)</th>
                <th className="p-3">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {deeds.map((deed: any, i: number) => (
                <tr key={deed.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-800">
                    #{deed.leaf_index ?? i}
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-900">{deed.deed_number}</td>
                  <td className="p-3">{deed.dag_number} ({deed.mouza_code})</td>
                  <td className="p-3 font-semibold text-emerald-700">
                    {toBanglaDigits((deed.transfer_area / 1_000_000).toFixed(2), i18n.language)} {isBn ? 'শতক' : 'Shotok'}
                  </td>
                  <td className="p-3 font-mono text-slate-600">{deed.buyer_nid_masked}</td>
                  <td className="p-3">
                    <Badge variant={deed.status === 'sealed' ? 'success' : 'neutral'}>
                      {deed.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

