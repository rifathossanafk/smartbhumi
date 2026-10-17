import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserRole } from '../types';
import { Shield, User, FileText, Scale } from 'lucide-react';

interface Props {
  role: UserRole;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export const RoleBadge: React.FC<Props> = ({ role, showIcon = true, size = 'sm', compact = false }) => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const compactLabels: Record<UserRole, string> = {
    citizen: isBn ? 'নাগরিক' : 'Citizen',
    officer: isBn ? 'সাব-রেজিস্ট্রার' : 'Sub-Registrar',
    reviewer: isBn ? 'এসি ল্যান্ড' : 'AC Land',
    admin: isBn ? 'মহাপরিচালক' : 'DG Admin',
  };

  const config = {
    citizen: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: User,
      label: compact ? compactLabels.citizen : t('login.roles.citizen'),
    },
    officer: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: FileText,
      label: compact ? compactLabels.officer : t('login.roles.officer'),
    },
    reviewer: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: Scale,
      label: compact ? compactLabels.reviewer : t('login.roles.reviewer'),
    },
    admin: {
      bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
      icon: Shield,
      label: compact ? compactLabels.admin : t('login.roles.admin'),
    },
  }[role];

  const Icon = config.icon;
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : size === 'md' ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${paddingClass} whitespace-nowrap`}
    >
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span className="truncate">{config.label}</span>
    </span>
  );
};
