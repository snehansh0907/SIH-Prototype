import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const ActionTodayCard: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis } = useCrop();

  const getIpmCategoryBadge = (category?: string) => {
    switch (category) {
      case 'cultural':
        return {
          label: t.ipmCultural,
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: '🌾'
        };
      case 'mechanical':
        return {
          label: t.ipmMechanical,
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: '✂️'
        };
      case 'biological':
        return {
          label: t.ipmBiological,
          bg: 'bg-sky-100 text-sky-900 border-sky-300',
          icon: '🧫'
        };
      case 'chemical':
        return {
          label: t.ipmChemical,
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: '🧪'
        };
      default:
        return {
          label: 'Action',
          bg: 'bg-stone-100 text-stone-800 border-stone-300',
          icon: '⚡'
        };
    }
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-forest-700/60 p-5 shadow-card mb-4">
      {/* Prominent Section Header: WHAT SHOULD I DO NOW? */}
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-stone-200">
        <span className="w-8 h-8 rounded-xl bg-forest-800 text-amber-300 flex items-center justify-center text-base font-bold shadow-sm">
          🌱
        </span>
        <div>
          <h3 className="text-base font-black tracking-tight text-forest-950 font-display">
            {t.whatShouldIDoNow}
          </h3>
          <p className="text-xs text-stone-600 font-medium">
            {t.ipmPrioritizedSteps}
          </p>
        </div>
      </div>

      {/* Numbered IPM Action Steps */}
      <div className="space-y-3">
        {diagnosis.whatToDoToday.map((action) => {
          const title =
            language === 'mr'
              ? action.titleMr
              : language === 'hi'
              ? (action.titleHi || action.title)
              : action.title;
          const desc =
            language === 'mr'
              ? action.descriptionMr
              : language === 'hi'
              ? (action.descriptionHi || action.description)
              : action.description;
          const ipm = getIpmCategoryBadge(action.category);

          return (
            <div
              key={action.step}
              className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200/90 shadow-soft"
            >
              {/* IPM Category Tag */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${ipm.bg}`}>
                  <span>{ipm.icon}</span>
                  <span>{ipm.label}</span>
                </span>
                <span className="text-[11px] font-bold text-stone-400">
                  {t.stepLabel} {action.step}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex-1">
                  <h4 className="text-sm font-black text-stone-900 leading-snug mb-1">
                    {title}
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
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
