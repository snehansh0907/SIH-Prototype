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

  const farmName = selectedFarm?.farm_name || (isMarathi ? 'शेताचे स्थान' : 'Farm Location');
  const latDisplay = selectedFarm?.latitude ? selectedFarm.latitude.toFixed(2) : '20.16';
  const lngDisplay = selectedFarm?.longitude ? selectedFarm.longitude.toFixed(2) : '74.12';

  // Loading skeleton state
  if (isWeatherLoading && !weather) {
    return (
      <div className="rounded-3xl bg-white/95 border border-stone-200/90 p-4 shadow-soft mb-5 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌦️</span>
            <div>
              <div className="h-4 w-32 bg-stone-200 rounded-md" />
              <div className="h-2.5 w-24 bg-stone-100 rounded-md mt-1" />
            </div>
          </div>
          <div className="h-4 w-20 bg-stone-200 rounded-md" />
        </div>

        {/* 3 cards skeleton */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-stone-100/80 rounded-2xl p-3 text-center flex flex-col items-center">
              <div className="w-5 h-5 bg-stone-200 rounded-full mb-2" />
              <div className="h-4 w-12 bg-stone-300 rounded mb-1" />
              <div className="h-2.5 w-16 bg-stone-200 rounded" />
            </div>
          ))}
        </div>

        {/* Advisory banner skeleton */}
        <div className="bg-stone-100 rounded-2xl p-3 flex items-start gap-2.5">
          <div className="w-5 h-5 bg-stone-200 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-full bg-stone-200 rounded" />
            <div className="h-3 w-3/4 bg-stone-200 rounded" />
          </div>
        </div>

        <div className="mt-2 text-center text-[10px] text-stone-400 font-medium flex items-center justify-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin text-forest-700" />
          <span>
            {isMarathi
              ? 'थेट हवामान माहिती मिळवत आहे (Open-Meteo)...'
              : 'Fetching live farm weather (Open-Meteo)...'}
          </span>
        </div>
      </div>
    );
  }

  // Graceful error state with Retry action (no silent fake numbers)
  if (weatherError && !weather) {
    return (
      <div className="rounded-3xl bg-rose-50/90 border border-rose-200 p-4 shadow-soft mb-5 animate-fadeIn">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black text-rose-950 font-display">
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
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetchWeather()}
                className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
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
    ? (isMarathi ? weather.cropImpactSummaryMr : weather.cropImpactSummary)
    : '';

  return (
    <div className="rounded-3xl bg-white/95 border border-stone-200/90 p-4 shadow-soft mb-5 transition-all">
      {/* Top Header with Live Badge & 5-Day Risk Link */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌦️</span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-stone-900 font-display">
                {t.todaysConditions}
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/80 text-[9px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Live</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-stone-500 font-semibold mt-0.5">
              <MapPin className="w-3 h-3 text-forest-700 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-[240px]">
                {farmName} ({latDisplay}°N, {lngDisplay}°E)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('risk')}
          type="button"
          className="text-xs font-bold text-forest-800 hover:text-forest-900 flex items-center gap-0.5 cursor-pointer"
        >
          <span>{isMarathi ? '५-दिवस अंदाज' : isHindi ? '५-दिन जोखिम' : '5-Day Risk'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Multi-Farm Switcher (if farmer has multiple plots) */}
      {availableFarms.length > 1 && (
        <div className="mb-3 pt-1 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-forest-800 text-white border-forest-900 shadow-sm'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <span>🌱 {f.farm_name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Conditions Row with Live Values */}
      {weather && (
        <>
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
                {weather.humidity >= 75
                  ? (isMarathi ? 'जास्त आर्द्रता' : isHindi ? 'उच्च आर्द्रता' : 'High Humidity')
                  : (isMarathi ? 'सामान्य आर्द्रता' : isHindi ? 'सामान्य आर्द्रता' : 'Normal Humidity')}
              </div>
            </div>

            {/* Rain Probability */}
            <div className="bg-sky-50/70 border border-sky-200/60 rounded-2xl p-2.5 text-center">
              <div className="flex items-center justify-center text-sky-700 mb-1">
                <CloudRain className="w-4 h-4" />
              </div>
              <div className="text-sm font-extrabold text-sky-950 font-display">
                {weather.rainfallChance}%
              </div>
              <div className="text-[10px] font-semibold text-sky-800 uppercase tracking-tight">
                {weather.rainfallChance >= 50
                  ? (isMarathi ? 'पावसाची शक्यता' : isHindi ? 'बारिश की संभावना' : 'Rain Likely')
                  : (isMarathi ? 'कमी पाऊस' : isHindi ? 'कम बारिश' : 'Low Rain Chance')}
              </div>
            </div>

            {/* Temperature */}
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-2.5 text-center">
              <div className="flex items-center justify-center text-amber-700 mb-1">
                <Thermometer className="w-4 h-4" />
              </div>
              <div className="text-sm font-extrabold text-amber-950 font-display">
                {weather.temp}°C
              </div>
              <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-tight">
                {isMarathi ? 'तापमान' : isHindi ? 'तापमान' : 'Temp'}
              </div>
            </div>
          </div>

          {/* Direct Connection to Crop Health (Driven by Live Data) */}
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
        </>
      )}
    </div>
  );
};

