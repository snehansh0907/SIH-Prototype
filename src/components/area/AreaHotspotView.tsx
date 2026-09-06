import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { StatusBadge } from '../common/StatusBadge';
import { hotspotService } from '../../services/hotspotService';
import type { AreaReport } from '../../types';
import { MOCK_AREA_REPORT } from '../../services/mockData';
import { VoiceButton } from '../common/VoiceButton';

export const AreaHotspotView: React.FC = () => {
  const { language, t } = useLanguage();
  const { resetToHome, setActiveTab } = useCrop();
  const [report, setReport] = useState<AreaReport>(MOCK_AREA_REPORT);
  const [selectedClusterId, setSelectedClusterId] = useState<string>('c1');

  useEffect(() => {
    hotspotService.getAreaReport().then(setReport).catch(() => {});
  }, []);

  const voiceText =
    language === 'mr'
      ? `${report.districtMr} परिसरात मध्यम रोग प्रादुर्भाव नोंदवला गेला आहे. ५ किमी परिसरात १४ शेतांमध्ये हा रोग आढळला आहे. कृषी विभागाचा सल्ला ऐका.`
      : language === 'hi'
      ? `${report.districtHi || report.district} क्षेत्र में मध्यम बीमारी गतिविधि दर्ज की गई है। ५ किमी के दायरे में १४ खेतों में यह बीमारी पाई गई है। कृषि विज्ञान केंद्र की सलाह सुनें।`
      : `Moderate disease activity reported across ${report.district}. 14 cases confirmed within 5 kilometers. Follow KVK advisory.`;

  return (
    <div className="pb-6 animate-fadeIn">
      {/* Top Bar */}
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
          textToSpeak={voiceText}
          variant="pill"
        />
      </div>

      {/* Primary Question: What is happening around me? */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <h2 className="text-xl font-black text-stone-900 font-display">
            {t.whatIsHappeningAroundMe}
          </h2>
        </div>
        <p className="text-xs text-stone-600 mt-0.5 font-medium">
          {language === 'mr' ? report.subDistrictMr : report.subDistrict} • {report.district}
        </p>
      </div>

      {/* Main Status Hero Card */}
      <div className="rounded-3xl bg-amber-50/80 border-2 border-amber-300 p-5 shadow-card mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
            <h3 className="text-lg font-black text-amber-950 font-display">
              {t.areaStatusTitle}
            </h3>
          </div>
          <StatusBadge level={report.status} type="risk" size="sm" />
        </div>

        {/* 3 Core Points Required by User Prompt */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2.5 text-xs font-bold text-stone-800">
            <span className="text-base">🦠</span>
            <span>{t.reportsIncreasing}</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-bold text-stone-800">
            <span className="text-base">📍</span>
            <span>{t.multipleCasesNearby}</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-medium text-stone-600">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
            <span>{t.updatedRecently}</span>
          </div>
        </div>
      </div>

      {/* Simplified Privacy-Preserving Cluster Map */}
      <div className="rounded-3xl bg-white border border-stone-200/90 p-4 shadow-soft mb-5 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-forest-700" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 font-display">
              {t.areaMapTitle}
            </h4>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            {language === 'mr' ? '५ किमी परिसर' : '5 km Radius'}
          </span>
        </div>

        {/* Interactive Simulated Radar / Spatial Clusters (Privacy safe, no raw farmer names) */}
        <div className="relative w-full h-52 bg-gradient-to-br from-emerald-900 via-forest-900 to-stone-900 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-forest-800">
          {/* Concentric radar rings */}
          <div className="absolute w-44 h-44 rounded-full border border-white/10 pointer-events-none"></div>
          <div className="absolute w-28 h-28 rounded-full border border-white/15 pointer-events-none"></div>
          <div className="absolute w-14 h-14 rounded-full border border-white/20 pointer-events-none"></div>

          {/* Center Point: Farmer Farm Location */}
          <div className="relative z-20 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-lg animate-pulse"></div>
            <span className="text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md mt-1 backdrop-blur-sm">
              {language === 'mr' ? 'आपले शेत' : 'Your Farm'}
            </span>
          </div>

          {/* Cluster Points */}
          {report.clusters.map((c, i) => {
            const isSelected = selectedClusterId === c.id;
            const positions = [
              { top: '22%', left: '68%' },
              { top: '65%', left: '72%' },
              { top: '68%', left: '26%' },
            ];
            const pos = positions[i] || { top: '50%', left: '50%' };

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClusterId(c.id)}
                style={{ top: pos.top, left: pos.left }}
                className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 transition-all p-1 group`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-[10px] shadow-lg border-2 ${
                  c.intensity === 'high'
                    ? 'bg-rose-600/90 border-rose-300 ring-4 ring-rose-500/30'
                    : c.intensity === 'moderate'
                    ? 'bg-amber-500/90 border-amber-200 ring-4 ring-amber-500/30'
                    : 'bg-emerald-600/90 border-emerald-300'
                } ${isSelected ? 'scale-125 ring-8 ring-white/40' : ''}`}>
                  {c.reportedCases}
                </div>
              </button>
            );
          })}

          {/* Privacy Disclaimer Tag */}
          <div className="absolute bottom-2 inset-x-2 text-center text-[10px] text-white/70 bg-black/40 py-1 px-2 rounded-lg backdrop-blur-sm">
            🛡️ {t.areaMapNotice}
          </div>
        </div>

        {/* Selected Cluster Info */}
        {selectedClusterId && (
          <div className="mt-3 bg-stone-50 rounded-2xl p-3 border border-stone-200 text-xs">
            {(() => {
              const active = report.clusters.find(c => c.id === selectedClusterId) || report.clusters[0];
              const name = language === 'mr' ? active.areaNameMr : active.areaName;
              return (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-stone-900">
                      📍 {name}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {active.crop} • {active.reportedCases} {language === 'mr' ? 'नोंदवलेली प्रकरणे' : 'reported cases'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-forest-800 bg-forest-100 px-2 py-1 rounded-lg">
                      ~{active.distanceKm} km away
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Official KVK Advisory Broadcast */}
      <div className="rounded-3xl bg-forest-900 text-white p-5 shadow-elevated mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🏛️</span>
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 font-display">
            {t.officialAdvisoryTitle}
          </h4>
        </div>
        <p className="text-xs font-medium text-wheat-100/90 leading-relaxed mb-4">
          "{language === 'mr' ? report.communityAdvisoryMr : report.communityAdvisory}"
        </p>

        <button
          onClick={() => setActiveTab('expert')}
          type="button"
          className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-forest-950 font-extrabold text-xs active:scale-95 transition-all text-center shadow-sm"
        >
          {t.actionExpert}
        </button>
      </div>
    </div>
  );
};
