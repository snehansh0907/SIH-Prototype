import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Camera, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { VoiceButton } from '../common/VoiceButton';
import { getLocalizedAdvisoryScript } from '../../utils/speech';
import { isDiseaseCompatibleWithCrop } from '../../services/diagnosisService';
import { getDefaultDiagnosisForCrop } from '../../services/mockData';

export const CropStatusHero: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis, setActiveTab, riskForecast } = useCrop();
  const { user, requireFarmerAccess } = useAuth();

  const isNewUser = user?.isNewUser && user?.userType === 'registered';

  const activeSpeciesKey = (user?.monitoredCrop || diagnosis?.cropId || 'cattle').toLowerCase().trim();
  const isCropMatched = (diagnosis?.cropId || '').toLowerCase().trim() === activeSpeciesKey;
  const isDiseaseValid = diagnosis?.diseaseName ? isDiseaseCompatibleWithCrop(diagnosis.diseaseName, activeSpeciesKey) : true;

  const currentDiagnosis = isCropMatched && isDiseaseValid ? diagnosis : getDefaultDiagnosisForCrop(activeSpeciesKey);

  const diseaseName =
    language === 'mr'
      ? currentDiagnosis.diseaseNameMr
      : language === 'hi'
      ? currentDiagnosis.diseaseNameHi || currentDiagnosis.diseaseName
      : currentDiagnosis.diseaseName;

  const userName =
    language === 'mr'
      ? user?.nameMr || user?.name
      : language === 'hi'
      ? user?.nameHi || user?.name
      : user?.name;

  const animalDisplayName = currentDiagnosis.animalName || (language === 'mr' ? 'गीर गाय (गौरी)' : language === 'hi' ? 'गीर गाय (गौरी)' : 'Gir Cow (Gauri)');

  // New User Onboarding State
  if (isNewUser) {
    const welcomeGreeting =
      language === 'mr'
        ? `नमस्कार, ${userName}! 👋`
        : language === 'hi'
        ? `नमस्ते, ${userName}! 👋`
        : `Namaste, ${userName}! 👋`;

    const onboardingDesc =
      language === 'mr'
        ? `तुमच्या ${user.farmName} गोठ्यातील जनावरांची लक्षणे, कास, खूर किंवा त्वचेचा फोटो काढून त्वरित पशु आरोग्य तपासणी व तज्ज्ञ पशुवैद्यकीय सल्ला मिळवा.`
        : language === 'hi'
        ? `आपकी ${user.farmName} पशुशाला में पशुओं के लक्षण, थन, खुर या त्वचा की फोटो खींचकर तुरंत प्राथमिक जांच व पशु चिकित्सक सलाह प्राप्त करें।`
        : `Your ${user.farmName} profile is ready for livestock monitoring. Take a symptom photo of your animal to start preliminary health triage.`;

    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/80 via-white/85 to-sage-50/80 backdrop-blur-xl border border-white/90 p-4 sm:p-5 shadow-glass text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐮</span>
            <h2 className="text-sm font-black text-forest-950 font-display">
              {welcomeGreeting}
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-900 text-[10px] font-extrabold border border-emerald-300 shadow-xs transition-transform duration-200">
            {t.newFarmerTag}
          </span>
        </div>

        <div className="mb-3.5">
          <h3 className="text-xs font-black text-stone-800 mb-1 flex items-center gap-1.5 font-display">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.farmProfileReady}</span>
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed font-medium">
            {onboardingDesc}
          </p>
        </div>

        {/* Primary CTA for New User: Take First Animal Health Scan */}
        <button
          onClick={() => setActiveTab('check')}
          type="button"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#174D35] to-[#176B45] hover:from-[#133f2b] hover:to-[#174D35] btn-tactile text-white font-extrabold text-xs font-display shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-amber-300" />
          <span>{t.scanFirstLeaf}</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>
    );
  }

  // Standard Monitored Animal Status
  const statusQuote =
    language === 'mr'
      ? (currentDiagnosis.whatMayHappenNext?.textMr?.slice(0, 115) || '') + '...'
      : language === 'hi'
      ? ((currentDiagnosis.whatMayHappenNext?.textHi || currentDiagnosis.whatMayHappenNext?.text)?.slice(0, 115) || '') + '...'
      : (currentDiagnosis.whatMayHappenNext?.text?.slice(0, 115) || '') + '...';

  const confPercent = Math.round(
    (currentDiagnosis.confidenceScore ?? 88) <= 1
      ? (currentDiagnosis.confidenceScore ?? 0.88) * 100
      : (currentDiagnosis.confidenceScore ?? 88)
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/88 backdrop-blur-xl border border-white/95 p-4 sm:p-5 shadow-glass text-left group min-w-0 glass-card-hover">
      {/* Decorative ambient subtle circle with gentle slow drift */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-200/15 blur-2xl pointer-events-none ambient-bubble-drift" />

      {/* Top Header - Responsive flex wrapping for title, AI pill, and Severity badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">🩺</span>
          <h2 className="text-sm font-black text-[#183027] font-display tracking-tight truncate">
            {t.myCropStatus}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end min-w-0">
          <span className="min-w-[56px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-extrabold border border-emerald-300 shadow-xs flex items-center justify-center shrink-0 transition-transform duration-200">
            AI {confPercent}%
          </span>
          <StatusBadge level={currentDiagnosis.severity} type="severity" size="sm" />
        </div>
      </div>

      {/* Main Focus: Status Message */}
      <div className="flex items-start gap-2.5 mb-3 bg-amber-50/90 p-3 rounded-2xl border border-amber-200/90 min-w-0">
        <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-[#183027] leading-relaxed flex-1 min-w-0 break-words">
          {statusQuote}
        </p>
      </div>

      {/* Animal detail strip & scan time */}
      <div className="py-2.5 px-3 rounded-2xl bg-stone-50/95 border border-stone-200/80 mb-3.5 flex flex-wrap xs:flex-nowrap items-center justify-between gap-2 text-xs shadow-xs min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-[#183027] font-black truncate shrink-0 max-w-[120px]">{animalDisplayName}</span>
          <span className="text-stone-400 shrink-0">•</span>
          <span className="text-[#596A61] font-bold truncate min-w-0 flex-1">{diseaseName}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-medium shrink-0 ml-auto">
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 font-extrabold border border-amber-300 text-[9px] uppercase tracking-wide shrink-0">
            {language === 'mr' ? 'जोखीम' : language === 'hi' ? 'जोखिम' : 'Risk'}: {riskForecast?.currentLevel?.toUpperCase() || 'MODERATE'}
          </span>
          <div className="flex items-center gap-1 text-stone-500 font-semibold shrink-0">
            <Clock className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">{t.lastScanned.split(':')[1] || 'Today'}</span>
          </div>
        </div>
      </div>

      {/* Dual Actions: Listen + View Full Advisory */}
      <div className="grid grid-cols-2 gap-2 min-w-0">
        <VoiceButton
          textToSpeak={getLocalizedAdvisoryScript(currentDiagnosis, language)}
          variant="secondary"
          className="text-xs py-2.5 px-3 min-h-[42px] h-auto rounded-2xl border border-stone-300 text-[#183027] font-bold bg-white/95 hover:bg-stone-50 shadow-xs btn-tactile"
        />

        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('diagnosis'))}
          type="button"
          className="flex items-center justify-center text-center gap-1.5 py-2.5 px-3 min-h-[42px] h-auto rounded-2xl bg-gradient-to-r from-[#174D35] to-[#176B45] text-white font-extrabold text-xs hover:shadow-md shadow-xs btn-tactile cursor-pointer leading-tight"
        >
          <span className="flex-1 min-w-0">{language === 'mr' ? 'पूर्ण सल्ला पहा' : language === 'hi' ? 'सलाह देखें' : 'View Advice'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        </button>
      </div>
    </div>
  );
};

