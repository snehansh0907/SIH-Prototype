import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Camera, Sparkles, Sprout } from 'lucide-react';
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
  const { diagnosis, setActiveTab } = useCrop();
  const { user, requireFarmerAccess } = useAuth();

  const isNewUser = user?.isNewUser && user?.userType === 'registered';

  const activeCropKey = (user?.monitoredCrop || diagnosis?.cropId || 'tomato').toLowerCase().trim();
  const isCropMatched = (diagnosis?.cropId || '').toLowerCase().trim() === activeCropKey;
  const isDiseaseValid = diagnosis?.diseaseName ? isDiseaseCompatibleWithCrop(diagnosis.diseaseName, activeCropKey) : true;

  const currentDiagnosis = (isCropMatched && isDiseaseValid)
    ? diagnosis
    : getDefaultDiagnosisForCrop(activeCropKey);

  const cropName =
    language === 'mr'
      ? currentDiagnosis.cropNameMr
      : language === 'hi'
      ? (currentDiagnosis.cropNameHi || currentDiagnosis.cropName)
      : currentDiagnosis.cropName;

  const diseaseName =
    language === 'mr'
      ? currentDiagnosis.diseaseNameMr
      : language === 'hi'
      ? (currentDiagnosis.diseaseNameHi || currentDiagnosis.diseaseName)
      : currentDiagnosis.diseaseName;

  const userName =
    language === 'mr'
      ? (user?.nameMr || user?.name)
      : language === 'hi'
      ? (user?.nameHi || user?.name)
      : user?.name;

  const defaultMyFarm = language === 'mr' ? 'माझे शेत' : language === 'hi' ? 'मेरा खेत' : 'My Farm';
  const defaultLocal = language === 'mr' ? 'स्थानिक' : language === 'hi' ? 'स्थानीय' : 'Local';

  const farmPlotLabel = user
    ? `${user.farmName || defaultMyFarm} (${user.village || user.taluka || defaultLocal})`
    : (language === 'mr' ? 'शेताचे क्षेत्र' : language === 'hi' ? 'खेत का भूखंड' : 'Farm Plot');

  const monitoredCropName =
    language === 'mr'
      ? (user?.monitoredCropMr || user?.monitoredCrop)
      : language === 'hi'
      ? (user?.monitoredCropHi || user?.monitoredCrop)
      : user?.monitoredCrop;

  // New User Onboarding State
  if (isNewUser) {
    const welcomeGreeting =
      language === 'mr'
        ? `स्वागत आहे, ${userName}! 👋`
        : language === 'hi'
        ? `स्वागत है, ${userName}! 👋`
        : `Welcome, ${userName}! 👋`;

    const onboardingDesc =
      language === 'mr'
        ? `तुमच्या ${user.farmName} मधील ${monitoredCropName} पिकाच्या पानांचा फोटो काढून त्वरित रोग तपासणी आणि तज्ज्ञ सल्ला मिळवा.`
        : language === 'hi'
        ? `आपके ${user.farmName} में ${monitoredCropName} फसल की पत्तियों की फोटो खींचकर तुरंत रोग जांच और विशेषज्ञ सलाह प्राप्त करें।`
        : `Your ${user.farmName} profile is ready for monitoring ${user.monitoredCrop}. Take a quick leaf photo to start smart AI disease detection.`;

    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-200/80 p-4 shadow-sm animate-fadeIn">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
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

        {/* Farm & Crop Summary Chip */}
        <div className="bg-stone-50 rounded-xl px-3 py-2 border border-stone-200/60 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-stone-800">
              {farmPlotLabel} • {monitoredCropName}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-stone-500">
            {user.areaAcres} {t.acresUnit}
          </span>
        </div>

        {/* Primary CTA for New User: Take First Scan */}
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

  // Standard Monitored Crop Status
  const statusQuote =
    language === 'mr'
      ? (currentDiagnosis.whatMayHappenNext.textMr.slice(0, 110) + '...')
      : language === 'hi'
      ? ((currentDiagnosis.whatMayHappenNext.textHi || currentDiagnosis.whatMayHappenNext.text).slice(0, 110) + '...')
      : (activeCropKey === 'soybean' && currentDiagnosis.whatMayHappenNext?.text
          ? (currentDiagnosis.whatMayHappenNext.text.slice(0, 110) + '...')
          : t.cropStatusDesc);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-amber-50/50 via-white to-white border border-amber-200/70 p-4 shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🌱</span>
          <h2 className="text-sm font-bold text-stone-800 font-display tracking-tight">
            {t.myCropStatus}
          </h2>
        </div>
        <StatusBadge level={currentDiagnosis.severity} type="severity" size="sm" />
      </div>

      {/* Main Focus: Status Message */}
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-stone-800 leading-relaxed">
          {statusQuote}
        </p>
      </div>

      {/* Crop detail strip & scan time */}
      <div className="py-2 px-3 rounded-xl bg-stone-50 border border-stone-200/60 mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-forest-800 font-bold">{cropName}</span>
          <span className="text-stone-400">•</span>
          <span className="text-stone-600 font-medium truncate">{diseaseName}</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium shrink-0 ml-2">
          <Clock className="w-3 h-3 text-stone-400" />
          <span>{t.lastScanned.split(':')[1] || 'Today'}</span>
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
          <span>{t.viewAdvice}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
