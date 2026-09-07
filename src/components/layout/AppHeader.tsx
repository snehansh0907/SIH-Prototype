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
    ? (language === 'mr' ? user.nameMr : language === 'hi' ? (user.nameHi || user.name) : user.name)
    : (language === 'mr' ? 'डेमो नमुना' : language === 'hi' ? 'डेमो किसान' : 'Demo');

  return (
    <header className="sticky top-0 z-40 w-full bg-forest-800/95 backdrop-blur-md text-white border-b border-forest-700/50 shadow-sm">
      {/* Top Demo Banner if in Demo Mode */}
      {isDemo && <DemoBadge />}

      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div 
          onClick={resetToHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-forest-700/80 border border-forest-600/60 flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition-transform shrink-0">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-[15px] font-extrabold font-display tracking-tight text-white leading-tight">
                {t.appName}
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-white/15 text-amber-300 border border-white/10 leading-none">
                SIH
              </span>
            </div>
            <p className="text-[10px] text-forest-200/80 font-medium leading-tight mt-0.5">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Auth Controls & Language Toggle */}
        <div className="flex items-center gap-2">
          {/* Logged in Farmer Profile Chip / Logout */}
          {isFarmer ? (
            <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-full pl-2.5 pr-1.5 py-1 text-[11px] text-white transition-colors">
              <UserCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-semibold truncate max-w-[85px] text-white/95">
                {userName}
              </span>
              <button
                type="button"
                onClick={logout}
                className="p-1 rounded-full hover:bg-white/20 text-white/70 hover:text-rose-300 transition-colors ml-0.5 cursor-pointer"
                title={t.btnLogout}
                aria-label="Logout"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-400 text-forest-950 hover:bg-amber-300 transition-all shadow-sm cursor-pointer"
            >
              {language === 'mr' ? 'लॉगिन' : language === 'hi' ? 'लॉगिन' : 'Login'}
            </button>
          )}

          {/* Language Switcher (Cycles: en -> hi -> mr -> en) */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-[11px] font-medium text-white/95 transition-all cursor-pointer"
            aria-label="Toggle language (English / हिंदी / मराठी)"
          >
            <Globe className="w-3 h-3 text-amber-300" />
            <span className={language !== 'en' ? 'text-amber-300 font-bold' : ''}>
              {language === 'en' ? 'En' : language === 'hi' ? 'हिं' : 'म'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
