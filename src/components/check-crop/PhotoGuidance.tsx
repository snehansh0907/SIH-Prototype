import React from 'react';
import { Check, X, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PhotoGuidance: React.FC = () => {
  const { t } = useLanguage();

  const rules = [
    { text: t.guideLighting, valid: true },
    { text: t.guideVisible, valid: true },
    { text: t.guideNoBlur, valid: false },
    { text: t.guideNoDark, valid: false },
  ];

  return (
    <div className="rounded-2xl bg-wheat-50/80 border border-wheat-200/80 p-3.5 mb-5">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Info className="w-4 h-4 text-forest-700" />
        <h4 className="text-xs font-bold text-forest-950 font-display">
          {t.guidanceTitle}
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-start gap-1.5">
            {rule.valid ? (
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <span className="text-[11px] font-medium text-stone-700 leading-tight">
              {rule.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
