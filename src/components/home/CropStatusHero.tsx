import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { VoiceButton } from '../common/VoiceButton';

export const CropStatusHero: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis, setActiveTab } = useCrop();
  const { requireFarmerAccess } = useAuth();

  const cropName = language === 'mr' ? diagnosis.cropNameMr : diagnosis.cropName;
  const diseaseName = language === 'mr' ? diagnosis.diseaseNameMr : diagnosis.diseaseName;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-100/50 to-emerald-500/10 border-2 border-amber-300/80 p-5 shadow-card mb-5">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-amber-300/30 blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <h2 className="text-base font-extrabold text-stone-900 font-display tracking-tight">
            {t.myCropStatus}
          </h2>
        </div>
        <StatusBadge level={diagnosis.severity} type="severity" size="sm" />
      </div>

      {/* Main Focus: Status Message */}
      <div className="mb-4">
        <div className="flex items-start gap-2.5 mb-1.5">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <h3 className="text-lg font-extrabold text-amber-950 font-display leading-tight">
            {t.statusAttention}
          </h3>
        </div>
        <p className="text-sm font-semibold text-stone-800 leading-snug pl-7">
          "{language === 'mr' ? diagnosis.whatMayHappenNext.textMr.slice(0, 105) + '...' : t.cropStatusDesc}"
        </p>
      </div>

      {/* Crop detail chip & scan time */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-amber-200/60 mb-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-stone-500">
            {language === 'mr' ? 'सध्याचे पीक' : 'Monitored Crop'}
          </div>
          <div className="text-sm font-bold text-forest-900 flex items-center gap-1.5">
            <span>🍅</span>
            <span>{cropName} ({diseaseName})</span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{t.lastScanned.split(':')[1] || 'Today'}</span>
          </div>
        </div>
      </div>

      {/* Dual Actions: Listen + View Full Advisory */}
      <div className="grid grid-cols-2 gap-2.5">
        <VoiceButton
          textToSpeak={language === 'mr' ? diagnosis.advisoryVoiceScriptMr : diagnosis.advisoryVoiceScript}
          variant="secondary"
          className="text-xs py-2.5 px-3 rounded-xl border border-stone-300 font-bold"
        />

        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('diagnosis'))}
          type="button"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 shadow-sm active:scale-95 transition-transform cursor-pointer"
        >
          <span>{language === 'mr' ? 'पूर्ण सल्ला पाहा' : 'View Advice'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
