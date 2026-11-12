import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const SyntheticBanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  return (
    <aside
      aria-label={isBn ? 'সিন্থেটিক ডেমো ডেটা সতর্কতা' : 'Synthetic Demo Data Disclaimer'}
      className="bg-amber-500 text-slate-950 px-3 py-1.5 text-xs font-medium border-b border-amber-600 flex items-center justify-between shadow-xs select-none sticky top-0 z-50"
    >
      <div className="flex items-center gap-1.5 max-w-7xl mx-auto w-full px-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
        <span className="font-bold tracking-wide">
          {isBn ? 'সিমুলেশন ও সিন্থেটিক ডেমো ডেটা:' : 'SIMULATION & SYNTHETIC DATA ONLY:'}
        </span>
        <span className="truncate">
          {isBn
            ? 'সকল তথ্য কাল্পনিক (এনআইডি ৯৯৯০০০...)। এটি জাতীয় ভূমি প্রতিযোগিতার প্রোটোটাইপ।'
            : 'All records are synthetic (NID 999000...). DIU LandTech Hackathon Prototype.'}
        </span>
        <div className="ml-auto hidden sm:flex items-center gap-1 shrink-0 font-semibold text-[11px] bg-amber-400/90 text-slate-950 px-2 py-0.5 rounded border border-amber-600">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RFC 9162 Log Active</span>
        </div>
      </div>
    </aside>
  );
};

