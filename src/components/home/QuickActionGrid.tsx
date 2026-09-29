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
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 font-display">
          {t.quickActionsTitle}
        </h3>
        <span className="text-[11px] font-semibold text-emerald-850 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {t.tapToStart}
        </span>
      </div>

      {/* PRIMARY FEATURED ACTIONS: Check Animal (Symptoms) & Report Animal Death (Mortality) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* ACTION 1: Check My Animal */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('check'))}
          type="button"
          className="w-full rounded-2xl bg-emerald-900 hover:bg-emerald-950 active:scale-[0.99] text-white p-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between border border-emerald-800/80 group text-left relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/90 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-inner text-lg">
              🩺
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-bold font-display text-white tracking-tight">
                  {t.actionCheckCrop}
                </span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-900 leading-none">
                  Symptom AI
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-medium line-clamp-1">
                {t.actionCheckCropSub}
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-lg bg-emerald-800/60 flex items-center justify-center text-amber-300 shrink-0 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* ACTION 2: Report Animal Death (Mortality) */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('mortality'))}
          type="button"
          className="w-full rounded-2xl bg-rose-950 hover:bg-slate-900 active:scale-[0.99] text-white p-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between border border-rose-800/80 group text-left relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-800/80 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-inner text-lg">
              🪦
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-bold font-display text-white tracking-tight">
                  {language === 'mr' ? 'पशू मृत्यू नोंदवा' : language === 'hi' ? 'पशु मृत्यु दर्ज करें' : 'Report Animal Death'}
                </span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-rose-400 text-slate-950 leading-none">
                  Mortality
                </span>
              </div>
              <p className="text-[11px] text-rose-200/90 font-medium line-clamp-1">
                {language === 'mr' ? 'महामारी रोखण्यासाठी तातडीने नोंदवा' : language === 'hi' ? 'महामारी रोकथाम हेतु तुरंत सूचित करें' : 'Urgent outbreak & epidemic alert'}
              </p>
            </div>
          </div>

          <div className="w-7 h-7 rounded-lg bg-rose-800/60 flex items-center justify-center text-rose-300 shrink-0 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* SECONDARY ACTIONS GRID: My Herd, Vaccination, My Area, Talk to a Vet */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {/* My Herd */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('herd'))}
          type="button"
          className="bg-white hover:bg-stone-50 rounded-xl p-2.5 border border-stone-200/80 text-left transition-all active:scale-95 shadow-xs flex flex-col justify-between min-h-[88px] group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-sm">
            🐮
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-900 font-display line-clamp-1 leading-tight">
              {t.actionMyHerd || 'My Herd'}
            </div>
            <div className="text-[9px] text-stone-400 font-medium line-clamp-1 mt-0.5">
              {language === 'hi' ? 'पशुधन' : language === 'mr' ? 'पशुधन' : 'Animals'}
            </div>
          </div>
        </button>

        {/* Vaccination Records */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('vaccination'))}
          type="button"
          className="bg-white hover:bg-stone-50 rounded-xl p-2.5 border border-stone-200/80 text-left transition-all active:scale-95 shadow-xs flex flex-col justify-between min-h-[88px] group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform text-sm">
            💉
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-900 font-display line-clamp-1 leading-tight">
              {t.actionVaccination || 'Vaccines'}
            </div>
            <div className="text-[9px] text-stone-400 font-medium line-clamp-1 mt-0.5">
              {language === 'hi' ? 'टीकाकरण' : language === 'mr' ? 'लसीकरण' : 'Schedule'}
            </div>
          </div>
        </button>

        {/* My Area Radar */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('area'))}
          type="button"
          className="bg-white hover:bg-stone-50 rounded-xl p-2.5 border border-stone-200/80 text-left transition-all active:scale-95 shadow-xs flex flex-col justify-between min-h-[88px] group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <MapPin className="w-3.5 h-3.5 text-sky-700" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-900 font-display line-clamp-1 leading-tight">
              {t.actionMyArea}
            </div>
            <div className="text-[9px] text-stone-400 font-medium line-clamp-1 mt-0.5">
              {language === 'hi' ? 'रोग रडार' : language === 'mr' ? 'रोग रडार' : 'Radar'}
            </div>
          </div>
        </button>

        {/* Talk to a Vet */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('expert'))}
          type="button"
          className="bg-white hover:bg-stone-50 rounded-xl p-2.5 border border-stone-200/80 text-left transition-all active:scale-95 shadow-xs flex flex-col justify-between min-h-[88px] group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-stone-900 font-display line-clamp-1 leading-tight">
              {t.actionExpert}
            </div>
            <div className="text-[10px] text-stone-400 font-medium line-clamp-1 mt-0.5">
              {language === 'hi' ? 'पशुचिकित्सक' : language === 'mr' ? 'पशुवैद्यक' : 'Vet Officer'}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
