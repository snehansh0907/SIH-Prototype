import React from 'react';
import { CloudRain, Droplets, Thermometer, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const WeatherAlertCard: React.FC = () => {
  const { language, t } = useLanguage();
  const { weather, setActiveTab } = useCrop();

  const impactSummary =
    language === 'mr'
      ? weather.cropImpactSummaryMr
      : language === 'hi'
      ? (weather.cropImpactSummaryHi || weather.cropImpactSummary)
      : weather.cropImpactSummary;

  return (
    <div className="rounded-3xl bg-white/90 border border-stone-200/90 p-4 shadow-soft mb-5">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌦️</span>
          <h3 className="text-sm font-extrabold text-stone-900 font-display">
            {t.todaysConditions}
          </h3>
        </div>
        <button
          onClick={() => setActiveTab('risk')}
          type="button"
          className="text-xs font-bold text-forest-800 hover:text-forest-900 flex items-center gap-0.5"
        >
          <span>{t.fiveDayRisk}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Conditions row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Humidity */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-2.5 text-center">
          <div className="flex items-center justify-center text-emerald-700 mb-1">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="text-sm font-extrabold text-emerald-950 font-display">
            {weather.humidity}%
          </div>
          <div className="text-[10px] font-semibold text-emerald-800 uppercase tracking-tight">
            {t.highHumidity}
          </div>
        </div>

        {/* Rain */}
        <div className="bg-sky-50/70 border border-sky-200/60 rounded-2xl p-2.5 text-center">
          <div className="flex items-center justify-center text-sky-700 mb-1">
            <CloudRain className="w-4 h-4" />
          </div>
          <div className="text-sm font-extrabold text-sky-950 font-display">
            {weather.rainfallChance}%
          </div>
          <div className="text-[10px] font-semibold text-sky-800 uppercase tracking-tight">
            {t.rainSoon}
          </div>
        </div>

        {/* Temp */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-2.5 text-center">
          <div className="flex items-center justify-center text-amber-700 mb-1">
            <Thermometer className="w-4 h-4" />
          </div>
          <div className="text-sm font-extrabold text-amber-950 font-display">
            {weather.temp}°C
          </div>
          <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-tight">
            {language === 'mr' ? 'तापमान' : language === 'hi' ? 'तापमान' : 'Temp'}
          </div>
        </div>
      </div>

      {/* Direct Connection to Crop Health (Crucial Design Requirement) */}
      <div className="bg-amber-50/90 border-l-4 border-amber-500 rounded-r-2xl p-3 flex items-start gap-2.5">
        <span className="text-base shrink-0">⚠️</span>
        <div>
          <p className="text-xs font-semibold text-amber-950 leading-relaxed">
            {impactSummary}
          </p>
          <div className="text-[11px] font-bold text-amber-800 mt-1">
            ➔ {t.weatherCropImpact}
          </div>
        </div>
      </div>
    </div>
  );
};
