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
        className="text-sm py-3.5 rounded-2xl shadow-float-glow"
      />

      {/* Grid: View Area Risk + Ask Expert */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('area'))}
          type="button"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl glass-card border border-forest-600/40 text-forest-950 font-bold text-xs hover:bg-white btn-tactile-subtle shadow-xs cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-forest-700" />
          <span>{t.btnViewAreaRisk}</span>
        </button>

        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('expert'))}
          type="button"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs btn-tactile shadow-md cursor-pointer border border-amber-400/40"
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
          className="py-2.5 px-3 rounded-xl glass-card hover:bg-white text-forest-950 font-bold text-xs flex items-center justify-center gap-1.5 btn-tactile-subtle cursor-pointer border border-white/80 shadow-xs"
        >
          <BookmarkCheck className="w-4 h-4 text-forest-700" />
          <span>{t.btnAddToHistory || 'Save to Records'}</span>
        </button>

        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('check'))}
          type="button"
          className="py-2.5 px-3 rounded-xl glass-card hover:bg-white text-forest-950 font-bold text-xs flex items-center justify-center gap-1.5 btn-tactile-subtle cursor-pointer border border-white/80 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-forest-700" />
          <span>{t.btnRetake}</span>
        </button>
      </div>
    </div>
  );
};
