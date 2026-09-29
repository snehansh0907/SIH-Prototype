import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  ArrowLeft,
  Clock,
  ImageOff,
  ShieldAlert,
} from 'lucide-react';

export const DiagnosisHeader: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis, resetToHome, setActiveTab } = useCrop();

  const speciesName =
    language === 'mr'
      ? diagnosis.cropNameMr
      : language === 'hi'
      ? diagnosis.cropNameHi || diagnosis.cropName
      : diagnosis.cropName;

  const diseaseName =
    language === 'mr'
      ? diagnosis.diseaseNameMr
      : language === 'hi'
      ? diagnosis.diseaseNameHi || diagnosis.diseaseName
      : diagnosis.diseaseName;

  const isRejected = Boolean(diagnosis.isRejected || diagnosis.diagnosisAvailable === false);
  const reason = diagnosis.rejectionReason;

  const disclaimerText =
    language === 'mr'
      ? diagnosis.medicalDisclaimerMr || t.medicalSafetyNotice
      : language === 'hi'
      ? diagnosis.medicalDisclaimerHi || t.medicalSafetyNotice
      : diagnosis.medicalDisclaimer || t.medicalSafetyNotice;

  const animalDisplay = diagnosis.animalName
    ? `${diagnosis.animalName} ${diagnosis.animalTag ? `(${diagnosis.animalTag})` : ''}`
    : speciesName;

  // 1. REJECTION / INVALID IMAGE STATES
  if (isRejected && reason) {
    return (
      <div className="rounded-3xl border-2 border-rose-300 bg-rose-50 p-5 mb-5 shadow-card animate-fadeIn text-left">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <ImageOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-rose-950 font-display">
              {language === 'mr' ? 'अपलोड केलेला फोटो जनावराचा किंवा लक्षणाचा नाही' : language === 'hi' ? 'फोटो पशु या लक्षण का नहीं है' : 'Image not recognized as livestock symptom'}
            </h3>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              {language === 'mr' ? 'कृपया बाधित अवयवाचा (कास, खूर, तोंड, त्वचा) स्पष्ट फोटो पुन्हा अपलोड करा.' : 'Please capture a clear, focused photo of the affected animal body area.'}
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('check')}
              className="mt-3 py-2 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {language === 'mr' ? 'दुसरा फोटो काढा' : language === 'hi' ? 'दोबारा फोटो लें' : 'Retake Photo'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border-2 border-stone-200/90 p-5 mb-5 shadow-card animate-fadeIn text-left">
      {/* Top Header: Back + Prototype Confidence Tag */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.navHome}</span>
        </button>

        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[10px] font-bold border border-amber-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          <span>{t.preliminaryNotice || 'SIH26128 Triage Report'}</span>
        </span>
      </div>

      {/* Main Condition Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-bold font-mono">
            {animalDisplay}
          </span>
          {diagnosis.affectedBodyArea && (
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold capitalize">
              {diagnosis.affectedBodyArea}
            </span>
          )}
        </div>

        <h2 className="text-lg font-black text-stone-900 font-display leading-tight">
          {diseaseName}
        </h2>
        {diagnosis.pathogen && (
          <p className="text-[11px] text-stone-500 font-medium italic mt-0.5">
            Pathogen: {diagnosis.pathogen}
          </p>
        )}
      </div>

      {/* Severity & Confidence Row */}
      <div className="flex items-center justify-between py-2 px-3 rounded-2xl bg-stone-50 border border-stone-200 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-stone-500 font-bold uppercase">{language === 'mr' ? 'तीव्रता:' : language === 'hi' ? 'गंभीरता:' : 'Severity:'}</span>
          <StatusBadge level={diagnosis.severity} type="severity" size="sm" />
        </div>

        <div className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>{diagnosis.detectedAt}</span>
        </div>
      </div>

      {/* Symptoms Tag Strip */}
      {diagnosis.symptomsObserved && diagnosis.symptomsObserved.length > 0 && (
        <div className="mb-3">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
            {language === 'mr' ? 'नोंदवलेली लक्षणे' : language === 'hi' ? 'रिपोर्ट किए गए लक्षण' : 'Observed Symptoms'}:
          </span>
          <div className="flex flex-wrap gap-1">
            {diagnosis.symptomsObserved.map((sym, idx) => (
              <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                • {sym}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CRITICAL MEDICAL SAFETY DISCLAIMER */}
      <div className="rounded-2xl bg-rose-50 border-2 border-rose-300 p-3.5 flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[11px] font-black text-rose-950 uppercase tracking-tight">
            {t.medicalSafetyTitle || 'VETERINARY MEDICAL DISCLAIMER'}
          </h4>
          <p className="text-[11px] text-rose-900 mt-0.5 leading-relaxed font-medium">
            {disclaimerText}
          </p>
        </div>
      </div>
    </div>
  );
};
