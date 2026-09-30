import React from 'react';
import type { VeterinaryCaseRecord, OutbreakAlert } from '../../types';
import { AreaMapView } from '../area/AreaMapView';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, MapPin } from 'lucide-react';

interface OfficerSurveillanceMapProps {
  cases: VeterinaryCaseRecord[];
  outbreakAlerts: OutbreakAlert[];
  onSelectCase: (c: VeterinaryCaseRecord) => void;
}

export const OfficerSurveillanceMap: React.FC<OfficerSurveillanceMapProps> = ({
  cases,
  outbreakAlerts,
  onSelectCase,
}) => {
  const { language } = useLanguage();

  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  return (
    <div className="space-y-3.5 animate-fadeIn min-w-0">
      {/* Header Info Card */}
      <div className="bg-white/95 p-3.5 rounded-3xl border border-stone-200/90 shadow-glass-sm flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-stone-900 font-display">
                {isMarathi ? 'रोग पाळत व संसर्ग नकाशा' : isHindi ? 'रोग निगरानी एवं प्रसार नक्शा' : 'Geospatial Disease Surveillance'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium">
                {isMarathi ? '५ किमी संसर्ग रिंग • निफाड तालुका' : isHindi ? '5 किमी नियंत्रण रिंग • निफाड तालुका' : '5km / 10km Outbreak Rings • Niphad Taluka'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live OSM</span>
          </div>
        </div>
      </div>

      {/* Map Card */}
      <div className="bg-white/95 p-3 rounded-3xl border border-stone-200 shadow-glass-sm min-w-0 overflow-hidden">
        <AreaMapView
          cases={cases}
          outbreaks={outbreakAlerts}
          centerLat={20.0825}
          centerLng={74.1112}
          height="330px"
          onSelectCase={onSelectCase}
          isVetView={true}
        />
      </div>

      {/* Outbreak Zones Summary Below Map */}
      <div className="bg-white/95 p-3.5 rounded-3xl border border-stone-200/90 shadow-glass-sm space-y-2.5 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-stone-900 font-display flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{isMarathi ? 'सक्रिय संसर्ग झोन' : isHindi ? 'सक्रिय प्रकोप क्षेत्र' : 'Active Outbreak Containment Zones'}</span>
          </h3>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            {outbreakAlerts.length} {isMarathi ? 'सक्रिय' : isHindi ? 'सक्रिय' : 'Active'}
          </span>
        </div>

        <div className="space-y-2">
          {outbreakAlerts.map((o) => (
            <div
              key={o.id}
              className="p-2.5 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs flex flex-col gap-1 min-w-0"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-950 truncate max-w-[200px]">
                  {o.disease_name}
                </span>
                <span className="text-[9px] font-mono font-bold bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded">
                  {o.radius_km || 5.0}km Ring
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-600">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">
                  {o.cluster_center?.village || 'Niphad'}, {o.cluster_center?.taluka || 'Niphad'}
                </span>
                <span className="text-stone-300">•</span>
                <span className="font-bold text-rose-800">{o.total_case_count} cases</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
