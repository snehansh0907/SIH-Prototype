import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Clock, Layers, MapPin, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import type { SeverityLevel } from '../../types';
import { VoiceButton } from '../common/VoiceButton';
import {
  getNearbyRegionsForLocation,
  generateRegionalHotspotDataset,
  type NearbyRegion,
} from '../../services/locationRegionService';

interface HeatZone {
  id: string;
  x: number; // 0 - 100 percentage across radar width
  y: number; // 0 - 100 percentage across radar height
  radius: number; // blur radius in px
  intensity: SeverityLevel;
  areaName: string;
  areaNameHi?: string;
  areaNameMr: string;
  crop: string;
  reportedCases: number;
  distanceKm: number;
}

interface LocationHeatDataset {
  id: string;
  name: string;
  nameHi?: string;
  nameMr: string;
  taluka: string;
  district: string;
  districtHi?: string;
  districtMr: string;
  status: SeverityLevel;
  activeCasesCount: number;
  diseaseTrend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: string;
  advisory: string;
  advisoryHi?: string;
  advisoryMr: string;
  heatZones: HeatZone[];
}

const MAHARASHTRA_DEMO_LOCATIONS: Record<string, LocationHeatDataset> = {
  niphad: {
    id: 'niphad',
    name: 'Niphad',
    nameHi: 'निफाड़',
    nameMr: 'निफाड',
    taluka: 'Niphad',
    district: 'Nashik',
    districtHi: 'नासिक',
    districtMr: 'नाशिक',
    status: 'high',
    activeCasesCount: 16,
    diseaseTrend: 'increasing',
    lastUpdated: '15 mins ago',
    advisory: 'Early Blight outbreak alert for tomato & grape growers across Niphad. Maintain 4-foot ridge drainage channels and spray copper oxychloride preventive.',
    advisoryHi: 'निफाड़ में टमाटर और अंगूर उत्पादकों के लिए अगेती झुलसा का अलर्ट। 4-फुट रिज जल निकासी नालियां बनाए रखें और सुरक्षात्मक कॉपर ऑक्सीक्लोराइड का छिड़काव करें।',
    advisoryMr: 'निफाड द्राक्ष व टोमॅटो पट्ट्यात करपा रोगाचा वाढता प्रादुर्भाव. पाण्याचा निचरा सुरळीत ठेवा व तांबयुक्त बुरशीनाशकाची फवारणी करा.',
    heatZones: [
      {
        id: 'c1',
        x: 68,
        y: 28,
        radius: 95,
        intensity: 'high',
        areaName: 'Niphad East Cluster',
        areaNameHi: 'निफाड़ पूर्वी क्लस्टर',
        areaNameMr: 'निफाड पूर्व विभाग',
        crop: 'Tomato & Grape',
        reportedCases: 8,
        distanceKm: 1.4,
      },
      {
        id: 'c2',
        x: 26,
        y: 62,
        radius: 80,
        intensity: 'moderate',
        areaName: 'Pimpalgaon Ridge Sector',
        areaNameHi: 'पिंपलगांव रिज सेक्टर',
        areaNameMr: 'पिंपळगाव परिसर',
        crop: 'Tomato',
        reportedCases: 5,
        distanceKm: 3.2,
      },
      {
        id: 'c3',
        x: 74,
        y: 74,
        radius: 65,
        intensity: 'low',
        areaName: 'Chandori River Belt',
        areaNameHi: 'चांदोरी नदी बेल्ट',
        areaNameMr: 'चांदोरी पट्टा',
        crop: 'Cotton & Onion',
        reportedCases: 3,
        distanceKm: 4.5,
      },
    ],
  },
  dindori: {
    id: 'dindori',
    name: 'Dindori',
    nameHi: 'दिंडोरी',
    nameMr: 'दिंडोरी',
    taluka: 'Dindori',
    district: 'Nashik',
    districtHi: 'नासिक',
    districtMr: 'नाशिक',
    status: 'high',
    activeCasesCount: 22,
    diseaseTrend: 'increasing',
    lastUpdated: '30 mins ago',
    advisory: 'Downy Mildew and fungal spot alert in Dindori hill belt due to high canopy humidity. Inspect lower leaf canopy daily.',
    advisoryHi: 'उच्च आर्द्रता के कारण दिंडोरी पहाड़ी क्षेत्र में डाउनी मिल्ड्यू और फंगल धब्बों का अलर्ट। निचली पत्तियों की रोजाना जांच करें।',
    advisoryMr: 'दिंडोरी डोंगर भागात केवडा रोगाचा गंभीर इशारा. झाडांच्या खालच्या पानांवर दमटपणा व डाग तपासा.',
    heatZones: [
      {
        id: 'c1',
        x: 36,
        y: 24,
        radius: 105,
        intensity: 'high',
        areaName: 'Dindori North Valley',
        areaNameHi: 'दिंडोरी उत्तरी घाटी',
        areaNameMr: 'दिंडोरी उत्तर खोरे',
        crop: 'Grape & Tomato',
        reportedCases: 12,
        distanceKm: 1.8,
      },
      {
        id: 'c2',
        x: 72,
        y: 48,
        radius: 85,
        intensity: 'high',
        areaName: 'Vani Road Belt',
        areaNameHi: 'वणी रोड क्षेत्र',
        areaNameMr: 'वणी रोड पट्टा',
        crop: 'Tomato',
        reportedCases: 7,
        distanceKm: 2.9,
      },
      {
        id: 'c3',
        x: 30,
        y: 75,
        radius: 65,
        intensity: 'moderate',
        areaName: 'Parna Sector',
        areaNameHi: 'परना सेक्टर',
        areaNameMr: 'परना क्षेत्र',
        crop: 'Soybean',
        reportedCases: 3,
        distanceKm: 4.1,
      },
    ],
  },
  chandori: {
    id: 'chandori',
    name: 'Chandori',
    nameHi: 'चांदोरी',
    nameMr: 'चांदोरी',
    taluka: 'Niphad',
    district: 'Nashik',
    districtHi: 'नासिक',
    districtMr: 'नाशिक',
    status: 'moderate',
    activeCasesCount: 9,
    diseaseTrend: 'stable',
    lastUpdated: '1 hour ago',
    advisory: 'Moderate fungal risk near Godavari riverbank farms. Farmers are advised to clear field weeds and inspect tomato foliage.',
    advisoryHi: 'गोदावरी नदी तट के खेतों में मध्यम फंगल जोखिम। किसानों को खरपतवार हटाने और टमाटर के पत्तों की जांच करने की सलाह दी जाती है।',
    advisoryMr: 'गोदावरी काठच्या शेतात मध्यम बुरशीजन्य धोका. शेतातील तण काढा व पानावरील डाग तपासा.',
    heatZones: [
      {
        id: 'c1',
        x: 58,
        y: 68,
        radius: 85,
        intensity: 'moderate',
        areaName: 'Godavari Basin Cluster',
        areaNameHi: 'गोदावरी बेसिन क्लस्टर',
        areaNameMr: 'गोदावरी खोरे',
        crop: 'Sugarcane & Tomato',
        reportedCases: 5,
        distanceKm: 2.1,
      },
      {
        id: 'c2',
        x: 34,
        y: 36,
        radius: 70,
        intensity: 'moderate',
        areaName: 'Saykheda Sector',
        areaNameHi: 'सायखेड़ा सेक्टर',
        areaNameMr: 'सायखेडा भाग',
        crop: 'Wheat',
        reportedCases: 3,
        distanceKm: 3.5,
      },
      {
        id: 'c3',
        x: 78,
        y: 28,
        radius: 60,
        intensity: 'low',
        areaName: 'Khedle Par',
        areaNameHi: 'खेडले पार',
        areaNameMr: 'खेडले पार',
        crop: 'Onion',
        reportedCases: 1,
        distanceKm: 4.8,
      },
    ],
  },
  pimpalgaon: {
    id: 'pimpalgaon',
    name: 'Pimpalgaon',
    nameHi: 'पिंपलगांव',
    nameMr: 'पिंपळगाव',
    taluka: 'Niphad',
    district: 'Nashik',
    districtHi: 'नासिक',
    districtMr: 'नाशिक',
    status: 'high',
    activeCasesCount: 15,
    diseaseTrend: 'increasing',
    lastUpdated: '45 mins ago',
    advisory: 'Thrips and early blight cluster identified near Pimpalgaon Market Yard. Improve field canopy ventilation.',
    advisoryHi: 'पिंपलगांव मार्केट यार्ड के पास थ्रिप्स और अगेती झुलसा का समूह पाया गया। खेत में हवा का आवागमन सुधारें।',
    advisoryMr: 'पिंपळगाव बाजार समिती परिसरात थ्रिप्स व करपा रोगाचे क्लस्टर. पिकात हवेचे वहन सुधारा.',
    heatZones: [
      {
        id: 'c1',
        x: 52,
        y: 28,
        radius: 95,
        intensity: 'high',
        areaName: 'Market Yard Outskirts',
        areaNameHi: 'मार्केट यार्ड बाहरी क्षेत्र',
        areaNameMr: 'बाजार समिती परिसर',
        crop: 'Tomato',
        reportedCases: 8,
        distanceKm: 1.2,
      },
      {
        id: 'c2',
        x: 76,
        y: 58,
        radius: 75,
        intensity: 'moderate',
        areaName: 'Shirwade Sector',
        areaNameHi: 'शिरवाड़े सेक्टर',
        areaNameMr: 'शिरवडे भाग',
        crop: 'Onion',
        reportedCases: 4,
        distanceKm: 3.4,
      },
      {
        id: 'c3',
        x: 24,
        y: 68,
        radius: 60,
        intensity: 'low',
        areaName: 'Umrane Road',
        areaNameHi: 'उमराणे रोड',
        areaNameMr: 'उमराणे रस्ता',
        crop: 'Maize',
        reportedCases: 3,
        distanceKm: 4.3,
      },
    ],
  },
  satara: {
    id: 'satara',
    name: 'Baramati / Satara',
    nameHi: 'बारामती / सातारा',
    nameMr: 'बारामती / सातारा',
    taluka: 'Baramati',
    district: 'Pune / Satara',
    districtHi: 'पुणे / सातारा',
    districtMr: 'पुणे / सातारा',
    status: 'low',
    activeCasesCount: 5,
    diseaseTrend: 'decreasing',
    lastUpdated: '2 hours ago',
    advisory: 'Low crop disease risk across sugarcane and maize belt. Routine preventive management recommended.',
    advisoryHi: 'गन्ना और मक्का क्षेत्र में फसल रोग का जोखिम कम है। सामान्य सुरक्षात्मक उपाय जारी रखें।',
    advisoryMr: 'ऊस व मका पट्ट्यात रोगाचा धोका कमी. नियमित पीक सुरक्षा सुरू ठेवा.',
    heatZones: [
      {
        id: 'c1',
        x: 68,
        y: 35,
        radius: 70,
        intensity: 'moderate',
        areaName: 'Sugarcane Canal Belt',
        areaNameHi: 'गन्ना नहर बेल्ट',
        areaNameMr: 'ऊस कालवा पट्टा',
        crop: 'Sugarcane',
        reportedCases: 3,
        distanceKm: 2.6,
      },
      {
        id: 'c2',
        x: 30,
        y: 62,
        radius: 60,
        intensity: 'low',
        areaName: 'Neera Valley',
        areaNameHi: 'नीरा घाटी',
        areaNameMr: 'नीरा खोरे',
        crop: 'Maize',
        reportedCases: 2,
        distanceKm: 4.1,
      },
    ],
  },
};

