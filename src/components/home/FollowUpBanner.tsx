import React from 'react';
import confetti from 'canvas-confetti';
import { Camera, UserCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const FollowUpBanner: React.FC = () => {
  const { t } = useLanguage();
  const { followUpStatus, setFollowUpStatus, setActiveTab } = useCrop();

  const handleSelect = (status: 'better' | 'same' | 'worse') => {
    setFollowUpStatus(status);
    if (status === 'better') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#2D6A4F', '#52B788', '#D4A373', '#FBBF24']
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-white to-stone-50 border border-stone-200/90 p-4 shadow-soft mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <h3 className="text-sm font-extrabold text-stone-900 font-display">
            {t.followUpTitle}
          </h3>
        </div>
        {followUpStatus && (
          <button
            onClick={() => setFollowUpStatus(null)}
            type="button"
            className="text-[11px] font-semibold text-stone-500 hover:text-stone-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.changeAction}</span>
          </button>
        )}
      </div>

      <p className="text-xs text-stone-600 mb-3.5 leading-normal">
        {t.followUpSubtitle}
      </p>

      {/* Response choices */}
      {!followUpStatus ? (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSelect('better')}
            type="button"
            className="py-3 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 text-emerald-900 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm"
          >
            <span className="text-2xl">😊</span>
            <span>{t.btnBetter.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => handleSelect('same')}
            type="button"
            className="py-3 px-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-900 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm"
          >
            <span className="text-2xl">😐</span>
            <span>{t.btnSame.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => handleSelect('worse')}
            type="button"
            className="py-3 px-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-300/80 text-rose-900 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-sm"
          >
            <span className="text-2xl">😟</span>
            <span>{t.btnWorse.split(' ')[0]}</span>
          </button>
        </div>
      ) : (
        <div className="animate-fadeIn">
          {followUpStatus === 'better' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-950 mb-0.5">
                  {t.recoveryLogged}
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {t.feedbackBetter}
                </p>
              </div>
            </div>
          )}

          {followUpStatus === 'same' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
              <span className="text-lg">ℹ️</span>
              <div>
                <div className="text-xs font-bold text-amber-950 mb-0.5">
                  {t.continueMonitoring}
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {t.feedbackSame}
                </p>
              </div>
            </div>
          )}

          {followUpStatus === 'worse' && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3.5">
              <div className="flex items-start gap-2 mb-2.5">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="text-xs font-bold text-rose-950">
                    {t.immediateHelpRecommended}
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    {t.feedbackWorse}
                  </p>
                </div>
              </div>

              {/* Action buttons specifically requested for Worse */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-rose-200/80">
                <button
                  onClick={() => setActiveTab('check')}
                  type="button"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 active:scale-95 transition-transform shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.uploadNewPhoto}</span>
                </button>

                <button
                  onClick={() => setActiveTab('expert')}
                  type="button"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 active:scale-95 transition-transform shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{t.talkToExpertBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
