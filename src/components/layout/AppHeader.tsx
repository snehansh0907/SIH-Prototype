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
    : (language === 'mr' ? 'डेमो पशुपालक' : language === 'hi' ? 'डेमो पशुपालक' : 'Demo Owner');

  return (
    <header className="sticky top-0 z-40 w-full bg-[#174D35] text-white border-b border-[#0F3524] shadow-md transition-all pt-[max(0.625rem,env(safe-area-inset-top,0.625rem))] pb-2.5 px-3.5 sm:px-4">
      {/* Top Demo Banner if in Demo Mode */}
      {isDemo && <DemoBadge />}

      <div className="max-w-md mx-auto flex items-center justify-between gap-2 min-w-0">
        {/* Brand & Tagline */}
        <div 
          onClick={resetToHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group min-w-0 flex-1"
        >
          {/* Logo inside small white circular container for maximum visibility */}
          <div className="w-9 h-9 rounded-full bg-white text-forest-950 shadow-sm flex items-center justify-center text-lg shrink-0 border border-white/90 group-hover:scale-105 transition-transform duration-200">
            🐄
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-[15px] sm:text-base font-black font-display tracking-tight text-white leading-tight">
                {t.appName}
              </h1>
              <span className="text-[9px] uppercase font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#F6BD28] text-[#174D35] shadow-xs shrink-0">
                {t.sihBadge || 'SIH26128'}
              </span>
            </div>
            <p className="text-[10px] text-[#D8EBDD] font-medium leading-tight mt-0.5 tracking-tight truncate max-w-[180px] xs:max-w-[220px] sm:max-w-[260px]">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Auth Controls & Language Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Logged in Farmer Profile Chip / Logout */}
          {isFarmer ? (
            <div className="flex items-center gap-1 bg-white/15 hover:bg-white/20 border border-white/20 rounded-full pl-2 pr-1 py-1 text-[11px] text-white transition-all shadow-xs min-w-0 max-w-[125px] xs:max-w-[150px]">
              <UserCheck className="w-3.5 h-3.5 text-[#F6BD28] shrink-0" />
              <span className="font-bold truncate text-white min-w-0 flex-1">
                {userName}
              </span>
              <button
                type="button"
                onClick={logout}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-rose-300 btn-tactile-icon transition-colors shrink-0 cursor-pointer"
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
              className="text-[10px] font-extrabold px-3 py-1.5 rounded-full bg-[#F6BD28] text-[#174D35] hover:bg-amber-300 btn-tactile-subtle transition-all shadow-xs cursor-pointer shrink-0"
            >
              {language === 'mr' ? 'लॉगिन' : language === 'hi' ? 'लॉगिन' : 'Login'}
            </button>
          )}

          {/* Language Switcher (Cycles: en -> hi -> mr -> en) */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 btn-tactile-subtle border border-white/20 text-[11px] font-bold text-white transition-all cursor-pointer shadow-xs shrink-0"
            aria-label="Toggle language (English / हिंदी / मराठी)"
          >
            <Globe className="w-3 h-3 text-[#F6BD28] shrink-0" />
            <span className={language !== 'en' ? 'text-[#F6BD28] font-extrabold' : 'text-white'}>
              {language === 'en' ? 'En' : language === 'hi' ? 'हिं' : 'म'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

