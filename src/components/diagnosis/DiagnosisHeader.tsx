import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowLeft, Clock } from 'lucide-react';

export const DiagnosisHeader: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis, resetToHome } = useCrop();

  const cropName = language === 'mr' ? diagnosis.cropNameMr : diagnosis.cropName;
  const diseaseName = language === 'mr' ? diagnosis.diseaseNameMr : diagnosis.diseaseName;

  return (
    <div className="mb-4">
      {/* Back button + title */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.navHome}</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
          <Clock className="w-3 h-3 text-stone-400" />
          <span>{diagnosis.detectedAt}</span>
        </div>
      </div>

      {/* Main Identified Issue Card */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-100/40 border-2 border-amber-300 p-5 shadow-card relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
              {t.possibleIssue}
            </span>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🦠</span>
              <h2 className="text-2xl font-black text-stone-900 font-display tracking-tight leading-none">
                {diseaseName}
              </h2>
            </div>

            <div className="text-xs text-stone-600 font-medium mb-3">
              <span>{cropName}</span> • <span className="italic">{diagnosis.pathogen}</span>
            </div>

            {/* Badges: Severity + Human-friendly Confidence (No raw percentages!) */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge level={diagnosis.severity} type="severity" size="sm" />
              <StatusBadge level={diagnosis.confidenceLabel} type="confidence" size="sm" />
            </div>
          </div>

          {/* Leaf photo preview thumbnail if present */}
          {diagnosis.imageUrl && (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0">
              <img
                src={diagnosis.imageUrl}
                alt={diseaseName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
