import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { RoleBadge } from '../components/RoleBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { formatTimestamp, truncateHash } from '../utils/crypto';
import type { EventType, VerificationOutcome } from '../types';
import {
  Clock,
  Filter,
  Search,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileQuestion,
  AlertOctagon,
  ShieldCheck,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { verificationEvents } = useStore();
  const currentLang = i18n.language;
  const isBn = currentLang === 'bn';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');

  const filteredEvents = useMemo(() => {
    return verificationEvents.filter((evt) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesQ =
          evt.id.toLowerCase().includes(q) ||
          evt.recordRef.toLowerCase().includes(q) ||
          (evt.details && evt.details.toLowerCase().includes(q));
        if (!matchesQ) return false;
      }
      if (selectedEventType && evt.eventType !== selectedEventType) return false;
      if (selectedOutcome && evt.outcome !== selectedOutcome) return false;
      return true;
    });
  }, [verificationEvents, searchTerm, selectedEventType, selectedOutcome]);

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Record Ref', 'Event Type', 'Timestamp', 'Outcome', 'Role', 'Details'];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.recordRef,
      e.eventType,
      e.timestamp,
      e.outcome,
      e.role,
      `"${(e.details || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_bhumi_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOutcomeBadge = (outcome: VerificationOutcome) => {
    switch (outcome) {
      case 'verified':
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            {t(`history.outcomes.${outcome}`, outcome)}
          </span>
        );
      case 'mismatch':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            {t('history.outcomes.mismatch')}
          </span>
        );
      case 'flagged':
      case 'reviewRequired':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertOctagon className="w-3 h-3" />
            {t(`history.outcomes.${outcome}`, outcome)}
          </span>
        );
      case 'notFound':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <FileQuestion className="w-3 h-3" />
            {t('history.outcomes.notFound')}
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-slate-600 px-2 py-0.5 bg-slate-100 rounded">
            {outcome}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 font-sans">
            {t('history.title')}
          </h1>
          <p className="text-sm text-slate-600">
            {t('history.subtitle')}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('history.exportCSV')}</span>
        </button>
      </div>

      <DisclaimerBanner condensed />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference or event..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
          >
            <option value="">{t('fields.all')} {t('history.columns.eventType')}</option>
            <option value="registration">{t('history.eventTypes.registration')}</option>
            <option value="verification">{t('history.eventTypes.verification')}</option>
            <option value="verificationFailed">{t('history.eventTypes.verificationFailed')}</option>
            <option value="unknownLookup">{t('history.eventTypes.unknownLookup')}</option>
            <option value="reviewUpdate">{t('history.eventTypes.reviewUpdate')}</option>
            <option value="demoReset">{t('history.eventTypes.demoReset')}</option>
          </select>

          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
          >
            <option value="">{t('fields.all')} {t('history.columns.outcome')}</option>
            <option value="success">{t('history.outcomes.success')}</option>
            <option value="verified">{t('history.outcomes.verified')}</option>
            <option value="mismatch">{t('history.outcomes.mismatch')}</option>
            <option value="flagged">{t('history.outcomes.flagged')}</option>
            <option value="reviewRequired">{t('history.outcomes.reviewRequired')}</option>
            <option value="notFound">{t('history.outcomes.notFound')}</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedEventType('');
            setSelectedOutcome('');
          }}
          className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            {t('history.noHistory')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('history.columns.timestamp')}</th>
                  <th className="py-3 px-4">{t('history.columns.recordRef')}</th>
                  <th className="py-3 px-4">{t('history.columns.eventType')}</th>
                  <th className="py-3 px-4">{t('history.columns.outcome')}</th>
                  <th className="py-3 px-4">{t('history.columns.role')}</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatTimestamp(evt.timestamp, currentLang)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {evt.recordRef === 'SYSTEM' ? (
                        <span className="text-slate-400">SYSTEM</span>
                      ) : (
                        <Link
                          to={`/verify/${encodeURIComponent(evt.recordRef)}`}
                          className="text-emerald-600 hover:underline"
                        >
                          {evt.recordRef}
                        </Link>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {t(`history.eventTypes.${evt.eventType}`, evt.eventType)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getOutcomeBadge(evt.outcome)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RoleBadge role={evt.role} showIcon={false} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={evt.details}>
                      {evt.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 text-center">
        {isBn
          ? 'জাতীয় ভূমি রেজিস্ট্রি অডিট লেজার — প্রতিটি ভেরিফিকেশন ও প্রশাসনিক পদক্ষেপ ক্রিপ্টোগ্রাফিকভাবে সংরক্ষিত।'
          : 'National Land Registry Audit Ledger — All verifications and official administrative actions are cryptographically logged.'}
      </div>
    </div>
  );
};
