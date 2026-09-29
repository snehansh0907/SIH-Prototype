import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Clock, Layers, MapPin, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import type { SeverityLevel, AreaReport } from '../../types';
import { VoiceButton } from '../common/VoiceButton';
import { hotspotService } from '../../services/hotspotService';
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
    advisory: 'Lumpy Skin Disease (LSD) & Mastitis alert across Niphad. Maintain fly repellents in sheds, isolate symptomatic cattle, and contact veterinary dispensary for ring vaccination.',
    advisoryHi: 'निफाड़ क्षेत्र में लंपी त्वचा रोग (LSD) और थनैला का अलर्ट। गोठे में मक्खी-मच्छर नियंत्रण रखें, बीमार पशुओं को अलग करें और रिंग टीकाकरण करवाएं।',
    advisoryMr: 'निफाड परिसरात लंपी रोग व स्तनदाह (मस्टायटिस) सतर्कता इशारा. गोठ्यात डास-माश्या नियंत्रण ठेवा, बाधित जनावरे वेगळी बांधा व रिंग लसीकरण करून घ्या.',
    heatZones: [
      {
        id: 'c1',
        x: 68,
        y: 28,
        radius: 95,
        intensity: 'high',
        areaName: 'Pimpalgaon Ridge Livestock Zone',
        areaNameHi: 'पिंपलगांव पशुधन क्षेत्र',
        areaNameMr: 'पिंपळगाव पशुधन विभाग',
        crop: 'Cattle (LSD & Mastitis)',
        reportedCases: 8,
        distanceKm: 1.4,
      },
      {
        id: 'c2',
        x: 26,
        y: 62,
        radius: 80,
        intensity: 'moderate',
        areaName: 'Niphad East Dairy Sector',
        areaNameHi: 'निफाड़ पूर्वी दुग्ध सेक्टर',
        areaNameMr: 'निफाड पूर्व दुग्ध विभाग',
        crop: 'Cattle & Buffalo',
        reportedCases: 5,
        distanceKm: 3.2,
      },
      {
        id: 'c3',
        x: 74,
        y: 74,
        radius: 65,
        intensity: 'low',
        areaName: 'Chandori River Goat Sector',
        areaNameHi: 'चांदोरी शेळी क्लस्टर',
        areaNameMr: 'चांदोरी शेळी विभाग',
        crop: 'Goats (PPR Surveillance)',
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
    advisory: 'Foot and Mouth Disease (FMD) & Hemorrhagic Septicemia alert in Dindori livestock belt. Disinfect animal sheds and report mouth salivation immediately.',
    advisoryHi: 'दिंडोरी पशुधन क्षेत्र में खुरपका-मुंहपका (FMD) और गलघोंटू का अलर्ट। पशुशालाओं को कीटाणुरहित करें और तुरंत पशु चिकित्सक को सूचित करें।',
    advisoryMr: 'दिंडोरी पशुधन पट्ट्यात लाळ्या खुरकूत व घटसर्प आजाराचा अलर्ट. गोठे निर्जंतुक करा व लाळ गळण्याच्या तक्रारींची त्वरित नोंद करा.',
    heatZones: [
      {
        id: 'c1',
        x: 36,
        y: 24,
        radius: 105,
        intensity: 'high',
        areaName: 'Dindori North Dairy Valley',
        areaNameHi: 'दिंडोरी उत्तर दुग्ध खोरे',
        areaNameMr: 'दिंडोरी उत्तर दुग्ध खोरे',
        crop: 'Cattle (FMD Cluster)',
        reportedCases: 12,
        distanceKm: 1.8,
      },
      {
        id: 'c2',
        x: 72,
        y: 48,
        radius: 85,
        intensity: 'high',
        areaName: 'Vani Road Cattle Belt',
        areaNameHi: 'वणी रोड पशुधन पट्टा',
        areaNameMr: 'वणी रोड गोवंश पट्टा',
        crop: 'Cattle & Buffalo',
        reportedCases: 7,
        distanceKm: 2.9,
      },
      {
        id: 'c3',
        x: 30,
        y: 75,
        radius: 65,
        intensity: 'moderate',
        areaName: 'Parna Goat Sector',
        areaNameHi: 'परना शेळी सेक्टर',
        areaNameMr: 'परना शेळी विभाग',
        crop: 'Goat & Sheep',
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
    advisory: 'Moderate tick infestation and parasitic gastroenteritis in small ruminants near Godavari riverbanks. Deworming drive active.',
    advisoryHi: 'गोदावरी नदी तट पर बकरियों व भेड़ों में परजीवी कृमि व चिचड़ी का मध्यम जोखिम। कृमिनाशक दवा (डीवॉर्मिंग) अवश्य दें।',
    advisoryMr: 'गोदावरी काठच्या शेळ्या-मेंढ्यांमध्ये जंत व गोचीड संसर्गाचा मध्यम धोका. जंतनाशक औषधोपचार मोहीम सुरू आहे.',
    heatZones: [
      {
        id: 'c1',
        x: 58,
        y: 68,
        radius: 85,
        intensity: 'moderate',
        areaName: 'Godavari Basin Dairy Cluster',
        areaNameHi: 'गोदावरी बेसिन दुग्ध क्लस्टर',
        areaNameMr: 'गोदावरी खोरे दुग्ध विभाग',
        crop: 'Buffalo (Mastitis)',
        reportedCases: 5,
        distanceKm: 2.1,
      },
      {
        id: 'c2',
        x: 34,
        y: 36,
        radius: 70,
        intensity: 'moderate',
        areaName: 'Saykheda Livestock Sector',
        areaNameHi: 'सायखेड़ा पशुधन सेक्टर',
        areaNameMr: 'सायखेडा पशुधन भाग',
        crop: 'Cattle',
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
        crop: 'Goats',
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
    advisory: 'Bovine Mastitis and Lumpy Skin Disease cluster identified near Pimpalgaon rural dairy hub. Clean teat dipping is strongly advised.',
    advisoryHi: 'पिंपलगांव दुग्ध हब के पास थनैला और लंपी रोग का समूह पाया गया। दोहन के बाद थनों को एंटीसेप्टिक में डुबोएं।',
    advisoryMr: 'पिंपळगाव दुग्ध संकलन केंद्राजवळ स्तनदाह व लंपी आजाराचे रुग्ण आढळले. दूध काढल्यावर सडांचे निर्जंतुकीकरण करा.',
    heatZones: [
      {
        id: 'c1',
        x: 52,
        y: 28,
        radius: 95,
        intensity: 'high',
        areaName: 'Rural Dairy Hub Cluster',
        areaNameHi: 'ग्रामीण दुग्ध हब क्लस्टर',
        areaNameMr: 'ग्रामीण दुग्ध संकलन केंद्र',
        crop: 'Cattle & Buffalo',
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
        areaNameMr: 'शिरवाडे भाग',
        crop: 'Cattle',
        reportedCases: 4,
        distanceKm: 2.8,
      },
      {
        id: 'c3',
        x: 35,
        y: 70,
        radius: 60,
        intensity: 'moderate',
        areaName: 'Vinchur Livestock Belt',
        areaNameHi: 'विंचूर पशुधन पट्टा',
        areaNameMr: 'विंचूर पशुधन पट्टा',
        crop: 'Goat & Sheep',
        reportedCases: 3,
        distanceKm: 4.2,
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
    advisory: 'Low livestock disease risk across Baramati and Satara dairy cooperative belts. Routine FMD & HS preventive vaccinations recommended.',
    advisoryHi: 'बारामती और सातारा दुग्ध क्षेत्र में पशु रोग का जोखिम कम है। नियमित खुरपका-मुँहपका टीकाकरण जारी रखें।',
    advisoryMr: 'बारामती व सातारा भागात जनावरांच्या आजारांचा धोका कमी. नियमित लाळ्या खुरकूत व घटसर्प लसीकरण करा.',
    heatZones: [
      {
        id: 'c1',
        x: 68,
        y: 35,
        radius: 70,
        intensity: 'moderate',
        areaName: 'Dairy Cooperative Belt',
        areaNameHi: 'दुग्ध सहकारी बेल्ट',
        areaNameMr: 'दूध संघ पट्टा',
        crop: 'Crossbred Cattle',
        reportedCases: 3,
        distanceKm: 2.6,
      },
      {
        id: 'c2',
        x: 30,
        y: 62,
        radius: 60,
        intensity: 'low',
        areaName: 'Neera Valley Goat Cluster',
        areaNameHi: 'नीरा घाटी बकरी क्लस्टर',
        areaNameMr: 'नीरा खोरे शेळी गट',
        crop: 'Osmanabadi Goats',
        reportedCases: 2,
        distanceKm: 4.1,
      },
    ],
  },
};

export const AreaHotspotView: React.FC = () => {
  const { language, t } = useLanguage();
  const { resetToHome, setActiveTab, selectedFarm, diagnosis } = useCrop();
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
  const [backendReport, setBackendReport] = useState<AreaReport | null>(null);

  // Fetch real anonymized hotspot data from backend diagnosis cases
  useEffect(() => {
    let isMounted = true;
    hotspotService
      .getAreaReport({
        crop: user?.monitoredCrop || diagnosis?.cropId || 'Onion',
        disease: diagnosis?.diseaseName,
        taluka: user?.taluka || 'Niphad',
        district: user?.district || 'Nashik',
        latitude: selectedFarm?.latitude || user?.latitude || 20.15,
        longitude: selectedFarm?.longitude || user?.longitude || 74.12,
      })
      .then((report) => {
        if (isMounted && report) {
          setBackendReport(report);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [user?.id, selectedFarm?.id, diagnosis?.cropId]);

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
    <div className="animate-fadeIn text-left w-full min-w-0 space-y-4">
      {/* Top Bar: Navigation & Voice Advisory */}
      <section aria-label="Area Top Navigation" className="flex items-center justify-between min-w-0 w-full h-auto">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-900 hover:text-forest-950 btn-tactile-subtle cursor-pointer bg-forest-100/80 px-3 py-1 rounded-full border border-forest-200 shadow-xs shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.navHome}</span>
        </button>

        <VoiceButton textToSpeak={voiceText} variant="pill" className="shrink-0" />
      </section>

      {/* Primary Question & Region Selector Section */}
      <section aria-label="Location and Region Selection" className="min-w-0 w-full h-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-forest-100 text-forest-900 flex items-center justify-center text-xl shadow-xs border border-forest-200 shrink-0">
            📍
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-black text-[#183027] font-display leading-tight truncate">
              {t.whatIsHappeningAroundMe}
            </h2>
            <p className="text-xs text-[#596A61] font-bold mt-0.5 truncate">
              {language === 'mr' ? activeDataset.nameMr : language === 'hi' ? (activeDataset.nameHi || activeDataset.name) : activeDataset.name} • {language === 'mr' ? activeDataset.districtMr : language === 'hi' ? (activeDataset.districtHi || activeDataset.district) : activeDataset.district}
            </p>
          </div>
        </div>

        {/* Dynamic Location-Aware Nearby Region Selector Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar min-w-0 w-full">
          <span className="text-[10px] font-black uppercase text-forest-900/60 shrink-0 font-display mr-1">
            {t.selectRegion}
          </span>
          {nearbyRegions.map((loc) => {
            const isCurrent = selectedLocId === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocId(loc.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-black whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1 shrink-0 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#174D35] to-[#176B45] text-white shadow-md scale-[1.02] border border-forest-600/50 ring-2 ring-forest-400/30'
                    : 'bg-white/90 hover:bg-white text-stone-700 border border-white/95 shadow-xs'
                }`}
              >
                <span>📍 {language === 'mr' ? loc.nameMr : language === 'hi' ? (loc.nameHi || loc.name) : loc.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 1: Disease Activity Summary Card */}
      <section
        aria-label="Disease Activity Status"
        className={`glass-card p-4 sm:p-5 shadow-glass rounded-3xl transition-all border min-w-0 w-full h-auto ${
          activeDataset.status === 'high'
            ? 'bg-rose-50/85 border-rose-200'
            : activeDataset.status === 'moderate'
            ? 'bg-amber-50/85 border-amber-200'
            : 'bg-emerald-50/85 border-emerald-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={`w-2.5 h-2.5 rounded-full animate-ping shrink-0 ${
                activeDataset.status === 'high'
                  ? 'bg-rose-600'
                  : activeDataset.status === 'moderate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
            />
            <h3 className="text-base sm:text-lg font-black text-[#183027] font-display truncate min-w-0">
              {activeDataset.status === 'high'
                ? t.highDiseaseActivity
                : activeDataset.status === 'moderate'
                ? t.areaStatusTitle
                : t.lowDiseaseActivity}
            </h3>
          </div>
          <StatusBadge level={activeDataset.status} type="risk" size="sm" className="shrink-0" />
        </div>

        {/* 3 Compact Status Metrics (10-12px internal spacing) */}
        <div className="space-y-2.5 pt-1 border-t border-stone-200/50 min-w-0 w-full">
          <div className="flex items-center gap-2 text-xs font-bold text-[#183027] min-w-0">
            <span className="text-base shrink-0">🦠</span>
            <span className="truncate flex-1 min-w-0">
              {language === 'mr'
                ? `${backendReport?.activeCasesCount ?? activeDataset.activeCasesCount} रोग अहवाल (३ किमी परिसर)`
                : language === 'hi'
                ? `3 किमी के दायरे में ${backendReport?.activeCasesCount ?? activeDataset.activeCasesCount} बीमारी की रिपोर्ट`
                : `${backendReport?.activeCasesCount ?? activeDataset.activeCasesCount} disease reports within 3 km`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#183027] min-w-0">
            <span className="text-base shrink-0">📈</span>
            <span className="truncate flex-1 min-w-0">
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

          <div className="flex items-center gap-2 text-xs font-semibold text-[#596A61] min-w-0">
            <Clock className="w-4 h-4 text-stone-400 shrink-0" />
            <span className="truncate flex-1 min-w-0">
              {t.updated}: {activeDataset.lastUpdated}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Unified Community Disease Activity Radar */}
      <section aria-label="Community Disease Radar" className="glass-card bg-white/90 border border-white/95 p-4 sm:p-4.5 shadow-glass rounded-3xl overflow-hidden min-w-0 w-full h-auto">
        {/* Radar Header & Radius Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Layers className="w-4 h-4 text-forest-800 shrink-0" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#183027] font-display break-words">
              {t.areaMapTitle}
            </h4>
          </div>
          <span className="text-[10px] font-black text-forest-900 bg-forest-100 border border-forest-200 px-2.5 py-1 rounded-full shadow-xs shrink-0">
            {t.radius5km}
          </span>
        </div>

        {/* Heatmap Spatial Radar Canvas */}
        <div className="relative w-full h-64 sm:h-72 bg-[#061e13] rounded-2xl overflow-hidden border border-forest-700/50 shadow-inner flex items-center justify-center p-4 min-w-0">
          {/* Radar Grid & Concentric Distance Rings (Subtle reference lines) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* 5.0 km Outer Ring */}
            <div className="w-[88%] h-[88%] rounded-full border border-emerald-500/20 relative flex items-start justify-center">
              <span className="text-[8px] font-mono font-semibold text-emerald-400/60 bg-forest-950/80 px-1 py-0.5 rounded -mt-2 border border-emerald-500/15">
                5.0 km
              </span>
            </div>
            {/* 3.0 km Middle Ring */}
            <div className="absolute w-[58%] h-[58%] rounded-full border border-emerald-500/20 flex items-start justify-center">
              <span className="text-[8px] font-mono font-semibold text-emerald-400/60 bg-forest-950/80 px-1 py-0.5 rounded -mt-2 border border-emerald-500/15">
                3.0 km
              </span>
            </div>
            {/* 1.5 km Inner Ring */}
            <div className="absolute w-[30%] h-[30%] rounded-full border border-emerald-500/25 flex items-start justify-center">
              <span className="text-[8px] font-mono font-semibold text-emerald-400/60 bg-forest-950/80 px-1 py-0.5 rounded -mt-2 border border-emerald-500/15">
                1.5 km
              </span>
            </div>

            {/* Crosshairs Grid Lines */}
            <div className="absolute w-full h-[1px] bg-emerald-500/10" />
            <div className="absolute h-full w-[1px] bg-emerald-500/10" />

            {/* Subtle Sweeper Animation */}
            <div className="absolute w-full h-full rounded-full animate-[spin_10s_linear_infinite] origin-center opacity-20">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-emerald-400/30 via-transparent to-transparent rounded-tl-full" />
            </div>
          </div>

          {/* Heatmap Gradient Blooms & Case Nodes */}
          {activeDataset.heatZones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;

            const glowBg =
              zone.intensity === 'high'
                ? 'radial-gradient(circle, rgba(225, 29, 72, 0.85) 0%, rgba(244, 63, 94, 0.45) 45%, rgba(244, 63, 94, 0.12) 75%, transparent 100%)'
                : zone.intensity === 'moderate'
                ? 'radial-gradient(circle, rgba(217, 119, 6, 0.8) 0%, rgba(245, 158, 11, 0.4) 45%, rgba(245, 158, 11, 0.12) 75%, transparent 100%)'
                : 'radial-gradient(circle, rgba(16, 185, 129, 0.75) 0%, rgba(52, 211, 153, 0.35) 50%, rgba(52, 211, 153, 0.1) 75%, transparent 100%)';

            const pulseClass =
              zone.intensity === 'high'
                ? 'radar-glow-zone-high'
                : zone.intensity === 'moderate'
                ? 'radar-glow-zone-med'
                : '';

            return (
              <React.Fragment key={zone.id}>
                {/* Soft Heat Cloud Gradient with calm ambient pulse */}
                <div
                  className={`absolute rounded-full pointer-events-none transition-opacity duration-700 ease-spring ${pulseClass}`}
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
                  className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ease-spring p-1 cursor-pointer group active:scale-95"
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-black text-[10px] shadow-lg border-2 backdrop-blur-md transition-all duration-200 ease-spring ${
                      zone.intensity === 'high'
                        ? 'bg-rose-600 border-rose-300 ring-2 ring-rose-500/40'
                        : zone.intensity === 'moderate'
                        ? 'bg-amber-500 border-amber-200 ring-2 ring-amber-500/40'
                        : 'bg-emerald-600 border-emerald-300 ring-2 ring-emerald-500/30'
                    } ${isSelected ? 'scale-115 ring-4 ring-amber-300 shadow-2xl z-30' : 'hover:scale-105'}`}
                  >
                    <span>{zone.reportedCases}</span>
                  </div>

                  {/* Mini Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-forest-950/95 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-40 border border-amber-400/40">
                    {language === 'mr' ? zone.areaNameMr : language === 'hi' ? (zone.areaNameHi || zone.areaName) : zone.areaName} ({zone.reportedCases})
                  </div>
                </button>
              </React.Fragment>
            );
          })}

          {/* Center User Location Marker: "Your Herd Location" with calm beacon glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none min-w-0">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-5 h-5 rounded-full bg-amber-400/30 animate-pulse-subtle" />
              <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-xl flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
              </div>
            </div>
            <span className="text-[9px] font-black text-amber-300 bg-forest-950/95 px-2 py-0.5 rounded-full mt-1 border border-amber-400/50 shadow-md backdrop-blur-sm tracking-wide font-display whitespace-nowrap">
              📍 {t.radarYourFarm}
            </span>
          </div>

          {/* Compact Radar Legend (Top Right Overlay) */}
          <div className="absolute top-2 right-2 z-20 bg-forest-950/90 backdrop-blur-md px-2 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 text-[8px] font-bold text-stone-200 shadow-md">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>{t.legendHigh.split(' ')[0]}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{t.legendMed.split(' ')[0]}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{t.legendLow.split(' ')[0]}</span>
            </span>
          </div>
        </div>

        {/* Privacy Message Footer inside Radar Card */}
        <div className="mt-2.5 p-2 rounded-xl bg-forest-50/70 border border-forest-100 text-center text-[10px] text-[#596A61] font-semibold leading-relaxed w-full min-w-0">
          🛡️ {t.areaMapNotice}
        </div>
      </section>

      {/* SECTION 3: Selected Nearby Herd / Area Location Card */}
      {activeZone && (
        <section aria-label="Selected Nearby Livestock Case" className="glass-card bg-white/90 border border-white/95 p-4 shadow-glass rounded-3xl text-xs animate-fadeIn min-w-0 w-full h-auto">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="font-black text-sm text-[#183027] font-display flex items-center gap-1.5 min-w-0">
                <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
                <span className="break-words">
                  {language === 'mr' ? activeZone.areaNameMr : language === 'hi' ? (activeZone.areaNameHi || activeZone.areaName) : activeZone.areaName}
                </span>
              </div>
              <div className="text-[11px] text-[#596A61] font-bold mt-1 min-w-0 break-words">
                {activeZone.crop || 'Livestock (Cattle & Buffalo)'} • {activeZone.reportedCases} {t.reportedCasesLabel}
              </div>
            </div>

            <div className="shrink-0">
              <span className="text-[11px] font-black text-forest-950 bg-forest-100 px-3 py-1.5 rounded-xl border border-forest-200 shadow-xs block">
                ~{activeZone.distanceKm} km {t.awayLabel}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: Veterinary / Animal Husbandry Dept Advisory Card */}
      <section aria-label="Official Veterinary Advisory" className="glass-hero bg-gradient-to-br from-[#174D35] via-[#176B45] to-[#174D35] text-white p-4.5 sm:p-5 shadow-float-glow rounded-3xl border border-forest-600/40 min-w-0 w-full h-auto">
        <div className="flex items-center gap-2 mb-2 min-w-0">
          <span className="text-xl shrink-0">🏛️</span>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#F6BD28] font-display truncate min-w-0">
            {t.officialAdvisoryTitle}
          </h4>
        </div>
        <p className="text-xs font-medium text-[#D8EBDD] leading-relaxed mb-4 break-words">
          "{language === 'mr' ? activeDataset.advisoryMr : language === 'hi' ? (activeDataset.advisoryHi || activeDataset.advisory) : activeDataset.advisory}"
        </p>

        <button
          onClick={() => setActiveTab('expert')}
          type="button"
          className="w-full py-3 px-4 rounded-2xl bg-[#F6BD28] hover:bg-amber-300 text-[#174D35] font-black text-xs active:scale-95 transition-all text-center shadow-md flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300/60"
        >
          <span>{t.actionExpert}</span>
          <ChevronRight className="w-4 h-4 text-[#174D35] shrink-0" />
        </button>
      </section>
    </div>
  );
};
