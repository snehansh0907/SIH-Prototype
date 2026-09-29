import React from 'react';
import { Droplets, Thermometer, ArrowUpRight, AlertCircle, Activity } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const WeatherAlertCard: React.FC = () => {
  const { language, t } = useLanguage();
  const {
    weather,
    isWeatherLoading,
    weatherError,
    refetchWeather,
    selectedFarm,
    setActiveTab,
    riskForecast,
  } = useCrop();

  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  const farmName =
    selectedFarm?.farm_name ||
    (isMarathi ? 'गोठ्याचे स्थान' : isHindi ? 'पशुशाला स्थान' : 'Barn Location');
  const latDisplay = selectedFarm?.latitude ? selectedFarm.latitude.toFixed(2) : '20.16';
  const lngDisplay = selectedFarm?.longitude ? selectedFarm.longitude.toFixed(2) : '74.12';

  if (isWeatherLoading && !weather) {
    return (
      <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/80 p-4 shadow-glass-subtle mb-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-stone-200/80 rounded-full" />
            <div className="h-2.5 w-40 bg-stone-100 rounded-full" />
          </div>
          <div className="h-3.5 w-16 bg-stone-200/80 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-2 my-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-stone-50/80 rounded-2xl p-2.5 text-center flex flex-col items-center border border-stone-200/50">
              <div className="w-4 h-4 bg-stone-200 rounded-full mb-1.5" />
              <div className="h-3.5 w-10 bg-stone-300 rounded mb-1" />
              <div className="h-2 w-14 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (weatherError && !weather) {
    return (
      <div className="rounded-3xl bg-rose-50/80 backdrop-blur-md border border-rose-200 p-4 shadow-glass-subtle mb-4 animate-fadeIn text-left">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 mt-0.5 shadow-xs">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-rose-950 font-display">
              {isMarathi ? 'हवामान माहिती उपलब्ध नाही' : isHindi ? 'मौसम की जानकारी उपलब्ध नहीं है' : 'Weather Data Unavailable'}
            </h3>
            <p className="text-[11px] text-rose-800 font-medium mt-0.5">
              {isMarathi ? 'गोठ्यासाठी हवामान सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.' : 'Could not connect to live weather feed for this barn.'}
            </p>
            <button
              type="button"
              onClick={refetchWeather}
              className="mt-2 text-xs font-bold text-rose-950 bg-rose-200/80 px-3 py-1 rounded-xl hover:bg-rose-300 transition-all cursor-pointer shadow-xs"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const temp = weather?.temp ?? 28;
  const humidity = weather?.humidity ?? 72;
  const thi = weather?.thiIndex ?? 78.5;
  const isHumid = humidity >= 75;
  const isHighTHI = thi >= 78;

  const livestockImpact =
    isMarathi
      ? (riskForecast?.recommendationMr || weather?.cropImpactSummaryMr || weather?.cropImpactSummary || '')
      : isHindi
      ? (riskForecast?.recommendationHi || weather?.cropImpactSummaryHi || weather?.cropImpactSummary || '')
      : (riskForecast?.recommendation || weather?.cropImpactSummary || '');

  return (
    <div className="rounded-3xl bg-white/88 backdrop-blur-xl border border-white/95 p-4 shadow-glass mb-4 glass-card-hover transition-all duration-300 text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-amber-100 border border-amber-200 text-amber-950 flex items-center justify-center text-base font-bold shadow-xs">
            🌦️
          </div>
          <div>
            <h3 className="text-xs font-black text-[#183027] font-display leading-tight">
              {t.todaysConditions}
            </h3>
            <p className="text-[10px] text-[#596A61] font-bold truncate max-w-[210px]">
              {farmName} ({latDisplay}°N, {lngDisplay}°E)
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('area')}
          type="button"
          className="text-[11px] font-extrabold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 transition-colors cursor-pointer group btn-tactile-subtle py-1 px-2 rounded-xl"
        >
          <span>{isMarathi ? 'रोग धोका' : isHindi ? 'रोग जोखिम' : 'Disease Risk'}</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* 3 Metric Chips: Temp, Humidity, THI Index (Floating Bubble Style) */}
      <div className="grid grid-cols-3 gap-2 my-2.5 min-w-0">
        <div className="bg-stone-50/95 rounded-2xl p-2 sm:p-2.5 text-center flex flex-col items-center justify-center border border-stone-200/80 shadow-xs min-w-0 min-h-[64px] h-auto">
          <Thermometer className="w-4 h-4 text-amber-600 mb-0.5 shrink-0" />
          <span className="text-sm font-black text-[#183027] leading-tight break-words">
            {temp}°C
          </span>
          <span className="text-[10px] text-[#596A61] font-bold leading-tight truncate xs:whitespace-normal">
            {t.temp}
          </span>
        </div>

        <div className={`rounded-2xl p-2 sm:p-2.5 text-center flex flex-col items-center justify-center border shadow-xs min-w-0 min-h-[64px] h-auto ${
          isHumid ? 'bg-sky-50 border-sky-200' : 'bg-stone-50/95 border-stone-200/80'
        }`}>
          <Droplets className={`w-4 h-4 mb-0.5 shrink-0 ${isHumid ? 'text-sky-600' : 'text-stone-500'}`} />
          <span className="text-sm font-black text-[#183027] leading-tight break-words">
            {humidity}%
          </span>
          <span className="text-[10px] text-[#596A61] font-bold leading-tight truncate xs:whitespace-normal">
            {t.humidity}
          </span>
        </div>

        <div className={`rounded-2xl p-2 sm:p-2.5 text-center flex flex-col items-center justify-center border shadow-xs min-w-0 min-h-[64px] h-auto ${
          isHighTHI ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300/40' : 'bg-stone-50/95 border-stone-200/80'
        }`}>
          <Activity className={`w-4 h-4 mb-0.5 shrink-0 ${isHighTHI ? 'text-amber-700' : 'text-stone-500'}`} />
          <span className="text-sm font-black text-amber-950 leading-tight break-words">
            {thi}
          </span>
          <span className="text-[10px] text-[#596A61] font-bold leading-tight truncate xs:whitespace-normal">
            {t.thiIndex || 'THI (Heat)'}
          </span>
        </div>
      </div>

      {/* Livestock Barn Advisory Banner */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-2.5 flex items-start gap-2 text-xs shadow-xs">
        <span className="text-base shrink-0">💡</span>
        <p className="text-[11px] font-bold text-[#183027] leading-relaxed">
          {livestockImpact || t.weatherCropImpact}
        </p>
      </div>
    </div>
  );
};

