import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const NextOutlookCard: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis } = useCrop();

  const outlook = diagnosis.whatMayHappenNext;
  const text =
    language === 'mr'
      ? outlook.textMr
      : language === 'hi'
      ? (outlook.textHi || outlook.text)
      : outlook.text;

  return (
    <div className="glass-card bg-amber-50/70 border border-amber-200/90 p-4 shadow-glass rounded-3xl mb-4.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <h3 className="text-xs font-black tracking-wide text-amber-950 font-display uppercase">
            {t.whatMayHappenNext}
          </h3>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full shadow-xs border border-amber-300/60">
          <TrendingUp className="w-3 h-3 text-amber-700" />
          <span>{t.riskRising}</span>
        </span>
      </div>

      <p className="text-xs font-semibold text-stone-800 leading-relaxed pl-1">
        {text}
      </p>
    </div>
  );
};
