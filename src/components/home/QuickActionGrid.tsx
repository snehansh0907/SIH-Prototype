import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Volume2, VolumeX, UserCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { speechService, getLocalizedAdvisoryScript } from '../../utils/speech';

export const QuickActionGrid: React.FC = () => {
  const { language, t } = useLanguage();
  const { setActiveTab, diagnosis } = useCrop();
  const { requireFarmerAccess } = useAuth();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [prevLanguage, setPrevLanguage] = useState(language);

  if (language !== prevLanguage) {
    setPrevLanguage(language);
    setIsPlayingAudio(false);
    speechService.stop();
  }

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const handleListenAdvice = () => {
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
    } else {
      const script = getLocalizedAdvisoryScript(diagnosis, language);
      speechService.speak(
        script,
        language,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        (err) => {
          console.warn('[QuickActionGrid] Speech synthesis error:', err);
          setIsPlayingAudio(false);
        }
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 font-display">
          {t.quickActionsTitle}
        </h3>
        <span className="text-[11px] font-semibold text-forest-800 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {t.tapToStart}
        </span>
      </div>

      {/* PRIMARY FEATURED ACTION: Check My Crop (Large, Premium, Dark Green Card) */}
      <button
        onClick={() => requireFarmerAccess(() => setActiveTab('check'))}
        type="button"
        className="w-full rounded-2xl bg-forest-800 hover:bg-forest-850 active:scale-[0.99] text-white p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between border border-forest-700/80 group text-left relative overflow-hidden"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-forest-700/80 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-inner">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base font-bold font-display text-white tracking-tight">
                {t.actionCheckCrop}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-900 leading-none">
                AI Scan
              </span>
            </div>
            <p className="text-xs text-forest-200/90 font-medium">
              {t.actionCheckCropSub}
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-lg bg-forest-700/60 flex items-center justify-center text-amber-300 shrink-0 group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>

      {/* SECONDARY ACTIONS ROW: My Area, Listen to Advice, Talk to Expert */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {/* My Area */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('area'))}
          type="button"
          className="bg-white hover:bg-stone-50 rounded-xl p-3 border border-stone-200/80 text-left transition-all active:scale-95 shadow-xs flex flex-col justify-between min-h-[92px] group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-800 font-display line-clamp-1 leading-tight">
              {t.actionMyArea}
            </div>
            <div className="text-[10px] text-stone-400 font-medium line-clamp-1 mt-0.5">
              {language === 'hi' ? 'क्षेत्र रडार' : language === 'mr' ? 'परिसर रडार' : 'Area Radar'}
            </div>
          </div>
        </button>

        {/* Listen to Advice */}
        <button
          onClick={handleListenAdvice}
          type="button"
          className={`rounded-xl p-3 border text-left transition-all active:scale-95 shadow-xs flex flex-col justify-between min-h-[92px] group cursor-pointer ${
            isPlayingAudio
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/50'
              : 'bg-white hover:bg-stone-50 border-stone-200/80'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform ${
            isPlayingAudio ? 'bg-amber-200 text-amber-900 animate-pulse' : 'bg-amber-50 text-amber-800'
          }`}>
            {isPlayingAudio ? <VolumeX className="w-4 h-4 text-amber-900" /> : <Volume2 className="w-4 h-4 text-amber-800" />}
          </div>
          <div>
            <div className="text-xs font-bold text-stone-800 font-display line-clamp-1 leading-tight">
              {isPlayingAudio ? t.stopAudio : t.actionListen}
            </div>
            <div className="text-[10px] text-stone-400 font-medium line-clamp-1 mt-0.5">
              {language === 'hi' ? 'ऑडियो' : language === 'mr' ? 'ऑडिओ' : 'Audio TTS'}
            </div>
          </div>
        </button>

        {/* Talk to Expert */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('expert'))}
          type="button"
          className="bg-white hover:bg-stone-50 rounded-xl p-3 border border-stone-200/80 text-left transition-all active:scale-95 shadow-xs flex flex-col justify-between min-h-[92px] group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <UserCheck className="w-4 h-4 text-forest-800" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-800 font-display line-clamp-1 leading-tight">
              {t.actionExpert}
            </div>
            <div className="text-[10px] text-stone-400 font-medium line-clamp-1 mt-0.5">
              {language === 'hi' ? 'विशेषज्ञ' : language === 'mr' ? 'तज्ज्ञ सल्ला' : 'Agri Expert'}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
