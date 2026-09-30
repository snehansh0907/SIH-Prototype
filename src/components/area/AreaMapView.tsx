import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  RefreshCw,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import type { VeterinaryCaseRecord, OutbreakAlert } from '../../types';
import { apiClient } from '../../services/apiClient';

interface AreaMapViewProps {
  cases?: VeterinaryCaseRecord[];
  outbreaks?: OutbreakAlert[];
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  height?: string;
  onSelectCase?: (caseItem: VeterinaryCaseRecord) => void;
  isVetView?: boolean;
}

// Helper to center and adjust zoom programmatically
const ChangeMapView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Create custom colored Leaflet pin icons using HTML / SVG
const createCustomMarkerIcon = (
  status: string,
  reportType?: string,
  isOutbreak?: boolean
) => {
  let bgColor = '#2563eb'; // blue for New
  let emoji = '🐄';

  if (reportType === 'mortality') {
    bgColor = '#e11d48'; // crimson
    emoji = '🪦';
  } else if (isOutbreak || status === 'Escalated') {
    bgColor = '#dc2626'; // red
    emoji = '⚠️';
  } else if (status === 'Under Review') {
    bgColor = '#d97706'; // amber
    emoji = '🔍';
  } else if (status === 'Sample Collected') {
    bgColor = '#7c3aed'; // purple
    emoji = '🧪';
  } else if (status === 'Resolved') {
    bgColor = '#059669'; // emerald
    emoji = '✅';
  }

  const pulseHtml = isOutbreak || reportType === 'mortality'
    ? `<span style="position: absolute; top: -4px; left: -4px; width: 36px; height: 36px; border-radius: 50%; background-color: ${bgColor}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
    : '';

  const html = `
    <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
      ${pulseHtml}
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: ${bgColor};
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        position: relative;
        z-index: 2;
      ">
        ${emoji}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-pin',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

export const AreaMapView: React.FC<AreaMapViewProps> = ({
  cases: propCases,
  outbreaks: propOutbreaks,
  centerLat = 20.0825,
  centerLng = 74.1112,
  zoom = 12,
  height = '500px',
  onSelectCase,
  isVetView = false,
}) => {
  const [cases, setCases] = useState<VeterinaryCaseRecord[]>(propCases || []);
  const [outbreaks, setOutbreaks] = useState<OutbreakAlert[]>(propOutbreaks || []);
  const [isLoading, setIsLoading] = useState(!propCases);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');

  // Sync if props update
  useEffect(() => {
    if (propCases) setCases(propCases);
    if (propOutbreaks) setOutbreaks(propOutbreaks);
  }, [propCases, propOutbreaks]);

  // Fetch from backend if not passed
  const fetchMapData = async () => {
    setIsLoading(true);
    try {
      const [casesRes, outbreaksRes] = await Promise.all([
        apiClient<{ success: boolean; data: VeterinaryCaseRecord[]; count: number }>('/diagnosis/cases', {
          method: 'GET',
          timeout: 8000,
        }),
        apiClient<{ success: boolean; data: OutbreakAlert[]; count: number }>('/outbreaks', {
          method: 'GET',
          timeout: 8000,
        }),
      ]);

      if (casesRes.success && Array.isArray(casesRes.data)) {
        setCases(casesRes.data);
      }
      if (outbreaksRes.success && Array.isArray(outbreaksRes.data)) {
        setOutbreaks(outbreaksRes.data);
      }
    } catch (err) {
      console.warn('[AreaMapView] Fallback on local data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!propCases) {
      fetchMapData();
    }
  }, []);

  // Filter plotted points
  const visibleCases = cases.filter((c) => {
    const statusMatch =
      filterStatus === 'all'
        ? true
        : filterStatus === 'mortality'
        ? c.report_type === 'mortality'
        : (c.status || 'New').toLowerCase() === filterStatus.toLowerCase();

    const speciesMatch =
      selectedSpecies === 'all' ? true : (c.species || '').toLowerCase() === selectedSpecies.toLowerCase();

    return statusMatch && speciesMatch;
  });

  return (
    <div className="space-y-3">
      {/* Map Filter Controls & Legend Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Markers', color: 'bg-stone-800 text-white' },
            { id: 'new', label: '🔵 New', color: 'bg-blue-100 text-blue-800' },
            { id: 'under review', label: '🟡 Review', color: 'bg-amber-100 text-amber-800' },
            { id: 'sample collected', label: '🟣 Sample Taken', color: 'bg-purple-100 text-purple-800' },
            { id: 'escalated', label: '🔴 Escalated', color: 'bg-rose-100 text-rose-800' },
            { id: 'resolved', label: '🟢 Resolved', color: 'bg-emerald-100 text-emerald-800' },
            { id: 'mortality', label: '🪦 Mortality', color: 'bg-slate-800 text-amber-300' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilterStatus(pill.id)}
              className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === pill.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Species Selector & Refresh */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Species</option>
            <option value="cattle">Cattle</option>
            <option value="buffalo">Buffalo</option>
            <option value="goat">Goat</option>
            <option value="sheep">Sheep</option>
            <option value="poultry">Poultry</option>
          </select>

          <button
            type="button"
            onClick={fetchMapData}
            disabled={isLoading}
            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all active:scale-95 cursor-pointer"
            title="Refresh Map Pins"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Geospatial Map Canvas Shell */}
      <div
        className="w-full rounded-3xl overflow-hidden border-2 border-stone-300/80 shadow-inner relative z-10"
        style={{ height }}
      >
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#e2e8f0' }}
        >
          <ChangeMapView center={[centerLat, centerLng]} zoom={zoom} />

          {/* Clean Standard Cartographic Base Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render 5km Ring Circles for Suspected Outbreaks */}
          {outbreaks.map((outbreak) => {
            const lat = outbreak.cluster_center?.latitude || centerLat;
            const lng = outbreak.cluster_center?.longitude || centerLng;
            const radiusMeters = (outbreak.radius_km || 5.0) * 1000;

            return (
              <Circle
                key={outbreak.id}
                center={[lat, lng]}
                radius={radiusMeters}
                pathOptions={{
                  color: '#dc2626',
                  fillColor: '#ef4444',
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '6, 6',
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 font-sans text-xs">
                    <div className="font-black text-rose-700 uppercase flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{outbreak.disease_name} Outbreak Zone</span>
                    </div>
                    <div className="text-[11px] font-semibold mt-1">
                      {outbreak.radius_km || 5.0}km Containment Ring • {outbreak.total_case_count} Clustered Cases
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      {outbreak.notes || (outbreak as any).containment_advisory || 'Ring vaccination mandated within perimeter.'}
                    </div>
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* Plot Individual Case & Mortality Markers */}
          {visibleCases.map((caseItem, idx) => {
            // Assign coordinate with small jitter if exact duplicates to prevent complete overlap
            const baseLat = typeof caseItem.latitude === 'number' ? caseItem.latitude : centerLat;
            const baseLng = typeof caseItem.longitude === 'number' ? caseItem.longitude : centerLng;
            const jitterLat = baseLat + ((idx % 7) - 3) * 0.0012;
            const jitterLng = baseLng + (((idx * 3) % 7) - 3) * 0.0012;

            const isMort = caseItem.report_type === 'mortality';
            const icon = createCustomMarkerIcon(
              caseItem.status || 'New',
              caseItem.report_type,
              caseItem.is_outbreak_flagged
            );

            return (
              <Marker
                key={caseItem.id || caseItem.case_id || idx}
                position={[jitterLat, jitterLng]}
                icon={icon}
                eventHandlers={
                  isVetView && onSelectCase
                    ? {
                        click: () => {
                          onSelectCase(caseItem);
                        },
                      }
                    : undefined
                }
              >
                <Popup>
                  <div className="p-1.5 text-slate-900 font-sans max-w-[220px]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          isMort
                            ? 'bg-rose-100 text-rose-900'
                            : caseItem.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isMort ? 'Mortality' : caseItem.status || 'New'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{(caseItem.id || caseItem.case_id || '').slice(0, 6)}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                      {caseItem.disease_name || caseItem.suspected_cause || 'Health Issue'}
                    </h4>

                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                      <span>Species: <strong className="uppercase">{caseItem.species || 'Cattle'}</strong></span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{caseItem.village || 'Niphad'}, {caseItem.taluka || 'Niphad'}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-200 pt-1">
                      {new Date(caseItem.created_at || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>

                    {onSelectCase && (
                      <button
                        type="button"
                        onClick={() => onSelectCase(caseItem)}
                        className="w-full mt-2 py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Open Case Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-stone-300 shadow-md text-[10px] font-bold space-y-1 text-slate-800">
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-black mb-1">
            Status Pin Legend
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>🔴 Outbreak / Escalated / Death</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>🟡 Under Review / Investigating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            <span>🟣 Sample Collected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>🟢 Resolved / Contained</span>
          </div>
        </div>
      </div>
    </div>
  );
};