export const AreaHotspotView: React.FC = () => {
  const { language, t } = useLanguage();
  const { resetToHome, setActiveTab, selectedFarm } = useCrop();
  const { user } = useAuth();

  const isDemoSession = user?.userType === 'demo' || Boolean(user?.isDemo);

  // Dynamically resolve genuine nearby regions based on authenticated user's farm profile
  const nearbyRegions = useMemo<NearbyRegion[]>(() => {
    // If demo session in Nashik / Niphad, offer demo regions
    if (isDemoSession && (!user?.district || user.district.toLowerCase() === 'nashik')) {
      return [
        { id: 'niphad', name: 'Niphad', nameHi: 'निफाड़', nameMr: 'निफाड', taluka: 'Niphad', district: 'Nashik', districtHi: 'नासिक', districtMr: 'नाशिक', state: 'Maharashtra', isHomeLocation: true },
        { id: 'dindori', name: 'Dindori', nameHi: 'दिंडोरी', nameMr: 'दिंडोरी', taluka: 'Dindori', district: 'Nashik', districtHi: 'नासिक', districtMr: 'नाशिक', state: 'Maharashtra' },
        { id: 'chandori', name: 'Chandori', nameHi: 'चांदोरी', nameMr: 'चांदोरी', taluka: 'Niphad', district: 'Nashik', districtHi: 'नासिक', districtMr: 'नाशिक', state: 'Maharashtra' },
        { id: 'pimpalgaon', name: 'Pimpalgaon', nameHi: 'पिंपलगांव', nameMr: 'पिंपळगाव', taluka: 'Niphad', district: 'Nashik', districtHi: 'नासिक', districtMr: 'नाशिक', state: 'Maharashtra' },
        { id: 'satara', name: 'Satara', nameHi: 'सातारा', nameMr: 'सातारा', taluka: 'Satara', district: 'Satara', districtHi: 'सातारा', districtMr: 'सातारा', state: 'Maharashtra' },
      ];
    }

    return getNearbyRegionsForLocation(user, selectedFarm);
  }, [
    user?.id,
    user?.farmerId,
    user?.userType,
    user?.isDemo,
    user?.village,
    user?.taluka,
    user?.district,
    user?.state,
    user?.latitude,
    user?.longitude,
    user?.monitoredCrop,
    selectedFarm?.id,
    selectedFarm?.village,
    selectedFarm?.taluka,
    selectedFarm?.district,
    selectedFarm?.latitude,
    selectedFarm?.longitude,
  ]);

  // Map of datasets for all available regions
  const datasetsMap = useMemo<Record<string, LocationHeatDataset>>(() => {
    const map: Record<string, LocationHeatDataset> = {};

    for (const region of nearbyRegions) {
      if (isDemoSession && MAHARASHTRA_DEMO_LOCATIONS[region.id]) {
        map[region.id] = MAHARASHTRA_DEMO_LOCATIONS[region.id];
      } else {
        const crop = user?.monitoredCrop || 'Tomato';
        map[region.id] = generateRegionalHotspotDataset(region, crop);
      }
    }

    return map;
  }, [nearbyRegions, isDemoSession, user?.monitoredCrop]);

  const defaultLocId = nearbyRegions[0]?.id || 'niphad';
  const [selectedLocId, setSelectedLocId] = useState<string>(defaultLocId);

  // Immediately refresh location data when user account or selected farm changes (zero stale cache)
  useEffect(() => {
    if (nearbyRegions.length > 0) {
      setSelectedLocId(nearbyRegions[0].id);
    }
  }, [user?.id, user?.farmerId, selectedFarm?.id, nearbyRegions]);

  const activeDataset =
    datasetsMap[selectedLocId] || datasetsMap[defaultLocId] || Object.values(datasetsMap)[0] || MAHARASHTRA_DEMO_LOCATIONS.niphad;

  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    activeDataset.heatZones[0]?.id || 'c1'
  );

  // Update selected zone when location changes
  useEffect(() => {
    if (activeDataset.heatZones.length > 0) {
      setSelectedZoneId(activeDataset.heatZones[0].id);
    }
  }, [selectedLocId, activeDataset]);

  const activeZone =
    activeDataset.heatZones.find((z) => z.id === selectedZoneId) || activeDataset.heatZones[0];

  const voiceText =
    language === 'mr'
      ? `${activeDataset.nameMr} (${activeDataset.districtMr}) परिसरात ${
          activeDataset.status === 'high'
            ? 'गंभीर'
            : activeDataset.status === 'moderate'
            ? 'मध्यम'
            : 'कम'
        } रोग प्रादुर्भाव नोंदवला गेला आहे. ५ किमी परिसरात ${activeDataset.activeCasesCount} शेतांमध्ये हा रोग आढळला आहे. ${activeDataset.advisoryMr}`
      : language === 'hi'
      ? `${activeDataset.nameHi || activeDataset.name} (${activeDataset.districtHi || activeDataset.district}) क्षेत्र में ${
          activeDataset.status === 'high'
            ? 'गंभीर'
            : activeDataset.status === 'moderate'
            ? 'मध्यम'
            : 'कम'
        } रोग प्रकोप दर्ज किया गया है। 5 किमी के दायरे में ${activeDataset.activeCasesCount} खेतों में यह रोग पाया गया है। ${activeDataset.advisoryHi || activeDataset.advisory}`
      : `${
          activeDataset.status === 'high' ? 'High' : activeDataset.status === 'moderate' ? 'Moderate' : 'Low'
        } disease activity reported across ${activeDataset.name}, ${activeDataset.district}. ${
          activeDataset.activeCasesCount
        } cases confirmed within 5 kilometers. ${activeDataset.advisory}`;

  return (
    <div className="pb-6 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.navHome}</span>
        </button>

        <VoiceButton textToSpeak={voiceText} variant="pill" />
      </div>

      {/* Primary Question & Location Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <div>
              <h2 className="text-xl font-black text-stone-900 font-display">
                {t.whatIsHappeningAroundMe}
              </h2>
              <p className="text-xs text-stone-600 font-semibold mt-0.5">
                {language === 'mr' ? activeDataset.nameMr : language === 'hi' ? (activeDataset.nameHi || activeDataset.name) : activeDataset.name} • {language === 'mr' ? activeDataset.districtMr : language === 'hi' ? (activeDataset.districtHi || activeDataset.district) : activeDataset.district}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Location-Aware Nearby Region Selector Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-stone-400 shrink-0 font-display mr-1">
            {t.selectRegion}
          </span>
          {nearbyRegions.map((loc) => {
            const isCurrent = selectedLocId === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocId(loc.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-forest-800 text-white shadow-md scale-[1.02] border border-forest-900'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                }`}
              >
                <span>📍 {language === 'mr' ? loc.nameMr : language === 'hi' ? (loc.nameHi || loc.name) : loc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Status Hero Card */}
      <div
        className={`rounded-3xl border-2 p-5 shadow-card mb-5 transition-all ${
          activeDataset.status === 'high'
            ? 'bg-rose-50/80 border-rose-300'
            : activeDataset.status === 'moderate'
            ? 'bg-amber-50/80 border-amber-300'
            : 'bg-emerald-50/80 border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full animate-ping ${
                activeDataset.status === 'high'
                  ? 'bg-rose-500'
                  : activeDataset.status === 'moderate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            ></span>
            <h3 className="text-lg font-black text-stone-900 font-display">
              {activeDataset.status === 'high'
                ? t.highDiseaseActivity
                : activeDataset.status === 'moderate'
                ? t.areaStatusTitle
                : t.lowDiseaseActivity}
            </h3>
          </div>
          <StatusBadge level={activeDataset.status} type="risk" size="sm" />
        </div>

        {/* 3 Core Status Metrics */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-2.5 text-xs font-bold text-stone-800">
            <span className="text-base">🦠</span>
            <span>
              {language === 'mr'
                ? `या भागात ${activeDataset.activeCasesCount} शेतांमध्ये प्रादुर्भाव आढळला आहे`
                : language === 'hi'
                ? `इस क्षेत्र में ${activeDataset.activeCasesCount} खेतों में प्रकोप की पुष्टि हुई है (5 किमी दायरा)`
                : `${activeDataset.activeCasesCount} active disease reports confirmed within 5 km`}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-bold text-stone-800">
            <span className="text-base">📈</span>
            <span>
              {language === 'mr'
                ? `रोगाचा प्रसार: ${
                    activeDataset.diseaseTrend === 'increasing'
                      ? 'वाढता'
                      : activeDataset.diseaseTrend === 'stable'
                      ? 'स्थिर'
                      : 'कमी होत आहे'
                  }`
                : language === 'hi'
                ? `रोग का प्रसार: ${
                    activeDataset.diseaseTrend === 'increasing'
                      ? 'बढ़ रहा है'
                      : activeDataset.diseaseTrend === 'stable'
                      ? 'स्थिर'
                      : 'कम हो रहा है'
                  }`
                : `Disease Trend: ${
                    activeDataset.diseaseTrend === 'increasing'
                      ? 'Increasing'
                      : activeDataset.diseaseTrend === 'stable'
                      ? 'Stable'
                      : 'Decreasing'
                  }`}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-medium text-stone-600">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
            <span>
              {t.updated}: {activeDataset.lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* ANONYMOUS COMMUNITY CLUSTER RADAR - Heatmap Visualization */}
      <div className="rounded-3xl bg-white border border-stone-200/90 p-4 shadow-soft mb-5 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-forest-700" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 font-display">
              {t.areaMapTitle}
            </h4>
          </div>
          <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            {t.radius5km}
          </span>
        </div>

        {/* Heatmap Spatial Radar Canvas */}
        <div className="relative w-full h-64 sm:h-72 bg-[#041d11] rounded-2xl overflow-hidden border border-forest-800 shadow-inner flex items-center justify-center p-4">
          {/* 1. Radar Grid & Concentric Distance Rings (1.5km, 3.0km, 5.0km) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* 5.0 km Outer Ring */}
            <div className="w-[88%] h-[88%] rounded-full border border-emerald-500/20 relative flex items-start justify-center">
              <span className="text-[9px] font-mono font-bold text-emerald-400/60 bg-forest-950/90 px-1.5 py-0.5 rounded -mt-2.5">
                5.0 km
              </span>
            </div>
            {/* 3.0 km Middle Ring */}
            <div className="absolute w-[58%] h-[58%] rounded-full border border-emerald-500/25 flex items-start justify-center">
              <span className="text-[9px] font-mono font-bold text-emerald-400/60 bg-forest-950/90 px-1.5 py-0.5 rounded -mt-2.5">
                3.0 km
              </span>
            </div>
            {/* 1.5 km Inner Ring */}
            <div className="absolute w-[30%] h-[30%] rounded-full border border-emerald-500/30 flex items-start justify-center">
              <span className="text-[9px] font-mono font-bold text-emerald-400/60 bg-forest-950/90 px-1.5 py-0.5 rounded -mt-2.5">
                1.5 km
              </span>
            </div>

            {/* Crosshairs Grid Lines */}
            <div className="absolute w-full h-[1px] bg-emerald-500/15" />
            <div className="absolute h-full w-[1px] bg-emerald-500/15" />

            {/* Subtle Sweeper Animation Effect */}
            <div className="absolute w-full h-full rounded-full animate-[spin_10s_linear_infinite] origin-center opacity-25">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-emerald-400/30 via-transparent to-transparent rounded-tl-full" />
            </div>
          </div>

          {/* 2. Heatmap Gradient Blooms (Soft Glow Intensity Clouds) */}
          {activeDataset.heatZones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;

            const glowBg =
              zone.intensity === 'high'
                ? 'radial-gradient(circle, rgba(225, 29, 72, 0.85) 0%, rgba(244, 63, 94, 0.45) 45%, rgba(244, 63, 94, 0.12) 75%, transparent 100%)'
                : zone.intensity === 'moderate'
                ? 'radial-gradient(circle, rgba(217, 119, 6, 0.8) 0%, rgba(245, 158, 11, 0.4) 45%, rgba(245, 158, 11, 0.12) 75%, transparent 100%)'
                : 'radial-gradient(circle, rgba(16, 185, 129, 0.75) 0%, rgba(52, 211, 153, 0.35) 50%, rgba(52, 211, 153, 0.1) 75%, transparent 100%)';

            return (
              <React.Fragment key={zone.id}>
                {/* Soft Heat Cloud Gradient */}
                <div
                  className="absolute rounded-full pointer-events-none transition-all duration-700 ease-out animate-pulse"
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.radius * 2}px`,
                    height: `${zone.radius * 2}px`,
                    transform: 'translate(-50%, -50%)',
                    background: glowBg,
                    filter: 'blur(10px)',
                    opacity: isSelected ? 0.95 : 0.75,
                  }}
                />

                {/* Interactive Zone Marker Node */}
                <button
                  type="button"
                  onClick={() => setSelectedZoneId(zone.id)}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 transition-all p-1 cursor-pointer group"
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-extrabold text-[10px] shadow-lg border-2 backdrop-blur-md transition-all ${
                      zone.intensity === 'high'
                        ? 'bg-rose-600/90 border-rose-300 ring-4 ring-rose-500/40'
                        : zone.intensity === 'moderate'
                        ? 'bg-amber-500/90 border-amber-200 ring-4 ring-amber-500/40'
                        : 'bg-emerald-600/90 border-emerald-300 ring-4 ring-emerald-500/30'
                    } ${isSelected ? 'scale-125 ring-8 ring-amber-300/80 shadow-2xl z-30' : 'hover:scale-110'}`}
                  >
                    <span>{zone.reportedCases}</span>
                  </div>

                  {/* Mini Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-forest-950/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-40 border border-amber-400/40">
                    {language === 'mr' ? zone.areaNameMr : language === 'hi' ? (zone.areaNameHi || zone.areaName) : zone.areaName} ({zone.reportedCases})
                  </div>
                </button>
              </React.Fragment>
            );
          })}

          {/* 3. Center Point Pin: "Your Farm" / "आपले शेत" */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-7 h-7 rounded-full bg-amber-400/40 animate-ping" />
              <div className="w-4.5 h-4.5 rounded-full bg-amber-400 border-2 border-white shadow-xl flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
              </div>
            </div>
            <span className="text-[10px] font-black text-amber-300 bg-forest-950/95 px-2.5 py-0.5 rounded-full mt-1 border border-amber-400/60 shadow-md backdrop-blur-sm tracking-wide font-display">
              🏠 {t.radarYourFarm}
            </span>
          </div>

          {/* 4. Heatmap Legend (Top Right Overlay) */}
          <div className="absolute top-2 right-2 z-20 bg-forest-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-2 text-[9px] font-bold text-stone-200 shadow-md">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{t.legendHigh}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{t.legendMed}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t.legendLow}</span>
            </span>
          </div>

          {/* 5. Privacy Disclaimer Banner (Bottom Overlay) */}
          <div className="absolute bottom-2 inset-x-2 z-20 text-center text-[10px] text-emerald-200/90 bg-forest-950/90 py-1 px-2 rounded-xl border border-emerald-500/30 backdrop-blur-md shadow-md">
            🛡️ {t.areaMapNotice}
          </div>
        </div>

        {/* Selected Cluster / Heat Zone Detailed Info Box */}
        {activeZone && (
          <div className="mt-3 bg-stone-50 rounded-2xl p-3 border border-stone-200 text-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                  <span>{language === 'mr' ? activeZone.areaNameMr : language === 'hi' ? (activeZone.areaNameHi || activeZone.areaName) : activeZone.areaName}</span>
                </div>
                <div className="text-[11px] text-stone-600 font-medium mt-0.5">
                  {activeZone.crop} • {activeZone.reportedCases}{' '}
                  {t.reportedCasesLabel}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-extrabold text-forest-900 bg-forest-100 px-2.5 py-1 rounded-lg border border-forest-200">
                  ~{activeZone.distanceKm} km {t.awayLabel}
                </span>
              </div>
            </div>
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
          "{language === 'mr' ? activeDataset.advisoryMr : language === 'hi' ? (activeDataset.advisoryHi || activeDataset.advisory) : activeDataset.advisory}"
        </p>

        <button
          onClick={() => setActiveTab('expert')}
          type="button"
          className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-forest-950 font-extrabold text-xs active:scale-95 transition-all text-center shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{t.actionExpert}</span>
          <ChevronRight className="w-4 h-4 text-forest-950" />
        </button>
      </div>
    </div>
  );
};
