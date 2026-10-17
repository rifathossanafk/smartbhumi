import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BangladeshMapIcon } from './BangladeshMapIcon';
import { PhoneCall, ExternalLink, Globe, Lock, FileCheck2, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  return (
    <footer className="bg-gradient-to-b from-[#124b27] via-[#0e3c1f] to-[#0a2e17] text-emerald-100/85 text-xs border-t border-emerald-700/70 mt-0 relative overflow-hidden shadow-inner">
      {/* Decorative top border accent */}
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-green-400 to-emerald-500 w-full" />

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Col 1: Official Brand & Ministry */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-md border border-emerald-500/30 flex items-center justify-center p-1">
                <img src="/logo.png" alt="LandProof Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight font-sans">
                  Smart<span className="text-emerald-300">Bhumi</span>
                </span>
                <span className="block text-[11px] text-emerald-200/90 font-medium leading-none mt-0.5">
                  {isBn ? 'ভূমি মন্ত্রণালয়, বাংলাদেশ সরকার' : 'Ministry of Land, Govt of Bangladesh'}
                </span>
              </div>
            </div>

            <p className="text-emerald-100/75 leading-relaxed text-xs">
              {isBn
                ? 'নাগরিকের ভূমির অধিকার রক্ষা ও দলিল যাচাইকরণে আধুনিক ডিজিটাল ক্যাডাস্ট্রাল ও ক্রিপ্টোগ্রাফিক সেবা প্ল্যাটফর্ম।'
                : 'National digital civic platform for land document verification, cadastral mapping, and title integrity.'}
            </p>

            {/* Hotline Badge */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#082412]/80 border border-emerald-600/50 text-emerald-100 shadow-xs">
                <div className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-300">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-emerald-300/80 font-medium">
                    {isBn ? 'জাতীয় ভূমি সেবা হটলাইন' : 'National Land Helpline (24/7)'}
                  </div>
                  <div className="text-base font-bold text-white font-mono tracking-wider">
                    ১৬১২২ / 16122
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{isBn ? 'ডিজিটাল ভূমি সেবাসমূহ' : 'Citizen Digital Services'}</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/verify" className="hover:text-white transition flex items-center gap-1.5 text-emerald-200/85">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? 'দলিল ও পর্চা সত্যতা যাচাই' : 'Verify Deed & Porcha'}</span>
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition flex items-center gap-1.5 text-emerald-200/85">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? 'ইন্টারেক্টিভ ক্যাডাস্ট্রাল মানচিত্র' : 'Cadastral Plot Map'}</span>
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition flex items-center gap-1.5 text-emerald-200/85">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? 'খতিয়ান, দাগ ও মৌজা অনুসন্ধান' : 'Search Khatian & Dag'}</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition flex items-center gap-1.5 text-emerald-200/85">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isBn ? 'নাগরিক সেবা ড্যাশবোর্ড' : 'Citizen Service Dashboard'}</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition flex items-center gap-1.5 text-emerald-200/85">
                  <BangladeshMapIcon className="w-3.5 h-3.5 text-emerald-400" withCircle={false} />
                  <span>{isBn ? 'কর্মকর্তা ও নাগরিক লগইন' : 'Official Portal Login'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Concepts & Directorate Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span>{isBn ? 'দপ্তর ও গুরুত্বপূর্ণ তথ্য' : 'Directorates & Cadastre'}</span>
            </h4>
            <div className="space-y-2.5 text-xs text-emerald-100/75">
              <p className="leading-relaxed">
                {isBn
                  ? 'জরিপ শ্রেণিবিভাগ: সিএস (CS ১৮৮৮-১৯৪০), এসএ (SA ১৯৫৬-১৯৬২), আরএস (RS ১৯৬২-বর্তমান) এবং বিএস (BS সিটি জরিপ)।'
                  : 'Survey Classes: CS (1888-1940), SA (1956-1962), RS (1962-present), and BS (City Survey).'}
              </p>
              <div className="pt-1 space-y-1.5">
                <a
                  href="https://minland.gov.bd"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-white transition text-[11px]"
                >
                  <span>ভূমি মন্ত্রণালয় (minland.gov.bd)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <br />
                <a
                  href="https://land.gov.bd"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-white transition text-[11px]"
                >
                  <span>জাতীয় ভূমি সেবা পোর্টাল (land.gov.bd)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Cryptographic Assurance & Standards */}
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-300"></span>
              <span>{isBn ? 'নিরাপত্তা ও স্ট্যান্ডার্ডস' : 'Security & Architecture'}</span>
            </h4>
            <p className="text-emerald-100/75 text-xs leading-relaxed">
              {isBn
                ? 'প্রতিটি দলিলের বিষয়বস্তু ব্রাউজারে SHA-256 ক্রিপ্টোগ্রাফিক হ্যাশ দ্বারা তাৎক্ষণিকভাবে যাচাই করা হয়। কেন্দ্রীয় ডাটাবেসে অসঙ্গতি রোধে লেজার-যাচাইকৃত রেকর্ড সংরক্ষিত থাকে।'
                : 'All document payloads are verified via cryptographic SHA-256 signatures with direct cadastral title chain validation.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-[#082412]/80 border border-emerald-600/50 text-emerald-200 text-[10px] font-mono">
                SHA-256
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#082412]/80 border border-emerald-600/50 text-emerald-200 text-[10px] font-mono">
                GIS Cadastral
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#082412]/80 border border-emerald-600/50 text-emerald-200 text-[10px] font-mono">
                NID Integrated
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-emerald-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/70">
          <p>
            {isBn
              ? '© ২০২৬ ভূমি মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার। সর্বস্বত্ব সংরক্ষিত।'
              : "© 2026 Ministry of Land, Government of the People's Republic of Bangladesh. All Rights Reserved."}
          </p>
          <div className="flex items-center gap-4 text-emerald-200/60">
            <span className="hover:text-white transition cursor-pointer">{t('footer.privacy')}</span>
            <span>•</span>
            <span className="hover:text-white transition cursor-pointer">{t('footer.terms')}</span>
            <span>•</span>
            <span className="text-emerald-300 font-medium">Smart Land Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
