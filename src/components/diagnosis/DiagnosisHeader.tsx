import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowLeft, Clock, MessageSquareText } from 'lucide-react';

export const DiagnosisHeader: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis, resetToHome, setActiveTab } = useCrop();

  const cropName = language === 'mr' ? diagnosis.cropNameMr : diagnosis.cropName;
  const diseaseName = language === 'mr' ? diagnosis.diseaseNameMr : diagnosis.diseaseName;

  return (
    <div className="mb-4">
      {/* Back button + timestamp */}
      <div className="flex items-center justify-between mb-2">
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

      {/* Primary Question: What is wrong? */}
      <div className="mb-2">
        <h2 className="text-xl font-black text-stone-900 font-display">
          {t.whatIsWrong}
        </h2>
      </div>

      {/* If Diagnosis is Uncertain */}
      {diagnosis.isUncertain ? (
        <div className="rounded-3xl bg-amber-500/15 border-2 border-amber-500 p-5 shadow-card relative overflow-hidden">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-extrabold text-xl shadow-md">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-950 font-display leading-tight">
                {t.diagnosisUncertain}
              </h3>
              <p className="text-xs font-semibold text-stone-800 mt-1 leading-relaxed">
                {t.diagnosisUncertainDesc}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('expert')}
            type="button"
            className="w-full py-3.5 px-4 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <MessageSquareText className="w-4 h-4 text-amber-300" />
            <span>{t.talkToExpertCTA}</span>
          </button>
        </div>
      ) : (
        /* Standard Identified Issue Card */
        <div className="rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-100/40 border-2 border-amber-300 p-5 shadow-card relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1 font-display">
                {t.possibleIssue}
              </span>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🦠</span>
                <h3 className="text-2xl font-black text-stone-900 font-display tracking-tight leading-none">
                  {diseaseName}
                </h3>
              </div>

              <div className="text-xs text-stone-600 font-medium mb-3">
                <span>{cropName}</span> • <span className="italic">{diagnosis.pathogen}</span>
              </div>

              {/* Badges: Severity + Secondary Confidence Label */}
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
      )}
    </div>
  );
};
