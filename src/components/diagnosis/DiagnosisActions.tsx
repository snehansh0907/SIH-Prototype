import React from 'react';
import { MapPin, UserCheck, RefreshCw } from 'lucide-react';
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
    <div className="space-y-3 pt-2">
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

      {/* Retake / Check Another Leaf */}
      <button
        onClick={() => requireFarmerAccess(() => setActiveTab('check'))}
        type="button"
        className="w-full py-2.5 text-center text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{t.btnRetake}</span>
      </button>
    </div>
  );
};
