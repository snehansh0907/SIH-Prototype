import React from 'react';
import { ArrowLeftRight, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../types';

export const OfficerProfile: React.FC = () => {
  const { logout, loginAsDemo } = useAuth();
  const { language, setLanguage } = useLanguage();

  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  return (
    <div className="space-y-3.5 animate-fadeIn min-w-0">
      {/* Officer ID Card */}
      <div className="bg-white/95 p-4 rounded-3xl border border-stone-200 shadow-glass-sm space-y-3.5 min-w-0">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-forest-800 text-white border-2 border-[#F6BD28] flex items-center justify-center text-2xl shadow-md shrink-0">
            🦁
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-forest-100 text-forest-900 font-display">
                Class-I Gazetted
              </span>
              <span className="text-[9px] font-bold px-2 py-0.2 rounded bg-amber-100 text-amber-900 font-display">
                Live Unit
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 font-display truncate">
              Dr. Rajesh Kadam
            </h3>
            <p className="text-[11px] text-stone-600 font-medium truncate">
              Taluka Veterinary Officer • Niphad, Nashik
            </p>
          </div>
        </div>

        {/* Jurisdiction Details 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-left">
          <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Officer ID</span>
            <span className="font-mono font-black text-xs text-stone-900">VET-NIPHAD-001</span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Official Email</span>
            <span className="font-mono font-bold text-[11px] text-stone-900 truncate block">vet_niphad@gov.in</span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Gram Panchayats</span>
            <span className="font-extrabold text-xs text-stone-900">134 Assigned</span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Dispensaries</span>
            <span className="font-extrabold text-xs text-stone-900">4 Primary Units</span>
          </div>
        </div>
      </div>

      {/* Language Preferences Card */}
      <div className="bg-white/95 p-3.5 rounded-3xl border border-stone-200 shadow-glass-sm space-y-2.5 min-w-0">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-600 font-display px-0.5">
          {isMarathi ? 'भाषा निवडा' : isHindi ? 'भाषा चुनें' : 'Language Preferences'}
        </h4>

        <div className="grid grid-cols-3 gap-2">
          {[
            { code: 'en', label: '🇬🇧 English' },
            { code: 'hi', label: '🇮🇳 हिन्दी' },
            { code: 'mr', label: '🐄 मराठी' },
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code as Language)}
              className={`py-2 px-1 rounded-2xl text-xs font-bold border transition-all active:scale-95 cursor-pointer text-center ${
                language === l.code
                  ? 'bg-forest-800 text-white font-black border-forest-700 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role Switch & Logout Actions */}
      <div className="bg-white/95 p-3.5 rounded-3xl border border-stone-200 shadow-glass-sm space-y-2.5 min-w-0">
        <button
          type="button"
          onClick={() => loginAsDemo('ramesh')}
          className="w-full py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-800 font-extrabold text-xs transition-all border border-stone-300 flex items-center justify-center gap-2 cursor-pointer font-display"
        >
          <ArrowLeftRight className="w-4 h-4 text-forest-700 shrink-0" />
          <span>{isMarathi ? '🐄 पशुपालक मोडवर स्विच करा' : isHindi ? '🐄 पशुपालक मोड पर स्विच करें' : 'Switch to 🐄 Livestock Owner Role'}</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-900 font-extrabold text-xs transition-all border border-rose-200 flex items-center justify-center gap-2 cursor-pointer font-display"
        >
          <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{isMarathi ? 'लॉगआउट करा' : isHindi ? 'लॉगआउट करें' : 'Logout Veterinary Session'}</span>
        </button>
      </div>
    </div>
  );
};
