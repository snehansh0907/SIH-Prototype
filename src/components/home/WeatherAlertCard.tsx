import React from 'react';
import { CloudRain, Droplets, Thermometer, ArrowUpRight, AlertCircle, RefreshCw, MapPin } from 'lucide-react';
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
    setSelectedFarm,
    availableFarms,
    setActiveTab,
  } = useCrop();

  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  const farmName =
    selectedFarm?.farm_name ||
    (isMarathi ? 'शेताचे स्थान' : isHindi ? 'खेत का स्थान' : 'Farm Location');
  const latDisplay = selectedFarm?.latitude ? selectedFarm.latitude.toFixed(2) : '20.16';
  const lngDisplay = selectedFarm?.longitude ? selectedFarm.longitude.toFixed(2) : '74.12';

  // Loading skeleton state
  if (isWeatherLoading && !weather) {
    return (
      <div className="rounded-2xl bg-white border border-stone-200/70 p-4 shadow-sm mb-4 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-1">
            <div className="h-3 w-28 bg-stone-200 rounded" />
            <div className="h-2.5 w-40 bg-stone-100 rounded" />
          </div>
          <div className="h-3 w-16 bg-stone-200 rounded" />
        </div>

        {/* 3 cards skeleton */}
        <div className="grid grid-cols-3 gap-2 my-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-stone-50 rounded-xl p-2.5 text-center flex flex-col items-center border border-stone-200/50">
              <div className="w-4 h-4 bg-stone-200 rounded-full mb-1.5" />
              <div className="h-3.5 w-10 bg-stone-300 rounded mb-1" />
              <div className="h-2 w-14 bg-stone-200 rounded" />
            </div>
          ))}
        </div>

        {/* Advisory banner skeleton */}
        <div className="bg-amber-50/50 rounded-xl p-2.5 flex items-start gap-2 border border-amber-200/40">
          <div className="w-4 h-4 bg-amber-200 rounded-full shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-2.5 w-full bg-amber-200/60 rounded" />
            <div className="h-2.5 w-3/4 bg-amber-200/60 rounded" />
          </div>
        </div>

        <div className="mt-2 text-center text-[10px] text-stone-400 font-medium flex items-center justify-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin text-forest-700" />
          <span>
            {isMarathi
              ? 'थेट हवामान माहिती मिळवत आहे (Open-Meteo)...'
              : isHindi
              ? 'मौसम की ताज़ा जानकारी प्राप्त की जा रही है (Open-Meteo)...'
              : 'Fetching live farm weather (Open-Meteo)...'}
          </span>
        </div>
      </div>
    );
  }

  // Graceful error state with Retry action (no silent fake numbers)
  if (weatherError && !weather) {
    return (
      <div className="rounded-2xl bg-rose-50/70 border border-rose-200/80 p-4 shadow-sm mb-4 animate-fadeIn">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-rose-950 font-display">
              {isMarathi
                ? 'हवामान माहिती उपलब्ध नाही'
                : isHindi
                ? 'मौसम की जानकारी उपलब्ध नहीं है'
                : 'Weather Data Unavailable'}
            </h3>
            <p className="text-[11px] text-rose-800 font-medium mt-0.5">
              {isMarathi
                ? 'या शेतासाठी हवामान सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.'
                : isHindi
                ? 'इस खेत के लिए मौसम डेटा प्राप्त नहीं हो सका। कृपया पुनः प्रयास करें।'
                : 'Could not connect to live weather feed for this farm. Please check your network and try again.'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetchWeather()}
                className="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isMarathi ? 'पुन्हा प्रयत्न करा' : isHindi ? 'पुनः प्रयास करें' : 'Try Again'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Live Weather Data
  const impactSummary = weather
    ? isMarathi
      ? weather.cropImpactSummaryMr
      : isHindi
      ? (weather.cropImpactSummaryHi || weather.cropImpactSummary)
      : weather.cropImpactSummary
    : '';

  return (
    <div className="rounded-2xl bg-white border border-stone-200/70 p-4 shadow-sm transition-all">
      {/* Top Header: Title, Location + LIVE badge & 5-Day Risk */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 font-display">
            {t.todaysConditions}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
            <span className="truncate max-w-[190px] sm:max-w-[240px]">
              {farmName} ({latDisplay}°N, {lngDisplay}°E)
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[9px] font-bold uppercase tracking-wider shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Live</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('risk')}
          type="button"
          className="text-xs font-semibold text-forest-800 hover:text-forest-900 flex items-center gap-0.5 cursor-pointer shrink-0 pt-0.5"
        >
          <span>{t.fiveDayRisk}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Multi-Farm Switcher (if farmer has multiple plots) */}
      {availableFarms.length > 1 && (
        <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[10px] font-bold text-stone-400 shrink-0 uppercase tracking-tight">
            {isMarathi ? 'शेत निवडा:' : isHindi ? 'खेत चुनें:' : 'Farm Plot:'}
          </span>
          {availableFarms.map((f) => {
            const isSelected = selectedFarm?.id === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFarm(f)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-forest-800 text-white border-forest-900 shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <span>🌱 {f.farm_name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Lightweight Horizontal Metrics Row */}
      {weather && (
        <>
          <div className="grid grid-cols-3 gap-2 my-2.5">
            {/* Humidity */}
            <div className="bg-stone-50 rounded-xl p-2.5 text-center border border-stone-200/50">
              <div className="flex items-center justify-center text-emerald-700 mb-0.5">
                <Droplets className="w-3.5 h-3.5" />
              </div>
              <div className="text-sm font-bold text-stone-900 font-display">
                {weather.humidity}%
              </div>
              <div className="text-[10px] font-medium text-stone-500 truncate">
                {weather.humidity >= 75
                  ? (isMarathi ? 'जास्त आर्द्रता' : isHindi ? 'उच्च आर्द्रता' : 'High Humidity')
                  : (isMarathi ? 'सामान्य' : isHindi ? 'सामान्य' : 'Normal')}
              </div>
            </div>

            {/* Rain Probability */}
            <div className="bg-stone-50 rounded-xl p-2.5 text-center border border-stone-200/50">
              <div className="flex items-center justify-center text-sky-700 mb-0.5">
                <CloudRain className="w-3.5 h-3.5" />
              </div>
              <div className="text-sm font-bold text-stone-900 font-display">
                {weather.rainfallChance}%
              </div>
              <div className="text-[10px] font-medium text-stone-500 truncate">
                {weather.rainfallChance >= 50
                  ? (isMarathi ? 'पावसाची शक्यता' : isHindi ? 'बारिश संभव' : 'Rain Likely')
                  : (isMarathi ? 'कमी पाऊस' : isHindi ? 'कम बारिश' : 'Low Rain')}
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-stone-50 rounded-xl p-2.5 text-center border border-stone-200/50">
              <div className="flex items-center justify-center text-amber-700 mb-0.5">
                <Thermometer className="w-3.5 h-3.5" />
              </div>
              <div className="text-sm font-bold text-stone-900 font-display">
                {weather.temp}°C
              </div>
              <div className="text-[10px] font-medium text-stone-500 truncate">
                {isMarathi ? 'तापमान' : isHindi ? 'तापमान' : 'Temp'}
              </div>
            </div>
          </div>

          {/* Clean Lightweight Advisory Strip */}
          <div className="bg-amber-50/70 border-l-2 border-amber-500 rounded-r-xl px-3 py-2 flex items-start gap-2 text-xs">
            <span className="text-xs shrink-0 mt-0.5">⚠️</span>
            <p className="text-amber-950 font-medium leading-relaxed">
              <strong className="font-bold text-amber-900 mr-1">
                {isMarathi ? 'सल्ला:' : isHindi ? 'सलाह:' : 'Advisory:'}
              </strong>
              {impactSummary}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
