import React from 'react';
import { Eye, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const MonitorCard: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis } = useCrop();

  return (
    <div className="rounded-3xl bg-white border border-stone-200 p-4 shadow-soft mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
          <Eye className="w-3.5 h-3.5" />
        </span>
        <h3 className="text-xs font-black tracking-wide text-stone-900 font-display uppercase">
          {t.whatToMonitor}
        </h3>
      </div>

      <div className="space-y-2.5">
        {diagnosis.whatToMonitor.map((item, idx) => {
          const title =
            language === 'mr'
              ? item.titleMr
              : language === 'hi'
              ? (item.titleHi || item.title)
              : item.title;
          const check =
            language === 'mr'
              ? item.checkMr
              : language === 'hi'
              ? (item.checkHi || item.check)
              : item.check;

          return (
            <div key={idx} className="flex items-start gap-2.5 bg-stone-50/70 p-3 rounded-2xl border border-stone-200/70">
              <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-stone-900 leading-tight mb-0.5">
                  {title}
                </div>
                <div className="text-[11px] text-stone-600 leading-normal font-medium">
                  {check}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
