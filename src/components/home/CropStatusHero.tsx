import React from 'react';
import { AlertTriangle, Clock, ArrowRight, Camera, Sparkles, Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { VoiceButton } from '../common/VoiceButton';
import { getLocalizedAdvisoryScript } from '../../utils/speech';

export const CropStatusHero: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis, setActiveTab } = useCrop();
  const { user, requireFarmerAccess } = useAuth();

  const isNewUser = user?.isNewUser && user?.userType === 'registered';

  const cropName =
    language === 'mr'
      ? diagnosis.cropNameMr
      : language === 'hi'
      ? (diagnosis.cropNameHi || diagnosis.cropName)
      : diagnosis.cropName;

  const diseaseName =
    language === 'mr'
      ? diagnosis.diseaseNameMr
      : language === 'hi'
      ? (diagnosis.diseaseNameHi || diagnosis.diseaseName)
      : diagnosis.diseaseName;

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/15 via-forest-50 to-amber-500/10 border-2 border-emerald-400/80 p-5 shadow-card mb-5 animate-fadeIn">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <h2 className="text-base font-extrabold text-forest-950 font-display tracking-tight">
              {welcomeGreeting}
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
            {t.newFarmerTag}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-1.5 font-display">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{t.farmProfileReady}</span>
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {onboardingDesc}
          </p>
        </div>

        {/* Farm & Crop Summary Chip */}
        <div className="bg-white/90 rounded-2xl p-3 border border-emerald-200/80 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-lg">
              <Sprout className="w-5 h-5 text-forest-700" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-500">
                {t.registeredFarmAndCrop}
              </div>
              <div className="text-xs font-black text-forest-950">
                {farmPlotLabel} • {monitoredCropName}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
            {user.areaAcres} {t.acresUnit}
          </span>
        </div>

        {/* Primary CTA for New User: Take First Scan */}
        <button
          onClick={() => setActiveTab('check')}
          type="button"
          className="w-full py-3.5 px-4 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-extrabold text-xs font-display transition-all shadow-elevated flex items-center justify-center gap-2 cursor-pointer border-2 border-forest-700"
        >
          <Camera className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{t.scanFirstLeaf}</span>
          <ArrowRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    );
  }

  // Standard Monitored Crop Status
  const statusQuote =
    language === 'mr'
      ? (diagnosis.whatMayHappenNext.textMr.slice(0, 105) + '...')
      : language === 'hi'
      ? ((diagnosis.whatMayHappenNext.textHi || diagnosis.whatMayHappenNext.text).slice(0, 105) + '...')
      : t.cropStatusDesc;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-100/50 to-emerald-500/10 border-2 border-amber-300/80 p-5 shadow-card mb-5">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-amber-300/30 blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <h2 className="text-base font-extrabold text-stone-900 font-display tracking-tight">
            {t.myCropStatus}
          </h2>
        </div>
        <StatusBadge level={diagnosis.severity} type="severity" size="sm" />
      </div>

      {/* Main Focus: Status Message */}
      <div className="mb-4">
        <div className="flex items-start gap-2.5 mb-1.5">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <h3 className="text-lg font-extrabold text-amber-950 font-display leading-tight">
            {t.statusAttention}
          </h3>
        </div>
        <p className="text-sm font-semibold text-stone-800 leading-snug pl-7">
          "{statusQuote}"
        </p>
      </div>

      {/* Crop detail chip & scan time */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-amber-200/60 mb-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-stone-500">
            {`${t.monitoredPlot} • ${farmPlotLabel}`}
          </div>
          <div className="text-sm font-bold text-forest-900 flex items-center gap-1.5">
            <span>🌿</span>
            <span>{cropName} ({diseaseName})</span>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
            <Clock className="w-3 h-3 text-stone-400" />
            <span>{t.lastScanned.split(':')[1] || 'Today'}</span>
          </div>
        </div>
      </div>

      {/* Dual Actions: Listen + View Full Advisory */}
      <div className="grid grid-cols-2 gap-2.5">
        <VoiceButton
          textToSpeak={getLocalizedAdvisoryScript(diagnosis, language)}
          variant="secondary"
          className="text-xs py-2.5 px-3 rounded-xl border border-stone-300 font-bold"
        />

        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('diagnosis'))}
          type="button"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 shadow-sm active:scale-95 transition-transform cursor-pointer"
        >
          <span>{t.viewAdvice}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
