import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';
import type { OutbreakAlert } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import type { OfficerTab } from './OfficerBottomNav';

interface OfficerAlertsProps {
  outbreakAlerts: OutbreakAlert[];
  setActiveTab: (tab: OfficerTab) => void;
  setSearchQuery: (query: string) => void;
  onFilterStatus: (status: string) => void;
}

export const OfficerAlerts: React.FC<OfficerAlertsProps> = ({
  outbreakAlerts,
  setActiveTab,
  setSearchQuery,
  onFilterStatus,
}) => {
  const { language } = useLanguage();

  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  return (
    <div className="space-y-3.5 animate-fadeIn min-w-0">
      {/* Header Info Card */}
      <div className="bg-white/95 p-3.5 rounded-3xl border border-stone-200/90 shadow-glass-sm flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-black text-stone-900 font-display flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{isMarathi ? 'रोग संसर्ग चेतावणी व सतर्कता' : isHindi ? 'रोग प्रकोप चेतावनी एवं अलर्ट' : 'Outbreak Clusters & Directives'}</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium">
              {isMarathi ? '५ किमी त्रिज्या / ७-दिवसीय क्लस्टर ट्रिगर' : isHindi ? '5 किमी त्रिज्या / 7-दिवसीय क्लस्टर ट्रिगर' : 'Rule-based spatial clustering (5km radius / 7-day window)'}
            </p>
          </div>

          <div className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shrink-0">
            {outbreakAlerts.length} {isMarathi ? 'सक्रिय' : isHindi ? 'सक्रिय' : 'Active'}
          </div>
        </div>
      </div>

      {/* Outbreak Directives Feed */}
      <div className="space-y-3">
        {outbreakAlerts.map((outbreak) => (
          <div
            key={outbreak.id}
            className="bg-white/95 p-4 rounded-3xl border-2 border-rose-400/80 shadow-glass-sm space-y-3 relative overflow-hidden min-w-0"
          >
            {/* Outbreak Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.2 rounded border border-rose-300">
                    {(outbreak as any).outbreak_code || 'OUT-MH-NIP'}
                  </span>
                  <span className="text-[9px] font-black uppercase bg-rose-600 text-white px-2 py-0.2 rounded animate-pulse">
                    {outbreak.status || 'ACTIVE'} CLUSTER
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-stone-900 font-display truncate">
                  {outbreak.disease_name}
                </h4>
                <p className="text-[11px] text-stone-600 font-medium mt-0.5 truncate">
                  Species: <strong className="uppercase">{outbreak.species}</strong> • Epicenter: {outbreak.cluster_center?.village || 'Niphad'}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xl sm:text-2xl font-black text-rose-600 font-display">
                  {outbreak.total_case_count}
                </div>
                <div className="text-[9px] text-stone-500 font-medium">
                  {outbreak.mortality_case_count} Deaths • {outbreak.symptom_case_count} Symptoms
                </div>
              </div>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-200 text-xs text-center">
              <div>
                <span className="text-stone-400 block text-[8px] uppercase font-bold">Radius</span>
                <span className="font-black text-stone-900 text-xs">{outbreak.radius_km || 5.0} km</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[8px] uppercase font-bold">Window</span>
                <span className="font-black text-stone-900 text-xs">{outbreak.time_window_days || 7} Days</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[8px] uppercase font-bold">Trigger</span>
                <span className="font-black text-rose-700 text-xs">&ge; 3 Reports</span>
              </div>
            </div>

            {/* Containment Protocol Directive */}
            {outbreak.notes && (
              <div className="p-2.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-bold">Protocol:</strong> {outbreak.notes}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[10px] text-stone-400 font-medium">
                Flagged: {new Date(outbreak.flagged_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery(outbreak.disease_name);
                  onFilterStatus('all');
                  setActiveTab('cases');
                }}
                className="px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-[11px] transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span>Filter Cases</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
