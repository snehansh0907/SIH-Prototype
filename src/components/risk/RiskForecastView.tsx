import React from 'react';
import { ArrowLeft, Droplets, CloudRain, MapPin, Wind, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { StatusBadge } from '../common/StatusBadge';
import { VoiceButton } from '../common/VoiceButton';

export const RiskForecastView: React.FC = () => {
  const { language, t } = useLanguage();
  const { riskForecast, resetToHome, setActiveTab } = useCrop();

  const getReasonIcon = (iconName: string) => {
    switch (iconName) {
      case 'droplet':
        return <Droplets className="w-5 h-5 text-emerald-600" />;
      case 'cloud-rain':
        return <CloudRain className="w-5 h-5 text-sky-600" />;
      case 'map-pin':
        return <MapPin className="w-5 h-5 text-amber-600" />;
      default:
        return <Wind className="w-5 h-5 text-stone-600" />;
    }
  };

  const voiceSummary = language === 'mr'
    ? `पीक धोका अंदाज: पाऊस आणि जास्त आर्द्रतेमुळे पुढील ३ आणि ४ थ्या दिवशी रोगाचा धोका उच्च राहील. आजच प्रतिबंधात्मक फवारणी पूर्ण करा.`
    : `Crop risk forecast: Due to rain and sustained humidity, disease risk will rise to high on day three and four. Apply protective spray today.`;

  return (
    <div className="pb-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.navHome}</span>
        </button>

        <VoiceButton
          textToSpeak={voiceSummary}
          variant="pill"
        />
      </div>

      {/* Screen Title */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌦️</span>
          <h2 className="text-xl font-black text-stone-900 font-display">
            {t.riskForecastTitle}
          </h2>
        </div>
        <p className="text-xs text-stone-600 mt-1 leading-normal font-medium">
          {language === 'mr' ? riskForecast.summaryMr : riskForecast.summary}
        </p>
      </div>

      {/* 5-Day Visual Risk Trajectory (Simple, agricultural, NOT financial) */}
      <div className="rounded-3xl bg-white border-2 border-stone-200/90 p-5 shadow-card mb-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
            {t.riskTrendSubtitle}
          </span>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            {language === 'mr' ? '३ऱ्या दिवशी वाढ' : 'Peak on Day 3'}
          </span>
        </div>

        {/* 5-Day Horizontal Timeline */}
        <div className="space-y-2.5">
          {riskForecast.timeline.map((dayItem, index) => {
            const dayLabel = language === 'mr' ? dayItem.dayMr : dayItem.day;
            const isToday = index === 0;

            const isHigh = dayItem.level === 'high';
            const isModerate = dayItem.level === 'moderate';

            return (
              <div
                key={dayItem.day}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isToday
                    ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                    : isHigh
                    ? 'bg-rose-50/70 border-rose-300'
                    : 'bg-stone-50/60 border-stone-200/80'
                }`}
              >
                {/* Day name & date */}
                <div className="w-24 shrink-0">
                  <div className="text-xs font-black text-stone-900 leading-tight">
                    {dayLabel} {isToday && <span className="text-[10px] text-amber-800 font-bold ml-1">●</span>}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium">
                    {dayItem.date}
                  </div>
                </div>

                {/* Visual Risk Indicator Bar (Organic) */}
                <div className="flex-1 px-2">
                  <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-600' : isModerate ? 'bg-amber-500' : 'bg-forest-600'
                      }`}
                      style={{ width: `${dayItem.score}%` }}
                    />
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div className="shrink-0 w-24 text-right">
                  <StatusBadge level={dayItem.level} type="risk" size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHY IS RISK INCREASING? (Clear Reason Cards) */}
      <div className="mb-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-stone-600 mb-3 px-1 font-display">
          {t.whyRiskIncreasing}
        </h3>

        <div className="space-y-2.5">
          {riskForecast.reasons.map((reason) => {
            const title = language === 'mr' ? reason.titleMr : reason.title;
            const detail = language === 'mr' ? reason.detailMr : reason.detail;

            return (
              <div
                key={reason.id}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-soft flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getReasonIcon(reason.icon)}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-extrabold text-stone-900 leading-snug">
                    {title}
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium mt-0.5 leading-relaxed">
                    {detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHAT SHOULD YOU DO? (Simple Actionable Recommendation) */}
      <div className="rounded-3xl bg-forest-800 text-white p-5 shadow-elevated mb-5 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-300" />
          <h3 className="text-sm font-black uppercase tracking-wide text-wheat-200 font-display">
            {t.whatShouldYouDo}
          </h3>
        </div>

        <p className="text-xs font-semibold text-white/95 leading-relaxed mb-4">
          {language === 'mr' ? riskForecast.recommendationMr : riskForecast.recommendation}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('area')}
            type="button"
            className="py-2.5 px-3 rounded-xl bg-forest-700 hover:bg-forest-600 text-white font-bold text-xs active:scale-95 transition-all text-center border border-forest-600"
          >
            {t.btnViewAreaRisk}
          </button>

          <button
            onClick={() => setActiveTab('expert')}
            type="button"
            className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-forest-950 font-extrabold text-xs active:scale-95 transition-all text-center shadow-sm"
          >
            {t.btnAskExpert}
          </button>
        </div>
      </div>
    </div>
  );
};
