import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Play, RotateCcw, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { resetDatabase } from '../api/client';

export const JudgeDemoBar: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [expanded, setExpanded] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleReset = async () => {
    setResetting(true);
    setResetSuccess(null);
    try {
      const res = await resetDatabase();
      setResetSuccess(`${res.resetTimeMs}ms`);
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const jumpToAct = (act: number, path: string) => {
    navigate(path);
  };

  return (
    <div id="judge-demo-bar" className="fixed bottom-20 lg:bottom-4 right-3 z-50 select-none print:hidden judge-demo-bar">
      <div className="bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 overflow-hidden transition-all text-xs">
        {/* Toggle Header */}
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between px-3 py-2 bg-slate-800 cursor-pointer hover:bg-slate-700/80 gap-3"
        >
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{isBn ? 'বিচারক ডেমো বার' : 'Judge Demo Bar'}</span>
            <span className="text-[10px] text-slate-400 font-normal">{isBn ? '৩-মিনিট পিচ' : '3-Min Pitch'}</span>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </div>

        {/* Action Buttons Panel */}
        {expanded && (
          <div className="p-3 space-y-2 bg-slate-900 w-64">
            <p className="text-[11px] text-slate-300 font-medium">
              {isBn ? '৩-মিনিটের বিচারক ডেমো পাথ:' : '3-Minute Presentation Acts:'}
            </p>

            <button
              onClick={() => jumpToAct(1, '/register')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-left border border-slate-700 hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">
                    {isBn ? 'পর্ব ১: এরিয়া অ্যাকাউন্টিং' : 'Act 1: Area Accounting'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isBn ? 'কনকারেন্সি ২০-ওয়ার্কার পরীক্ষা' : 'Concurrency 20-worker test'}
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => jumpToAct(2, '/verify')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-left border border-slate-700 hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">
                    {isBn ? 'পর্ব ২: অফলাইন কিউআর ও ট্যাম্পার' : 'Act 2: Offline QR & Tamper'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isBn ? 'বিমান মোড ও কাগজ ডিফ' : 'Airplane mode & paper diff'}
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => jumpToAct(3, '/mutation')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-left border border-slate-700 hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold block text-slate-200">
                    {isBn ? 'পর্ব ৩: এসি ল্যান্ড ও পিকিউসি ব্লক' : 'Act 3: AC Land & PQC Block'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isBn ? 'ই-নামজারি ও এমএল-ডিএসএ প্রতিরক্ষা' : 'e-Mutation & ML-DSA defense'}
                  </span>
                </div>
              </div>
            </button>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 font-semibold text-[11px] disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span>{resetting ? (isBn ? 'রিসেট হচ্ছে...' : 'Resetting...') : (isBn ? 'দ্রুত ডিবি রিসেট (<১০০ms)' : 'Quick DB Reset (<100ms)')}</span>
              </button>
              {resetSuccess && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  {resetSuccess}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
