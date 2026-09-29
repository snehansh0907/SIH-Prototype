import React from 'react';
import { MapPin, UserCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';

export const QuickActionGrid: React.FC = () => {
  const { language, t } = useLanguage();
  const { setActiveTab } = useCrop();
  const { requireFarmerAccess } = useAuth();

  return (
    <div className="text-left">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h3 className="text-xs uppercase tracking-wider font-extrabold text-stone-500 font-display">
          {t.quickActionsTitle}
        </h3>
        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {t.tapToStart}
        </span>
      </div>

      {/* PRIMARY FEATURED ACTION: Check My Animal (Dominant Forest Green Raised Liquid Card) */}
      <button
        onClick={() => requireFarmerAccess(() => setActiveTab('check'))}
        type="button"
        className="w-full rounded-3xl bg-gradient-to-r from-[#174D35] via-[#176B45] to-[#174D35] hover:shadow-float-glow text-white p-4 sm:p-4.5 shadow-md btn-tactile-hero cursor-pointer flex items-center justify-between gap-3 border border-white/20 group text-left relative overflow-hidden select-none min-w-0 min-h-[72px] h-auto"
      >
        {/* Subtle Ambient Light Shimmer */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500 ambient-bubble-drift" />
        
        <div className="flex items-center gap-3 relative z-10 min-w-0 flex-1">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-inner text-xl sm:text-2xl">
            🩺
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className="text-sm sm:text-base font-black font-display text-white tracking-tight">
                {t.actionCheckCrop}
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 shadow-xs leading-none shrink-0 transition-transform duration-200">
                AI Triage
              </span>
            </div>
            <p className="text-xs text-sage-200 font-semibold tracking-tight leading-snug break-words">
              {t.actionCheckCropSub}
            </p>
          </div>
        </div>

        <div className="w-9 h-9 rounded-2xl bg-white/12 border border-white/20 flex items-center justify-center text-amber-300 shrink-0 group-hover:translate-x-1 transition-transform duration-300 shadow-xs relative z-10">
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>

      {/* SECONDARY ACTIONS GRID: My Herd, Vaccination, My Area, Talk to a Vet */}
      <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 mt-2.5 min-w-0">
        {/* My Herd */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('herd'))}
          type="button"
          className="glass-card-interactive bg-white/90 backdrop-blur-md hover:bg-white rounded-2xl p-2 sm:p-2.5 border border-white/95 text-left shadow-glass-subtle flex flex-col justify-between min-h-[92px] h-auto min-w-0 group cursor-pointer btn-tactile-subtle"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform duration-200 text-base shadow-xs shrink-0">
            🐮
          </div>
          <div className="min-w-0 w-full">
            <div className="text-[11px] font-black text-[#183027] font-display break-words line-clamp-2 leading-tight">
              {t.actionMyHerd || 'My Herd'}
            </div>
            <div className="text-[9px] text-[#596A61] font-bold truncate mt-0.5">
              {language === 'hi' ? 'पशुधन' : language === 'mr' ? 'पशुधन' : 'Animals'}
            </div>
          </div>
        </button>

        {/* Vaccination Records */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('vaccination'))}
          type="button"
          className="glass-card-interactive bg-white/90 backdrop-blur-md hover:bg-white rounded-2xl p-2 sm:p-2.5 border border-white/95 text-left shadow-glass-subtle flex flex-col justify-between min-h-[92px] h-auto min-w-0 group cursor-pointer btn-tactile-subtle"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform duration-200 text-base shadow-xs shrink-0">
            💉
          </div>
          <div className="min-w-0 w-full">
            <div className="text-[11px] font-black text-[#183027] font-display break-words line-clamp-2 leading-tight">
              {t.actionVaccination || 'Vaccines'}
            </div>
            <div className="text-[9px] text-[#596A61] font-bold truncate mt-0.5">
              {language === 'hi' ? 'टीकाकरण' : language === 'mr' ? 'लसीकरण' : 'Schedule'}
            </div>
          </div>
        </button>

        {/* My Area Radar */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('area'))}
          type="button"
          className="glass-card-interactive bg-white/90 backdrop-blur-md hover:bg-white rounded-2xl p-2 sm:p-2.5 border border-white/95 text-left shadow-glass-subtle flex flex-col justify-between min-h-[92px] h-auto min-w-0 group cursor-pointer btn-tactile-subtle"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform duration-200 shadow-xs shrink-0">
            <MapPin className="w-4 h-4 text-sky-700" />
          </div>
          <div className="min-w-0 w-full">
            <div className="text-[11px] font-black text-[#183027] font-display break-words line-clamp-2 leading-tight">
              {t.actionMyArea}
            </div>
            <div className="text-[9px] text-[#596A61] font-bold truncate mt-0.5">
              {language === 'hi' ? 'रोग रडार' : language === 'mr' ? 'रोग रडार' : 'Radar'}
            </div>
          </div>
        </button>

        {/* Talk to a Vet */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('expert'))}
          type="button"
          className="glass-card-interactive bg-white/90 backdrop-blur-md hover:bg-white rounded-2xl p-2 sm:p-2.5 border border-white/95 text-left shadow-glass-subtle flex flex-col justify-between min-h-[92px] h-auto min-w-0 group cursor-pointer btn-tactile-subtle"
        >
          <div className="w-8 h-8 rounded-xl bg-forest-50 border border-forest-200 text-forest-900 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform duration-200 shadow-xs shrink-0">
            <UserCheck className="w-4 h-4 text-forest-800" />
          </div>
          <div className="min-w-0 w-full">
            <div className="text-[11px] font-black text-[#183027] font-display break-words line-clamp-2 leading-tight">
              {t.actionExpert}
            </div>
            <div className="text-[9px] text-[#596A61] font-bold truncate mt-0.5">
              {language === 'hi' ? 'पशुचिकित्सक' : language === 'mr' ? 'पशुवैद्यक' : 'Vet Officer'}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

