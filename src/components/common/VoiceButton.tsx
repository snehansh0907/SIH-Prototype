import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { speechService } from '../../utils/speech';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceButtonProps {
  textToSpeak: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'pill';
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  textToSpeak,
  label,
  variant = 'primary',
  className = ''
}) => {
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [prevLanguage, setPrevLanguage] = useState(language);

  if (language !== prevLanguage) {
    setPrevLanguage(language);
    setIsPlaying(false);
    speechService.stop();
  }

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
    } else {
      const speechText = textToSpeak || t.defaultAdvisoryText;
      speechService.speak(
        speechText,
        language,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        (err) => {
          console.warn('[VoiceButton] Speech synthesis error:', err);
          setIsPlaying(false);
        }
      );
    }
  };

  const buttonLabel = label || (isPlaying ? t.stopAudio : t.btnListenAdvice);

  if (variant === 'pill') {
    return (
      <button
        onClick={handleToggle}
        type="button"
        aria-label={buttonLabel}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 ${
          isPlaying
            ? 'bg-amber-600 text-white animate-pulse shadow-amber-200'
            : 'bg-forest-100/90 text-forest-900 hover:bg-forest-200 border border-forest-300/80'
        } ${className}`}
      >
        {isPlaying ? (
          <>
            <VolumeX className="w-3.5 h-3.5 animate-bounce" />
            <span>{t.stopAudio}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-forest-700" />
            <span>{buttonLabel}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      type="button"
      className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl font-bold text-base transition-all duration-200 shadow-sm active:scale-[0.98] ${
        isPlaying
          ? 'bg-amber-700 text-white shadow-md shadow-amber-900/20 ring-2 ring-amber-400'
          : variant === 'secondary'
          ? 'bg-white/90 text-forest-900 border-2 border-forest-700 hover:bg-forest-50'
          : 'bg-forest-800 text-white hover:bg-forest-900 shadow-warm'
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-5 h-5 animate-pulse" />
          <span>{t.stopAudio}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5 text-amber-300" />
          <span>{buttonLabel}</span>
          <Sparkles className="w-4 h-4 text-wheat-300 ml-1 opacity-80" />
        </>
      )}
    </button>
  );
};
