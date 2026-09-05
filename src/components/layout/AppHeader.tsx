import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const AppHeader: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { resetToHome } = useCrop();

  return (
    <header className="sticky top-0 z-40 w-full bg-forest-800/95 backdrop-blur-md text-white border-b border-forest-700/60 shadow-md">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div 
          onClick={resetToHome}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-forest-700 border border-forest-600/80 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold font-display tracking-tight text-white leading-tight">
                {t.appName}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400 text-forest-900 leading-none">
                SIH
              </span>
            </div>
            <p className="text-[11px] text-wheat-200/90 font-medium leading-none mt-0.5">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Location & Language Toggle */}
        <div className="flex items-center gap-2">
          {/* Location Badge */}
          <div className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-lg bg-forest-900/60 border border-forest-700/60 text-[11px] text-forest-200">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[85px]">Nashik</span>
          </div>

          {/* Bilingual Switcher */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-xs font-semibold transition-all"
            aria-label="Toggle language between English and Marathi"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span className={language === 'mr' ? 'text-amber-300 font-bold' : 'text-white/80'}>
              {language === 'en' ? 'मराठी' : 'English'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
