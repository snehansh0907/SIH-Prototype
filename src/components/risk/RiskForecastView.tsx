import React, { useState } from 'react';
import { ArrowLeft, Droplets, CloudRain, MapPin, Wind, ShieldAlert, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { StatusBadge } from '../common/StatusBadge';
import { VoiceButton } from '../common/VoiceButton';

export const RiskForecastView: React.FC = () => {
  const { language, t } = useLanguage();
  const { riskForecast, resetToHome, setActiveTab } = useCrop();
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(true);

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

  const summary = language === 'mr' ? riskForecast.summaryMr : language === 'hi' ? (riskForecast.summaryHi || riskForecast.summary) : riskForecast.summary;

  return (
    <div className="pb-6 animate-fadeIn text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 btn-tactile-subtle cursor-pointer bg-forest-50/70 px-2.5 py-1 rounded-full border border-forest-200/50 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.navHome}</span>
        </button>

        <VoiceButton
          textToSpeak={summary}
          variant="pill"
        />
      </div>

      {/* Primary Question: What might happen next? */}
      <div className="mb-4.5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-2xl">🌦️</span>
          <h2 className="text-xl font-black text-forest-950 font-display">
            {t.whatMayHappenNext}
          </h2>
        </div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-xs font-bold text-forest-900 bg-forest-100/90 px-2.5 py-0.5 rounded-full border border-forest-200/80 shadow-xs">
            {language === 'mr' ? 'पशुधन पर्यावरण व हवामान ताण' : language === 'hi' ? 'पशुधन पर्यावरणीय एवं मौसम तनाव' : 'Livestock Environmental Stress'}
          </span>
        </div>
        <p className="glass-card text-xs text-stone-800 font-bold bg-amber-50/70 p-3.5 rounded-2xl border-amber-200/90 leading-relaxed shadow-glass">
          💡 {summary}
        </p>
      </div>

      {/* 5-Day Visual Risk Trajectory */}
      <div className="glass-card bg-white/85 border border-white/90 p-5 shadow-glass rounded-3xl mb-4.5">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-forest-950 font-display">
            {t.riskTrendSubtitle}
          </span>
          <span className="text-[11px] font-bold text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-full shadow-xs border border-amber-200/70">
            {language === 'mr' ? 'कमाल ताण ३ ऱ्या दिवशी' : language === 'hi' ? 'तीसरे दिन अधिकतम तनाव' : 'Peak stress on Day 3'}
          </span>
        </div>

        {/* 5-Day Horizontal Timeline */}
        <div className="space-y-2">
          {riskForecast.timeline.map((dayItem, index) => {
            const dayLabel = language === 'mr' ? dayItem.dayMr : language === 'hi' ? (dayItem.dayHi || dayItem.day) : dayItem.day;
            const isToday = index === 0;

            const isHigh = dayItem.level === 'high';
            const isModerate = dayItem.level === 'moderate';

            return (
              <div
                key={dayItem.day}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-xs glass-card-hover ${
                  isToday
                    ? 'bg-amber-50/80 border-amber-300/80 shadow-sm'
                    : isHigh
                    ? 'bg-rose-50/70 border-rose-200/80'
                    : 'bg-white/80 border-white/90'
                }`}
              >
                {/* Day name & date */}
                <div className="w-20 xs:w-24 shrink-0 min-w-0">
                  <div className="text-xs font-black text-forest-950 leading-tight truncate">
                    {dayLabel} {isToday && <span className="text-[10px] text-gold-600 font-bold ml-0.5">●</span>}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium truncate">
                    {dayItem.date}
                  </div>
                </div>

                {/* Visual Risk Indicator Bar */}
                <div className="flex-1 px-1 xs:px-2 min-w-0">
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex border border-stone-200/60 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-600' : isModerate ? 'bg-amber-500' : 'bg-forest-600'
                      }`}
                      style={{ width: `${dayItem.score}%` }}
                    />
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div className="shrink-0 w-20 xs:w-24 text-right flex justify-end">
                  <StatusBadge level={dayItem.level} type="risk" size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHY IS MY RISK HIGH? (Expandable Factor Breakdown directly from Risk Engine) */}
      {riskForecast.breakdown && (
        <div className="glass-card bg-white/85 border border-white/90 shadow-glass rounded-3xl mb-4.5 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-forest-50/40 btn-tactile-subtle cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-forest-100/90 text-forest-800 shadow-xs">
                <BarChart2 className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-forest-950 font-display">
                  {t.riskBreakdownTitle || 'Risk Factors Breakdown'}
                </h4>
                <p className="text-[11px] text-stone-500 font-medium">
                  {t.whyIsRiskHigh || 'Key environmental & disease transmission drivers'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-forest-50 text-forest-900 border border-forest-200/60 shadow-xs">
                {riskForecast.breakdown?.overallRisk || `${riskForecast.score || 78} / 100`}
              </span>
              {isBreakdownOpen ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </div>
          </button>

          {isBreakdownOpen && (
            <div className="px-4 pb-4 pt-1 border-t border-forest-100/60">
              <div className="divide-y divide-forest-50 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-stone-600">{t.temperatureLabel || 'Temperature'}</span>
                  <span className="font-bold text-forest-950 flex items-center gap-1.5">
                    <span className="text-stone-400 font-normal">({riskForecast.breakdown?.temperatureValue || '26°C'})</span>
                    <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-extrabold text-[11px]">
                      {riskForecast.breakdown?.temperature || 'Suitable'}
                    </span>
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-stone-600">{t.humidityLabel || 'Humidity'}</span>
                  <span className="font-bold text-forest-950 flex items-center gap-1.5">
                    <span className="text-stone-400 font-normal">({riskForecast.breakdown?.humidityValue || '84%'})</span>
                    <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-extrabold text-[11px]">
                      {riskForecast.breakdown?.humidity || 'High'}
                    </span>
                  </span>
                </div>

                {riskForecast.breakdown?.thi && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-stone-600">
                      {language === 'mr' ? 'उष्णता ताण निर्देशांक (THI)' : language === 'hi' ? 'ताप-तनाव सूचकांक (THI)' : 'Heat Stress Index (THI)'}
                    </span>
                    <span className="font-extrabold text-amber-900 px-2 py-0.5 rounded-md bg-amber-100 text-[11px]">
                      {riskForecast.breakdown.thi}
                    </span>
                  </div>
                )}

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-stone-600">{t.rainfallLabel || 'Rainfall'}</span>
                  <span className="font-bold text-forest-950 flex items-center gap-1.5">
                    <span className="text-stone-400 font-normal">({riskForecast.breakdown?.rainfallValue || '70% chance'})</span>
                    <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-extrabold text-[11px]">
                      {riskForecast.breakdown?.rainfall || 'High'}
                    </span>
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-stone-600">{t.nearbyReportsLabel || 'Nearby Cases'}</span>
                  <span className="font-extrabold text-amber-950 px-2.5 py-0.5 rounded-lg bg-amber-100 text-[11px]">
                    {riskForecast.breakdown?.nearbyReports ?? 7}
                  </span>
                </div>

                <div className="pt-3 pb-1 flex items-center justify-between font-black text-forest-950">
                  <span className="uppercase tracking-wider text-xs">{t.overallRiskLabel || 'Overall Risk Score'}</span>
                  <span className="text-base text-forest-800 font-black">
                    {riskForecast.breakdown?.overallRisk || `${riskForecast.score || 78} / 100`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WHY IS RISK INCREASING? */}
      <div className="mb-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-forest-950 mb-3 px-1 font-display">
          {t.whyRiskIncreasing}
        </h3>

        <div className="space-y-2">
          {riskForecast.reasons.map((reason) => {
            const title = language === 'mr' ? reason.titleMr : language === 'hi' ? (reason.titleHi || reason.title) : reason.title;
            const detail = language === 'mr' ? reason.detailMr : language === 'hi' ? (reason.detailHi || reason.detail) : reason.detail;

            return (
              <div
                key={reason.id}
                className="glass-card bg-white/80 rounded-2xl p-3.5 border border-white/90 shadow-glass flex items-start gap-3 glass-card-hover"
              >
                <div className="w-9 h-9 rounded-xl bg-forest-50 flex items-center justify-center shrink-0 mt-0.5 border border-forest-100/80 shadow-xs">
                  {getReasonIcon(reason.icon)}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-extrabold text-forest-950 leading-snug">
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

      {/* WHAT SHOULD YOU DO? */}
      <div className="glass-hero bg-gradient-to-br from-forest-900 via-forest-800 to-forest-900 text-white p-5 shadow-float-glow rounded-3xl mb-5 relative overflow-hidden border border-forest-600/40">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-gold-300" />
          <h3 className="text-sm font-black uppercase tracking-wide text-gold-200 font-display">
            {t.whatShouldYouDo}
          </h3>
        </div>

        <p className="text-xs font-semibold text-white/95 leading-relaxed mb-4">
          {language === 'mr' ? riskForecast.recommendationMr : language === 'hi' ? (riskForecast.recommendationHi || riskForecast.recommendation) : riskForecast.recommendation}
        </p>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
          <button
            onClick={() => setActiveTab('area')}
            type="button"
            className="py-2.5 px-3 rounded-xl bg-forest-800/80 hover:bg-forest-700/80 text-white font-bold text-xs btn-tactile text-center border border-forest-600/40 shadow-xs cursor-pointer"
          >
            {t.btnViewAreaRisk}
          </button>

          <button
            onClick={() => setActiveTab('expert')}
            type="button"
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-forest-950 font-extrabold text-xs btn-tactile text-center shadow-md cursor-pointer border border-gold-300/60"
          >
            {t.btnAskExpert}
          </button>
        </div>
      </div>
    </div>
  );
};
