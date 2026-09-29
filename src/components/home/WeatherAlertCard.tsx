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
      <div className="rounded-2xl bg-white border border-stone-200/70 p-4 shadow-sm mb-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-1">
            <div className="h-3 w-28 bg-stone-200 rounded" />
            <div className="h-2.5 w-40 bg-stone-100 rounded" />
          </div>
          <div className="h-3 w-16 bg-stone-200 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-2 my-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-stone-50 rounded-xl p-2.5 text-center flex flex-col items-center border border-stone-200/50">
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
      <div className="rounded-2xl bg-rose-50/70 border border-rose-200/80 p-4 shadow-sm mb-4 animate-fadeIn text-left">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-rose-950 font-display">
              {isMarathi ? 'हवामान माहिती उपलब्ध नाही' : isHindi ? 'मौसम की जानकारी उपलब्ध नहीं है' : 'Weather Data Unavailable'}
            </h3>
            <p className="text-[11px] text-rose-800 font-medium mt-0.5">
              {isMarathi ? 'गोठ्यासाठी हवामान सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.' : 'Could not connect to live weather feed for this barn.'}
            </p>
            <button
              type="button"
              onClick={refetchWeather}
              className="mt-2 text-xs font-bold text-rose-900 bg-rose-200/80 px-2.5 py-1 rounded-md hover:bg-rose-300 transition-colors"
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

  const cropImpact =
    isMarathi
      ? (riskForecast?.recommendationMr || weather?.cropImpactSummaryMr || weather?.cropImpactSummary || '')
      : isHindi
      ? (riskForecast?.recommendationHi || weather?.cropImpactSummaryHi || weather?.cropImpactSummary || '')
      : (riskForecast?.recommendation || weather?.cropImpactSummary || '');

  return (
    <div className="rounded-2xl bg-white border border-stone-200/70 p-4 shadow-sm mb-4 hover:border-forest-600/30 transition-all text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-center text-sm font-bold">
            🌦️
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 font-display leading-tight">
              {t.todaysConditions}
            </h3>
            <p className="text-[10px] text-stone-500 font-medium truncate max-w-[210px]">
              {farmName} ({latDisplay}°N, {lngDisplay}°E)
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('area')}
          type="button"
          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 transition-colors cursor-pointer group"
        >
          <span>{isMarathi ? 'रोग धोका' : isHindi ? 'रोग जोखिम' : 'Disease Risk'}</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* 3 Metric Chips: Temp, Humidity, THI Index */}
      <div className="grid grid-cols-3 gap-2 my-2.5">
        <div className="bg-stone-50/80 rounded-xl p-2.5 text-center flex flex-col items-center border border-stone-200/60">
          <Thermometer className="w-4 h-4 text-amber-600 mb-1" />
          <span className="text-sm font-black text-stone-900 leading-tight">
            {temp}°C
          </span>
          <span className="text-[10px] text-stone-500 font-medium">
            {t.temp}
          </span>
        </div>

        <div className={`rounded-xl p-2.5 text-center flex flex-col items-center border ${
          isHumid ? 'bg-sky-50/80 border-sky-200' : 'bg-stone-50/80 border-stone-200/60'
        }`}>
          <Droplets className={`w-4 h-4 mb-1 ${isHumid ? 'text-sky-600' : 'text-stone-500'}`} />
          <span className="text-sm font-black text-stone-900 leading-tight">
            {humidity}%
          </span>
          <span className="text-[10px] text-stone-500 font-medium">
            {t.humidity}
          </span>
        </div>

        <div className={`rounded-xl p-2.5 text-center flex flex-col items-center border ${
          isHighTHI ? 'bg-amber-50/80 border-amber-300' : 'bg-stone-50/80 border-stone-200/60'
        }`}>
          <Activity className={`w-4 h-4 mb-1 ${isHighTHI ? 'text-amber-700' : 'text-stone-500'}`} />
          <span className="text-sm font-black text-amber-950 leading-tight">
            {thi}
          </span>
          <span className="text-[10px] text-stone-500 font-medium">
            {t.thiIndex || 'THI (Heat)'}
          </span>
        </div>
      </div>

      {/* Livestock Impact Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2 text-xs">
        <span className="text-sm shrink-0">💡</span>
        <p className="text-[11px] font-semibold text-stone-800 leading-relaxed">
          {cropImpact || t.weatherCropImpact}
        </p>
      </div>
    </div>
  );
};
