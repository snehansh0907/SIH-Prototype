import React from 'react';
import { MapPin, UserCheck, RefreshCw, BookmarkCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { VoiceButton } from '../common/VoiceButton';
import { getLocalizedAdvisoryScript } from '../../utils/speech';

export const DiagnosisActions: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis, setActiveTab } = useCrop();
  const { requireFarmerAccess } = useAuth();

  const script = getLocalizedAdvisoryScript(diagnosis, language);

  return (
    <div className="space-y-3 pt-2 text-left">
      {/* 🔊 Listen to Advice (Primary Voice Button) */}
      <VoiceButton
        textToSpeak={script}
        label={t.btnListenAdvice}
        variant="primary"
        className="text-sm py-4 rounded-2xl"
      />

      {/* Grid: View Area Risk + Ask Expert */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('area'))}
          type="button"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-white border-2 border-emerald-700 text-emerald-950 font-bold text-xs hover:bg-emerald-50 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-emerald-700" />
          <span>{t.btnViewAreaRisk}</span>
        </button>

        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('expert'))}
          type="button"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-amber-200" />
          <span>{t.btnAskExpert}</span>
        </button>
      </div>

      {/* Secondary Actions: Record Vaccination & Retake */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('herd'))}
          type="button"
          className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <BookmarkCheck className="w-4 h-4 text-forest-700" />
          <span>{t.btnAddToHistory || 'Save to Records'}</span>
        </button>

        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('check'))}
          type="button"
          className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.btnRetake}</span>
        </button>
      </div>
    </div>
  );
};
