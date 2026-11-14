import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { DIVISIONS } from '../data/seedData';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { toBanglaDigits } from '../styles/tokens';
import {
  Search,
  RotateCcw,
  MapPin,
  FileCheck2,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building,
  Layers,
  Map,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { landRecords } = useStore();
  const isBn = i18n.language === 'bn';

  // Filter states
  const [keyword, setKeyword] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [selectedMouza, setSelectedMouza] = useState('');
  const [selectedKhatianType, setSelectedKhatianType] = useState('');
  const [khatianNumber, setKhatianNumber] = useState('');
  const [dagNumber, setDagNumber] = useState('');
  const [deedNumber, setDeedNumber] = useState('');
  const [searchTarget, setSearchTarget] = useState<'all' | 'dag' | 'khatian' | 'deed'>('all');

  // Chained dropdown data
  const districts = useMemo(() => {
    if (!selectedDivision) return [];
    const div = DIVISIONS.find((d) => d.id === selectedDivision);
    return div ? div.districts : [];
  }, [selectedDivision]);

  const upazilas = useMemo(() => {
    if (!selectedDistrict) return [];
    const dist = districts.find((d) => d.id === selectedDistrict);
    return dist ? dist.upazilas : [];
  }, [selectedDistrict, districts]);

  const mouzas = useMemo(() => {
    if (!selectedUpazila) return [];
    const upa = upazilas.find((u) => u.id === selectedUpazila);
    return upa ? upa.mouzas : [];
  }, [selectedUpazila, upazilas]);

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDivision(e.target.value);
    setSelectedDistrict('');
    setSelectedUpazila('');
    setSelectedMouza('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
    setSelectedUpazila('');
    setSelectedMouza('');
  };

  const handleUpazilaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUpazila(e.target.value);
    setSelectedMouza('');
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedDivision('');
    setSelectedDistrict('');
    setSelectedUpazila('');
    setSelectedMouza('');
    setSelectedKhatianType('');
    setKhatianNumber('');
    setDagNumber('');
    setDeedNumber('');
    setSearchTarget('all');
  };

  const handleQuickDagSelect = (dag: string) => {
    if (dagNumber === dag) {
      setDagNumber('');
    } else {
      setDagNumber(dag);
      setSearchTarget('dag');
    }
  };

  // Cadastral plot quick buttons list
  const quickPlots = [
    { dag: 'DAG-2026-001', labelBn: 'দাগ ০১ (১৫ শতক)', status: 'safe' },
    { dag: 'DAG-2026-002', labelBn: 'দাগ ০২ (২৫ শতক)', status: 'flagged' },
    { dag: 'DAG-2026-003', labelBn: 'দাগ ০৩ (১০ শতক)', status: 'safe' },
    { dag: 'DAG-2026-004', labelBn: 'দাগ ০৪ (১৮ শতক)', status: 'safe' },
    { dag: 'DAG-2026-005', labelBn: 'দাগ ০৫ (১২ শতক)', status: 'warning' },
    { dag: 'DAG-2026-006', labelBn: 'দাগ ০৬ (৩০ শতক)', status: 'safe' },
    { dag: 'DAG-2026-007', labelBn: 'দাগ ০৭ (০৮ শতক)', status: 'safe' },
  ];

  // Filtered results
  const filteredRecords = useMemo(() => {
    return landRecords.filter((record) => {
      // Keyword search
      if (keyword.trim()) {
        const kw = keyword.toLowerCase().trim();
        const matchesKw =
          record.deedNumber.toLowerCase().includes(kw) ||
          record.mouza.toLowerCase().includes(kw) ||
          record.khatianNumber.toLowerCase().includes(kw) ||
          record.dagNumber.toLowerCase().includes(kw) ||
          record.sellerRef.toLowerCase().includes(kw) ||
          record.buyerRef.toLowerCase().includes(kw) ||
          record.ownerRef.toLowerCase().includes(kw);
        if (!matchesKw) return false;
      }

      // Hierarchy filters
      if (selectedDivision && record.division !== selectedDivision) return false;
      if (selectedDistrict && record.district !== selectedDistrict) return false;
      if (selectedUpazila && record.upazila !== selectedUpazila) return false;
      if (selectedMouza) {
        const m = mouzas.find((mz) => mz.id === selectedMouza);
        if (m && record.mouza.toLowerCase() !== m.nameEn.toLowerCase() && record.mouza !== m.nameBn) {
          return false;
        }
      }

      // Specific filters
      if (selectedKhatianType && record.khatianType !== selectedKhatianType) return false;
      if (khatianNumber && !record.khatianNumber.toLowerCase().includes(khatianNumber.toLowerCase())) {
        return false;
      }
      if (dagNumber && !record.dagNumber.toLowerCase().includes(dagNumber.toLowerCase())) {
        return false;
      }
      if (deedNumber && !record.deedNumber.toLowerCase().includes(deedNumber.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [
    landRecords,
    keyword,
    selectedDivision,
    selectedDistrict,
    selectedUpazila,
    selectedMouza,
    mouzas,
    selectedKhatianType,
    khatianNumber,
    dagNumber,
    deedNumber,
  ]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>{isBn ? 'জাতীয় খতিয়ান ও দাগ রেকর্ড ডাটাবেস' : 'National Land & Plot Database'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('search.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {t('search.subtitle')}
          </p>
        </div>

        <Link
          to="/map"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all self-start sm:self-center shrink-0 cursor-pointer"
        >
          <Map className="w-4 h-4" />
          <span>{isBn ? 'মানচিত্রে দাগ দেখুন' : 'View Plot Maps'}</span>
        </Link>
      </div>

      <DisclaimerBanner condensed />

      {/* Cadastral Plot Quick Inspection Bar (Inspired by Cadastral Map UX) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isBn ? 'ক্যাডাস্ট্রাল দাগের দ্রুত নির্বাচন (১-ক্লিক ফিল্টার):' : 'Cadastral Plot Quick Filter:'}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {isBn ? '৭টি টেস্ট দাগ' : '7 Demo Plots'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPlots.map((p) => {
            const isSelected = dagNumber === p.dag;
            const isSafe = p.status === 'safe';
            const isWarning = p.status === 'warning';
            const isFlagged = p.status === 'flagged';

            return (
              <button
                key={p.dag}
                type="button"
                onClick={() => handleQuickDagSelect(p.dag)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm scale-105'
                    : isSafe
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                    : isWarning
                    ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                    : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected
                      ? 'bg-white'
                      : isSafe
                      ? 'bg-emerald-600'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                  }`}
                />
                <span>{isBn ? p.labelBn : p.dag}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>{isBn ? 'নিরাপদ / সক্রিয়' : 'Verified'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>{isBn ? 'সতর্কতামূলক পর্যালোচনা' : 'Notice / Review'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            <span>{isBn ? 'বিরোধপূর্ণ / লকড' : 'Disputed / Locked'}</span>
          </span>
        </div>
      </div>

      {/* Search & Administrative Chained Hierarchy Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>{t('search.filters')}</span>
          </div>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('search.clearFilters')}</span>
          </button>
        </div>

        {/* Target Switcher: Search by Dag, Khatian, Deed, or All */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <span className="text-slate-500 text-xs shrink-0">{isBn ? 'কী দিয়ে খুঁজবেন:' : 'Search by:'}</span>
          <button
            type="button"
            onClick={() => setSearchTarget('all')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              searchTarget === 'all'
                ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isBn ? 'সাধারণ কী-ওয়ার্ড' : 'General Keyword'}
          </button>
          <button
            type="button"
            onClick={() => setSearchTarget('dag')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              searchTarget === 'dag'
                ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isBn ? 'দাগ নম্বর (Dag No)' : 'Dag Number'}
          </button>
          <button
            type="button"
            onClick={() => setSearchTarget('khatian')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              searchTarget === 'khatian'
                ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isBn ? 'খতিয়ান নম্বর (Khatian No)' : 'Khatian Number'}
          </button>
          <button
            type="button"
            onClick={() => setSearchTarget('deed')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              searchTarget === 'deed'
                ? 'bg-emerald-800 text-white border-emerald-900 font-bold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isBn ? 'দলিল নম্বর (Deed No)' : 'Deed Number'}
          </button>
        </div>

        {/* Dynamic Search Input based on target */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchTarget === 'all' && (
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('search.keywordPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 text-xs sm:text-sm bg-slate-50/50"
            />
          )}
          {searchTarget === 'dag' && (
            <input
              type="text"
              value={dagNumber}
              onChange={(e) => setDagNumber(e.target.value)}
              placeholder="e.g. DAG-2026-001"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 text-xs sm:text-sm font-mono bg-slate-50/50"
            />
          )}
          {searchTarget === 'khatian' && (
            <input
              type="text"
              value={khatianNumber}
              onChange={(e) => setKhatianNumber(e.target.value)}
              placeholder="e.g. KHT-2026-001"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 text-xs sm:text-sm font-mono bg-slate-50/50"
            />
          )}
          {searchTarget === 'deed' && (
            <input
              type="text"
              value={deedNumber}
              onChange={(e) => setDeedNumber(e.target.value)}
              placeholder="e.g. LP-2026-001"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 text-xs sm:text-sm font-mono bg-slate-50/50"
            />
          )}
        </div>

        {/* Chained Administrative Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Division */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('fields.division')}
            </label>
            <select
              value={selectedDivision}
              onChange={handleDivisionChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
            >
              <option value="">{t('fields.all')} {t('fields.division')}</option>
              {DIVISIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {isBn ? d.nameBn : d.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('fields.district')}
            </label>
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedDivision}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">{t('fields.all')} {t('fields.district')}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {isBn ? d.nameBn : d.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Upazila */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('fields.upazila')}
            </label>
            <select
              value={selectedUpazila}
              onChange={handleUpazilaChange}
              disabled={!selectedDistrict}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">{t('fields.all')} {t('fields.upazila')}</option>
              {upazilas.map((u) => (
                <option key={u.id} value={u.id}>
                  {isBn ? u.nameBn : u.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Mouza */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('fields.mouza')}
            </label>
            <select
              value={selectedMouza}
              onChange={(e) => setSelectedMouza(e.target.value)}
              disabled={!selectedUpazila}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">{t('fields.all')} {t('fields.mouza')}</option>
              {mouzas.map((m) => (
                <option key={m.id} value={m.id}>
                  {isBn ? m.nameBn : m.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Survey Type Selector */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="text-slate-500">{isBn ? 'খতিয়ান ধরন:' : 'Survey Type:'}</span>
          {['', 'CS', 'SA', 'RS', 'BS', 'BRS'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedKhatianType(type)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                selectedKhatianType === type
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === '' ? (isBn ? 'সকল জরিপ' : 'All') : type}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {t('search.results')} ({toBanglaDigits(filteredRecords.length, isBn ? 'bn' : 'en')})
          </h2>
          <span className="text-xs text-slate-500">
            {isBn ? 'জাতীয় ভূমি রেকর্ড ডাটাবেসের ফলাফল' : 'National Land Registry Database'}
          </span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Building className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">{t('search.noResults')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('search.noResultsHint')}
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('search.clearFilters')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecords.map((record) => {
              const isFlagged = record.status === 'flagged' || record.status === 'under_review';

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-500/60 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          {record.deedNumber}
                        </span>
                        <h3 className="font-black text-slate-900 text-base mt-1.5">
                          {t(`deedTypes.${record.deedType}`, record.deedType)}
                        </h3>
                      </div>
                      {isFlagged ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                          {t('history.outcomes.flagged')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          {isBn ? 'বৈধ ও সক্রিয়' : 'Active Title'}
                        </span>
                      )}
                    </div>

                    {/* Location & Survey info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">{t('fields.mouza')}:</span>
                        <span className="font-bold text-slate-800">
                          {record.mouza} (JL {record.jlNumber})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t('fields.upazila')} & {t('fields.district')}:</span>
                        <span className="font-medium text-slate-800 capitalize">
                          {record.upazila}, {record.district}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t('fields.khatianNumber')}:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {record.khatianType} ({record.khatianNumber})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t('fields.dagNumber')}:</span>
                        <span className="font-bold text-emerald-800 font-mono">
                          {record.dagNumber} ({toBanglaDigits(record.landArea, isBn ? 'bn' : 'en')} {t(`units.${record.landAreaUnit}`, record.landAreaUnit)})
                        </span>
                      </div>
                    </div>

                    {/* Parties & Ownership */}
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{t('fields.sellerRef')}:</span>
                        <span className="font-mono text-slate-700">{record.sellerRef}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{t('fields.ownerRef')}:</span>
                        <span className="font-mono text-slate-700">{record.ownerRef}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/record/${record.id}`}
                      className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 transition"
                    >
                      <span>{t('search.viewDetails')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/map?record=${record.id}`}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title={t('nav.map')}
                      >
                        <MapPin className="w-4 h-4" />
                      </Link>

                      <Link
                        to={`/verify/${encodeURIComponent(record.deedNumber)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{t('search.verifyThis')}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
