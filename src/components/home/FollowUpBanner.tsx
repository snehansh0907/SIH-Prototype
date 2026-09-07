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
    <div className="rounded-2xl bg-white border border-stone-200/70 p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🌱</span>
          <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 font-display">
            {t.followUpTitle}
          </h3>
        </div>
        {followUpStatus && (
          <button
            onClick={() => setFollowUpStatus(null)}
            type="button"
            className="text-[11px] font-semibold text-stone-400 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.changeAction}</span>
          </button>
        )}
      </div>

      <p className="text-xs text-stone-600 mb-3 leading-relaxed">
        {t.followUpSubtitle}
      </p>

      {/* Response choices */}
      {!followUpStatus ? (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSelect('better')}
            type="button"
            className="py-2.5 px-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 text-emerald-900 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <span className="text-xl">😊</span>
            <span>{t.btnBetter.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => handleSelect('same')}
            type="button"
            className="py-2.5 px-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/70 text-amber-900 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <span className="text-xl">😐</span>
            <span>{t.btnSame.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => handleSelect('worse')}
            type="button"
            className="py-2.5 px-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/70 text-rose-900 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <span className="text-xl">😟</span>
            <span>{t.btnWorse.split(' ')[0]}</span>
          </button>
        </div>
      ) : (
        <div className="animate-fadeIn">
          {followUpStatus === 'better' && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-950 mb-0.5">
                  {t.recoveryLogged}
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {t.feedbackBetter}
                </p>
              </div>
            </div>
          )}

          {followUpStatus === 'same' && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
              <span className="text-base">ℹ️</span>
              <div>
                <div className="text-xs font-bold text-amber-950 mb-0.5">
                  {t.continueMonitoring}
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {t.feedbackSame}
                </p>
              </div>
            </div>
          )}

          {followUpStatus === 'worse' && (
            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-2.5">
                <span className="text-base shrink-0">⚠️</span>
                <div>
                  <div className="text-xs font-bold text-rose-950">
                    {t.immediateHelpRecommended}
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed font-medium">
                    {t.feedbackWorse}
                  </p>
                </div>
              </div>

              {/* Action buttons specifically requested for Worse */}
              <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-rose-200/70">
                <button
                  onClick={() => setActiveTab('check')}
                  type="button"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-forest-800 text-white font-semibold text-xs hover:bg-forest-900 active:scale-95 transition-transform shadow-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.uploadNewPhoto}</span>
                </button>

                <button
                  onClick={() => setActiveTab('expert')}
                  type="button"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 active:scale-95 transition-transform shadow-xs cursor-pointer"
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
