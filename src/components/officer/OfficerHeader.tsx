import React from 'react';
import { Globe, RefreshCw, LogOut, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface OfficerHeaderProps {
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const OfficerHeader: React.FC<OfficerHeaderProps> = ({ isLoading = false, onRefresh }) => {
  const { language, toggleLanguage } = useLanguage();
  const { logout, loginAsDemo } = useAuth();

  const officerTitle = language === 'mr'
    ? 'तालुका पशुवैद्यकीय अधिकारी'
    : language === 'hi'
    ? 'तालुका पशु चिकित्सा अधिकारी'
    : 'Taluka Veterinary Officer';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#174D35] text-white border-b border-[#0F3524] shadow-md transition-all pt-[max(0.625rem,env(safe-area-inset-top,0.625rem))] pb-2.5 px-3.5 sm:px-4">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2 min-w-0">
        {/* Brand & Officer Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-white text-forest-950 shadow-sm flex items-center justify-center text-lg shrink-0 border border-white/90">
            🦁
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-[15px] sm:text-base font-black font-display tracking-tight text-white leading-tight">
                Pashu Sarthak
              </h1>
              <span className="text-[9px] uppercase font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#F6BD28] text-[#174D35] shadow-xs shrink-0">
                VET SURV
              </span>
            </div>
            <p className="text-[10px] text-[#D8EBDD] font-medium leading-tight mt-0.5 tracking-tight truncate max-w-[180px] xs:max-w-[220px] sm:max-w-[260px]">
              Dr. Rajesh Kadam • {officerTitle}, Niphad
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Refresh Data Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 btn-tactile-icon border border-white/20 text-white transition-all cursor-pointer shadow-xs shrink-0"
              title="Refresh Surveillance Data"
              aria-label="Refresh surveillance data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F6BD28]' : 'text-white'}`} />
            </button>
          )}

          {/* Language Switcher (Cycles: en -> hi -> mr -> en) */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 hover:bg-white/25 btn-tactile-subtle border border-white/20 text-[11px] font-bold text-white transition-all cursor-pointer shadow-xs shrink-0"
            aria-label="Toggle language (English / हिंदी / मराठी)"
          >
            <Globe className="w-3 h-3 text-[#F6BD28] shrink-0" />
            <span className={language !== 'en' ? 'text-[#F6BD28] font-extrabold' : 'text-white'}>
              {language === 'en' ? 'En' : language === 'hi' ? 'हिं' : 'म'}
            </span>
          </button>

          {/* Quick Switch to Owner Mode */}
          <button
            type="button"
            onClick={() => loginAsDemo('ramesh')}
            title="Switch to Livestock Owner Role"
            className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-full bg-[#F6BD28] text-[#174D35] hover:bg-amber-300 font-extrabold text-[10px] btn-tactile-subtle transition-all shadow-xs cursor-pointer shrink-0"
          >
            <ArrowLeftRight className="w-2.5 h-2.5" />
            <span>Owner</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-full bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white border border-rose-500/40 btn-tactile-icon transition-colors shrink-0 cursor-pointer"
            title="Logout Veterinary Session"
            aria-label="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
