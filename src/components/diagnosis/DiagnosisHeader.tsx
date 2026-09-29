import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  ArrowLeft,
  Clock,
  ImageOff,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Home,
  Check,
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

  const isRejected = Boolean(
    diagnosis.isRejected ||
    diagnosis.diagnosisAvailable === false ||
    diagnosis.type === 'invalid'
  );

  const isHealthy = Boolean(
    diagnosis.isHealthy ||
    diagnosis.type === 'healthy' ||
    (diagnosis.diseaseName && diagnosis.diseaseName.toLowerCase().includes('healthy'))
  );

  const animalDisplay = diagnosis.animalName
    ? `${diagnosis.animalName} ${diagnosis.animalTag ? `(${diagnosis.animalTag})` : ''}`
    : speciesName;

  const disclaimerText =
    language === 'mr'
      ? diagnosis.medicalDisclaimerMr || t.medicalSafetyNotice
      : language === 'hi'
      ? diagnosis.medicalDisclaimerHi || t.medicalSafetyNotice
      : diagnosis.medicalDisclaimer || t.medicalSafetyNotice;

  // =========================================================
  // 1. REJECTION / INVALID IMAGE STATE (Bug #2 fix)
  // =========================================================
  if (isRejected) {
    const rejectionMsg =
      (language === 'mr' ? diagnosis.rejectionMessageMr : language === 'hi' ? diagnosis.rejectionMessageHi : diagnosis.rejectionMessage) ||
      (language === 'mr'
        ? 'अमान्य फोटो — कृपया बाधित अवयवाचा (कातडी, कास, खूर किंवा तोंड) स्पष्ट फोटो अपलोड करा'
        : language === 'hi'
        ? 'अमान्य तस्वीर — कृपया प्रभावित अंग (त्वचा, थन, खूर या मुंह) का स्पष्ट फोटो अपलोड करें'
        : 'Invalid image — please upload a clear photo of the affected body area (skin, udder, hoof, or mouth)');

    return (
      <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/80 p-5 mb-5 shadow-card animate-fadeIn text-left">
        <div className="flex items-center justify-between mb-3.5">
          <button
            onClick={resetToHome}
            type="button"
            className="flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-stone-900 active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.navHome}</span>
          </button>

          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-extrabold border border-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-700" />
            <span>{language === 'mr' ? 'अमान्य छायाचित्र' : language === 'hi' ? 'अमान्य फोटो' : 'Invalid Image'}</span>
          </span>
        </div>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <ImageOff className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-black text-amber-950 font-display leading-tight">
              {language === 'mr'
                ? 'अमान्य फोटो — अस्पष्ट छायाचित्र'
                : language === 'hi'
                ? 'अमान्य तस्वीर — अस्पष्ट फोटो'
                : 'Invalid Image — Unclear Photo'}
            </h3>
            <p className="text-xs text-amber-900 mt-1.5 leading-relaxed font-medium">
              {rejectionMsg}
            </p>
          </div>
        </div>

        {/* Guidance tip box */}
        <div className="rounded-2xl bg-white/90 border border-amber-200 p-3 mb-4 text-[11px] text-stone-700">
          <div className="font-bold text-stone-900 mb-1 flex items-center gap-1">
            <span>💡</span>
            <span>{language === 'mr' ? 'फोटो काढण्यासाठी सूचना' : language === 'hi' ? 'फोटो लेने के निर्देश' : 'Tips for a Valid Scan'}</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-stone-600">
            <li>{language === 'mr' ? 'चांगल्या सूर्यप्रकाशात जनावरावर कॅमेरा रोखा' : language === 'hi' ? 'अच्छे उजाले में पशु के प्रभावित अंग पर फोकस करें' : 'Hold camera steady 20-30 cm from skin nodules, muzzle, or hooves'}</li>
            <li>{language === 'mr' ? 'गाड्या, माणसे किंवा भिंतींचे फोटो टाळा' : language === 'hi' ? 'गाड़ी, व्यक्ति या खाली दीवार की फोटो न लें' : 'Avoid photos of vehicles, people, indoor walls, or scenery'}</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('check')}
            className="py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'दुसरा फोटो काढा' : language === 'hi' ? 'दोबारा फोटो लें' : 'Retake Animal Photo'}</span>
          </button>
          <button
            type="button"
            onClick={resetToHome}
            className="py-3 px-4 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Home className="w-3.5 h-3.5 text-stone-600" />
            <span>{t.navHome}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // 2. HEALTHY CLASSIFICATION STATE (Bug #3 fix)
  // =========================================================
  if (isHealthy) {
    return (
      <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-5 mb-5 shadow-card animate-fadeIn text-left">
        {/* Top Header: Back + Positive Status Tag */}
        <div className="flex items-center justify-between mb-3.5">
          <button
            onClick={resetToHome}
            type="button"
            className="flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-900 active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.navHome}</span>
          </button>

          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black border border-emerald-700 flex items-center gap-1 shadow-xs">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{language === 'mr' ? 'निरोगी / रोगमुक्त' : language === 'hi' ? 'स्वस्थ / रोगमुक्त' : 'HEALTHY / DISEASE-FREE'}</span>
          </span>
        </div>

        {/* Animal identification tag */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 text-[11px] font-extrabold font-mono border border-emerald-200">
            🐄 {animalDisplay}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white text-emerald-800 text-[11px] font-bold border border-emerald-200">
            {language === 'mr' ? 'चांगली तब्येत' : language === 'hi' ? 'उत्तम स्वास्थ्य' : 'Normal Physiological Condition'}
          </span>
        </div>

        {/* Main Healthy Hero Header */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-emerald-950 font-display leading-tight">
              {language === 'mr'
                ? 'निरोगी पशु — कोणताही रोग आढळला नाही'
                : language === 'hi'
                ? 'स्वस्थ पशु — कोई रोग नहीं मिला'
                : 'Healthy Animal — No Disease Detected'}
            </h2>
            <p className="text-xs text-emerald-900 mt-1 leading-relaxed font-medium">
              {language === 'mr'
                ? 'त्वचेवर गाठी, तोंडात फोड किंवा संसर्गाची कोणतीही लक्षणे आढळली नाहीत. नेहमीचा आहार आणि लसीकरण सुरू ठेवा.'
                : language === 'hi'
                ? 'त्वचा पर कोई गांठ, मुंह में छाले या बीमारी के लक्षण नहीं मिले। पशु स्वस्थ और सक्रिय दिखाई देता है।'
                : 'No cutaneous nodules, oral blisters, or clinical disease symptoms detected. The animal appears active and in good physiological health.'}
            </p>
          </div>
        </div>

        {/* Metrics Row: Confidence & Time */}
        <div className="flex items-center justify-between py-2 px-3 rounded-2xl bg-white/90 border border-emerald-200">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-emerald-900 font-bold uppercase">{language === 'mr' ? 'विश्वासार्हता:' : language === 'hi' ? 'विश्वसनीयता:' : 'Confidence:'}</span>
            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              {diagnosis.confidenceScore || 94}%
            </span>
          </div>

          <div className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{diagnosis.detectedAt}</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 3. DISEASED STATE (Specific Pathology Detected)
  // =========================================================
  return (
    <div className="glass-card bg-white/85 border border-white/90 p-5 mb-4.5 shadow-glass rounded-3xl animate-fadeIn text-left">
      {/* Top Header: Back + Prototype Confidence Tag */}
      <div className="flex items-center justify-between mb-3.5">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 btn-tactile-subtle cursor-pointer bg-forest-50/70 px-2.5 py-1 rounded-full border border-forest-200/50 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.navHome}</span>
        </button>

        <span className="px-2.5 py-0.5 rounded-full bg-gold-50 text-gold-900 text-[10px] font-bold border border-gold-300/80 flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-600 animate-pulse" />
          <span>{t.preliminaryNotice || 'SIH26128 Triage Report'}</span>
        </span>
      </div>

      {/* Main Condition Header */}
      <div className="mb-3.5">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-forest-100/80 text-forest-900 text-[11px] font-bold font-mono border border-forest-200/50 shadow-xs">
            {animalDisplay}
          </span>
          {diagnosis.affectedBodyArea && (
            <span className="px-2.5 py-0.5 rounded-full bg-forest-800 text-white text-[11px] font-bold capitalize shadow-xs">
              {diagnosis.affectedBodyArea}
            </span>
          )}
        </div>

        <h2 className="text-xl font-black text-forest-950 font-display leading-tight">
          {diseaseName}
        </h2>
        {diagnosis.pathogen && (
          <p className="text-[11px] text-stone-500 font-medium italic mt-0.5">
            Pathogen: {diagnosis.pathogen}
          </p>
        )}
      </div>

      {/* Severity & Confidence Row */}
      <div className="flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-forest-50/50 border border-forest-100/80 mb-3.5 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-forest-900/70 font-bold uppercase">{language === 'mr' ? 'तीव्रता:' : language === 'hi' ? 'गंभीरता:' : 'Severity:'}</span>
          <StatusBadge level={diagnosis.severity} type="severity" size="sm" />
        </div>

        <div className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>{diagnosis.detectedAt}</span>
        </div>
      </div>

      {/* Symptoms Tag Strip */}
      {diagnosis.symptomsObserved && diagnosis.symptomsObserved.length > 0 && (
        <div className="mb-3.5">
          <span className="text-[10px] font-bold text-forest-900/60 uppercase tracking-wider block mb-1.5">
            {language === 'mr' ? 'नोंदवलेली लक्षणे' : language === 'hi' ? 'रिपोर्ट किए गए लक्षण' : 'Observed Symptoms'}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {diagnosis.symptomsObserved.map((sym, idx) => (
              <span key={idx} className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-white/90 text-forest-950 border border-forest-200/60 shadow-xs">
                • {sym}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CRITICAL MEDICAL SAFETY DISCLAIMER */}
      <div className="rounded-2xl bg-rose-50/80 border border-rose-200/90 p-3.5 flex items-start gap-2.5 shadow-xs">
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
