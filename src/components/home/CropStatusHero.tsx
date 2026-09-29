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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-amber-50/60 to-white border border-amber-200/80 p-4 shadow-sm animate-fadeIn text-left">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐮</span>
            <h2 className="text-sm font-bold text-forest-950 font-display">
              {welcomeGreeting}
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200/60">
            {t.newFarmerTag}
          </span>
        </div>

        <div className="mb-3">
          <h3 className="text-xs font-bold text-stone-800 mb-1 flex items-center gap-1.5 font-display">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.farmProfileReady}</span>
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {onboardingDesc}
          </p>
        </div>

        {/* Primary CTA for New User: Take First Animal Health Scan */}
        <button
          onClick={() => setActiveTab('check')}
          type="button"
          className="w-full py-2.5 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-bold text-xs font-display transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-amber-300 animate-pulse" />
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-amber-50/50 via-white to-white border border-amber-200/70 p-4 shadow-sm text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🩺</span>
          <h2 className="text-sm font-bold text-stone-800 font-display tracking-tight">
            {t.myCropStatus}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 text-[10px] font-bold border border-forest-200">
            AI {confPercent}%
          </span>
          <StatusBadge level={currentDiagnosis.severity} type="severity" size="sm" />
        </div>
      </div>

      {/* Main Focus: Status Message (Non-contradictory risk explanation) */}
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-stone-800 leading-relaxed">
          {statusQuote}
        </p>
      </div>

      {/* Animal detail strip & scan time */}
      <div className="py-2 px-3 rounded-xl bg-stone-50 border border-stone-200/60 mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-forest-800 font-bold">{animalDisplayName}</span>
          <span className="text-stone-400">•</span>
          <span className="text-stone-600 font-medium truncate">{diseaseName}</span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-stone-400 font-medium shrink-0 ml-2">
          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[9px] uppercase tracking-wide">
            {language === 'mr' ? 'जोखीम' : language === 'hi' ? 'जोखिम' : 'Risk'}: {riskForecast?.currentLevel?.toUpperCase() || 'MODERATE'}
          </span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{t.lastScanned.split(':')[1] || 'Today'}</span>
          </div>
        </div>
      </div>

      {/* Dual Actions: Listen + View Full Advisory */}
      <div className="grid grid-cols-2 gap-2">
        <VoiceButton
          textToSpeak={getLocalizedAdvisoryScript(currentDiagnosis, language)}
          variant="secondary"
          className="text-xs py-2 px-3 rounded-xl border border-stone-300 font-semibold"
        />

        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('diagnosis'))}
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-forest-800 text-white font-semibold text-xs hover:bg-forest-900 shadow-xs active:scale-95 transition-transform cursor-pointer"
        >
          <span>{language === 'mr' ? 'पूर्ण सल्ला पहा' : language === 'hi' ? 'सलाह देखें' : 'View Advice'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
