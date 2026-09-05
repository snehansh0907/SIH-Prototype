import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const ActionTodayCard: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis } = useCrop();

  return (
    <div className="rounded-3xl bg-white border-2 border-forest-700/60 p-5 shadow-card mb-4">
      {/* Prominent Section Header */}
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-stone-200">
        <span className="w-7 h-7 rounded-xl bg-forest-800 text-amber-300 flex items-center justify-center text-sm font-bold shadow-sm">
          ⚡
        </span>
        <div>
          <h3 className="text-sm font-black tracking-wide text-forest-950 font-display uppercase">
            {t.whatToDoToday}
          </h3>
          <p className="text-[11px] text-stone-500 font-medium">
            {language === 'mr' ? 'पिकाचे नुकसान टाळण्यासाठी तातडीने करावयाच्या कृती' : 'Immediate actions to contain crop damage'}
          </p>
        </div>
      </div>

      {/* Numbered Action Steps */}
      <div className="space-y-3">
        {diagnosis.whatToDoToday.map((action) => {
          const title = language === 'mr' ? action.titleMr : action.title;
          const desc = language === 'mr' ? action.descriptionMr : action.description;

          const isCritical = action.priority === 'critical';

          return (
            <div
              key={action.step}
              className={`p-3.5 rounded-2xl border transition-all ${
                isCritical
                  ? 'bg-amber-50/70 border-amber-300/80 shadow-sm'
                  : 'bg-stone-50/80 border-stone-200/80'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step Circle */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black text-xs shadow-sm ${
                    isCritical
                      ? 'bg-amber-600 text-white'
                      : 'bg-forest-800 text-white'
                  }`}
                >
                  {action.step}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-extrabold text-stone-900 leading-snug">
                      {title}
                    </h4>
                    {isCritical && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 shrink-0 ml-1">
                        {language === 'mr' ? 'तातडीने' : 'Urgent'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-normal">
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
