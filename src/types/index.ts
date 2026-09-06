export type Language = 'en' | 'hi' | 'mr';

export type AuthRole = 'unauthenticated' | 'demo' | 'farmer';

export interface FarmerUser {
  id: string;
  farmerId: string;
  name: string;
  nameHi?: string;
  nameMr?: string;
  phone?: string;
  email?: string;
  emailOrPhone: string;
  village: string;
  taluka: string;
  district: string;
  state?: string;
  pincode?: string;
  location: string;
  locationHi?: string;
  locationMr?: string;
  latitude?: number;
  longitude?: number;
  userType: 'demo' | 'registered';
  farmName: string;
  areaAcres: number | string;
  monitoredCrop: string;
  monitoredCropHi?: string;
  monitoredCropMr?: string;
  farmId?: string;
  cropCycleId?: string;
  avatar?: string;
  isDemo?: boolean;
  isNewUser?: boolean;
}

export type SeverityLevel = 'low' | 'moderate' | 'high';
export type ConfidenceLevel = 'reliable' | 'monitor' | 'review';

export interface CropInfo {
  id: string;
  name: string;
  nameHi?: string;
  nameMr: string;
  icon: string;
  scientificName: string;
  sampleImages: {
    id: string;
    title: string;
    titleHi?: string;
    titleMr: string;
    condition: string;
    url: string;
    fallbackUrl?: string;
    isHealthy?: boolean;
  }[];
}

export interface ActionItem {
  step: number;
  title: string;
  titleHi?: string;
  titleMr: string;
  description: string;
  descriptionHi?: string;
  descriptionMr: string;
  priority: 'critical' | 'important' | 'preventive';
  category?: 'cultural' | 'mechanical' | 'biological' | 'chemical';
}

export interface MonitorItem {
  title: string;
  titleHi?: string;
  titleMr: string;
  check: string;
  checkHi?: string;
  checkMr: string;
}

export interface DiagnosisResult {
  id: string;
  cropId: string;
  cropName: string;
  cropNameHi?: string;
  cropNameMr: string;
  diseaseName: string;
  diseaseNameHi?: string;
  diseaseNameMr: string;
  pathogen: string;
  severity: SeverityLevel;
  confidenceLabel: ConfidenceLevel;
  isUncertain?: boolean;
  detectedAt: string;
  imageUrl?: string;
  whatToDoToday: ActionItem[];
  whatToMonitor: MonitorItem[];
  whatMayHappenNext: {
    title: string;
    titleHi?: string;
    titleMr: string;
    text: string;
    textHi?: string;
    textMr: string;
    riskTrend: 'increasing' | 'stable' | 'decreasing';
  };
  advisoryVoiceScript: string;
  advisoryVoiceScriptHi?: string;
  advisoryVoiceScriptMr: string;
}

export interface WeatherCondition {
  temp: number;
  humidity: number;
  rainfallStatus: string;
  rainfallStatusHi?: string;
  rainfallStatusMr: string;
  rainfallChance: number;
  condition: 'sunny' | 'humid' | 'rainy' | 'cloudy';
  cropImpactSummary: string;
  cropImpactSummaryHi?: string;
  cropImpactSummaryMr: string;
}

export interface RiskDay {
  day: string;
  dayHi?: string;
  dayMr: string;
  date: string;
  level: SeverityLevel;
  score: number; // 0 - 100
}

export interface RiskReason {
  id: string;
  title: string;
  titleHi?: string;
  titleMr: string;
  icon: 'droplet' | 'cloud-rain' | 'map-pin' | 'wind';
  detail: string;
  detailHi?: string;
  detailMr: string;
}

export interface RiskForecast {
  cropId: string;
  currentLevel: SeverityLevel;
  summary: string;
  summaryHi?: string;
  summaryMr: string;
  timeline: RiskDay[];
  reasons: RiskReason[];
  recommendation: string;
  recommendationHi?: string;
  recommendationMr: string;
}

export interface HotspotCluster {
  id: string;
  lat: number;
  lng: number;
  intensity: SeverityLevel;
  areaName: string;
  areaNameHi?: string;
  areaNameMr: string;
  crop: string;
  reportedCases: number;
  distanceKm: number;
}

export interface AreaReport {
  district: string;
  districtHi?: string;
  districtMr: string;
  subDistrict: string;
  subDistrictHi?: string;
  subDistrictMr: string;
  status: SeverityLevel;
  diseaseTrend: 'increasing' | 'stable' | 'decreasing';
  activeCasesCount: number;
  lastUpdated: string;
  clusters: HotspotCluster[];
  communityAdvisory: string;
  communityAdvisoryHi?: string;
  communityAdvisoryMr: string;
}

export interface ExpertProfile {
  id: string;
  name: string;
  nameHi?: string;
  nameMr: string;
  role: string;
  roleHi?: string;
  roleMr: string;
  station: string;
  stationHi?: string;
  stationMr: string;
  avatar: string;
  available: boolean;
  phone: string;
}

export interface ChatMessage {
  id: string;
  sender: 'farmer' | 'expert' | 'system';
  text: string;
  textHi?: string;
  textMr?: string;
  timestamp: string;
  isAudio?: boolean;
}

export type FollowUpStatus = 'better' | 'same' | 'worse';

