import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Volume2, VolumeX, UserCheck, Sparkles } from 'lucide-react';
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

  const actions = [
    {
      id: 'check',
      title: t.actionCheckCrop,
      subtitle: t.actionCheckCropSub,
      icon: <Camera className="w-7 h-7 text-white" />,
      bg: 'bg-gradient-to-br from-forest-800 to-forest-900',
      iconBg: 'bg-forest-700/70 text-white',
      textColor: 'text-white',
      subColor: 'text-wheat-200/90',
      badge: 'AI Scan',
      onClick: () => requireFarmerAccess(() => setActiveTab('check')),
    },
    {
      id: 'area',
      title: t.actionMyArea,
      subtitle: t.actionMyAreaSub,
      icon: <MapPin className="w-7 h-7 text-emerald-800" />,
      bg: 'bg-white',
      iconBg: 'bg-emerald-100 text-emerald-800',
      textColor: 'text-stone-900',
      subColor: 'text-stone-500',
      border: 'border border-stone-200',
      badge: language === 'hi' ? 'क्षेत्र रडार' : language === 'mr' ? 'परिसर रडार' : 'Area Radar',
      onClick: () => requireFarmerAccess(() => setActiveTab('area')),
    },
    {
      id: 'listen',
      title: isPlayingAudio ? t.stopAudio : t.actionListen,
      subtitle: t.actionListenSub,
      icon: isPlayingAudio ? <VolumeX className="w-7 h-7 text-amber-900 animate-bounce" /> : <Volume2 className="w-7 h-7 text-amber-800" />,
      bg: isPlayingAudio ? 'bg-amber-100 ring-2 ring-amber-500' : 'bg-white',
      iconBg: 'bg-amber-100 text-amber-800',
      textColor: 'text-stone-900',
      subColor: 'text-stone-500',
      border: 'border border-stone-200',
      badge: language === 'hi' ? 'आवाज़ में सुनें' : language === 'mr' ? 'ध्वनी सल्ला' : 'Audio TTS',
      onClick: handleListenAdvice,
    },
    {
      id: 'expert',
      title: t.actionExpert,
      subtitle: t.actionExpertSub,
      icon: <UserCheck className="w-7 h-7 text-forest-800" />,
      bg: 'bg-white',
      iconBg: 'bg-forest-100 text-forest-800',
      textColor: 'text-stone-900',
      subColor: 'text-stone-500',
      border: 'border border-stone-200',
      badge: language === 'hi' ? 'कृषि विशेषज्ञ' : language === 'mr' ? 'तज्ञ सल्ला' : 'Agri Expert',
      onClick: () => requireFarmerAccess(() => setActiveTab('expert')),
    },
  ];

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs uppercase tracking-wider font-extrabold text-stone-500 font-display">
          {t.quickActionsTitle}
        </h3>
        <span className="text-[11px] font-semibold text-forest-800 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {t.tapToStart}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={act.onClick}
            type="button"
            className={`${act.bg} ${act.border || ''} rounded-3xl p-4 text-left shadow-soft hover:shadow-card active:scale-[0.97] transition-all duration-200 flex flex-col justify-between min-h-[140px] relative overflow-hidden group`}
          >
            {/* Top row: Icon + optional badge */}
            <div className="flex items-start justify-between w-full mb-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${act.iconBg} group-hover:scale-105 transition-transform`}>
                {act.icon}
              </div>
              {act.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  act.id === 'check' ? 'bg-amber-400 text-stone-900' : 'bg-stone-100 text-stone-600 border border-stone-200'
                }`}>
                  {act.badge}
                </span>
              )}
            </div>

            {/* Bottom: Title & Subtitle */}
            <div>
              <div className={`text-base font-extrabold font-display leading-tight ${act.textColor}`}>
                {act.title}
              </div>
              <div className={`text-xs mt-0.5 line-clamp-1 font-medium ${act.subColor}`}>
                {act.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
