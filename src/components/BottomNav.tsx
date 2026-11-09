import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QrCode, FilePlus2, GitBranch, Layers, BookOpen } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const navItems = [
    { to: '/', labelBn: 'যাচাই', labelEn: 'Verify', icon: QrCode },
    { to: '/register', labelBn: 'হস্তান্তর', labelEn: 'Sell', icon: FilePlus2 },
    { to: '/mutation', labelBn: 'নামজারি', labelEn: 'Mutation', icon: GitBranch },
    { to: '/ledger', labelBn: 'লেজার', labelEn: 'Ledger', icon: Layers },
    { to: '/lineage', labelBn: 'নকশা', labelEn: 'Lineage', icon: BookOpen },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg safe-bottom"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 select-none transition-colors min-h-[48px] ${
                  isActive ? 'text-emerald-800 font-bold' : 'text-slate-500 font-medium hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-full transition-transform ${
                      isActive ? 'bg-emerald-100 text-emerald-800 scale-105' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-tight">{isBn ? item.labelBn : item.labelEn}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
