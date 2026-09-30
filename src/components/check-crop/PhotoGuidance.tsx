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
    <div className="glass-card rounded-3xl border-white/90 p-4 shadow-glass bg-white/85 text-left w-full max-w-full box-border h-auto min-h-0">
      <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-forest-100/60">
        <div className="w-6 h-6 rounded-xl bg-forest-100/90 flex items-center justify-center text-forest-800 shrink-0 shadow-xs">
          <Info className="w-3.5 h-3.5 text-forest-700" />
        </div>
        <h4 className="text-xs font-black text-forest-950 font-display uppercase tracking-wider">
          {t.guidanceTitle}
        </h4>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 w-full min-w-0 h-auto">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-start gap-2 bg-stone-50/80 p-2.5 rounded-2xl border border-stone-200/60 shadow-xs min-w-0 w-full h-auto box-border">
            {rule.valid ? (
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
            <span className="text-[11px] font-semibold text-stone-800 leading-snug break-words flex-1 min-w-0">
              {rule.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
