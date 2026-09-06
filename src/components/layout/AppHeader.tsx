import React from 'react';
import { Globe, LogOut, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { DemoBadge } from '../auth/DemoBadge';

export const AppHeader: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { resetToHome } = useCrop();
  const { isFarmer, isDemo, user, logout, openLoginModal } = useAuth();

  const userName = isFarmer && user
    ? (language === 'mr' ? user.nameMr : user.name)
    : (language === 'mr' ? 'डेमो नमुना' : 'Demo');

  return (
    <header className="sticky top-0 z-40 w-full bg-forest-800/95 backdrop-blur-md text-white border-b border-forest-700/60 shadow-md">
      {/* Top Demo Banner if in Demo Mode */}
      {isDemo && <DemoBadge />}

      <div className="max-w-md mx-auto px-3.5 py-2.5 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div 
          onClick={resetToHome}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-forest-700 border border-forest-600/80 flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform shrink-0">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-sm font-extrabold font-display tracking-tight text-white leading-tight">
                {t.appName}
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400 text-forest-900 leading-none">
                SIH
              </span>
            </div>
            <p className="text-[10px] text-amber-300 font-semibold leading-none mt-0.5">
              "{t.appTagline}"
            </p>
          </div>
        </div>

        {/* Auth Controls & Language Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Logged in Farmer Profile Chip / Logout */}
          {isFarmer ? (
            <div className="flex items-center gap-1 bg-forest-900/90 border border-forest-700/90 rounded-full pl-2 pr-1 py-0.5 text-[11px] text-wheat-200">
              <UserCheck className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="font-bold truncate max-w-[80px] text-amber-200">
                {userName}
              </span>
              <button
                type="button"
                onClick={logout}
                className="p-1 rounded-full hover:bg-forest-800 text-stone-300 hover:text-rose-300 transition-colors ml-0.5"
                title={t.btnLogout}
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-amber-400 text-forest-950 hover:bg-amber-300 transition-all shadow-sm"
            >
              {language === 'mr' ? 'लॉगिन' : 'Login'}
            </button>
          )}

          {/* Bilingual Switcher */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-[11px] font-semibold transition-all"
            aria-label="Toggle language between English and Marathi"
          >
            <Globe className="w-3 h-3 text-amber-300" />
            <span className={language === 'mr' ? 'text-amber-300 font-bold' : 'text-white/80'}>
              {language === 'en' ? 'मराठी' : 'EN'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
