import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const DemoBadge: React.FC = () => {
  const { language, t } = useLanguage();
  const { isDemo, openLoginModal } = useAuth();

  if (!isDemo) return null;

  return (
    <div className="bg-amber-400 text-amber-950 px-3 py-1.5 flex items-center justify-between text-[11px] font-extrabold border-b border-amber-500/60 shadow-inner select-none">
      <div className="flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-amber-900 shrink-0" />
        <span className="font-display tracking-tight">
          {t.demoModeBanner}
        </span>
      </div>

      <button
        type="button"
        onClick={openLoginModal}
        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300 hover:bg-amber-900 active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm"
      >
        <span>{language === 'mr' ? 'शेतकरी लॉगिन' : 'Farmer Login'}</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
