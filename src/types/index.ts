export type Language = 'en' | 'mr';

export type AuthRole = 'unauthenticated' | 'demo' | 'farmer';

export interface FarmerUser {
  id: string;
  farmerId: string;
  name: string;
  nameMr?: string;
  phone?: string;
  email?: string;
  emailOrPhone: string;
  village: string;
  taluka: string;
  district: string;
  location: string;
  locationMr?: string;
  userType: 'demo' | 'registered';
  farmName: string;
  areaAcres: number | string;
  monitoredCrop: string;
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
  nameMr: string;
  icon: string;
  scientificName: string;
  sampleImages: {
    id: string;
    title: string;
    titleMr: string;
    condition: string;
    url: string;
    isHealthy?: boolean;
  }[];
}

export interface ActionItem {
  step: number;
  title: string;
  titleMr: string;
  description: string;
  descriptionMr: string;
  priority: 'critical' | 'important' | 'preventive';
  category?: 'cultural' | 'mechanical' | 'biological' | 'chemical';
}

export interface MonitorItem {
  title: string;
  titleMr: string;
  check: string;
  checkMr: string;
}

export interface DiagnosisResult {
  id: string;
  cropId: string;
  cropName: string;
  cropNameMr: string;
  diseaseName: string;
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
    titleMr: string;
    text: string;
    textMr: string;
    riskTrend: 'increasing' | 'stable' | 'decreasing';
  };
  advisoryVoiceScript: string;
  advisoryVoiceScriptMr: string;
}

export interface WeatherCondition {
  temp: number;
  humidity: number;
  rainfallStatus: string;
  rainfallStatusMr: string;
  rainfallChance: number;
  condition: 'sunny' | 'humid' | 'rainy' | 'cloudy';
  cropImpactSummary: string;
  cropImpactSummaryMr: string;
}

export interface RiskDay {
  day: string;
  dayMr: string;
  date: string;
  level: SeverityLevel;
  score: number; // 0 - 100
}

export interface RiskReason {
  id: string;
  title: string;
  titleMr: string;
  icon: 'droplet' | 'cloud-rain' | 'map-pin' | 'wind';
  detail: string;
  detailMr: string;
}

export interface RiskForecast {
  cropId: string;
  currentLevel: SeverityLevel;
  summary: string;
  summaryMr: string;
  timeline: RiskDay[];
  reasons: RiskReason[];
  recommendation: string;
  recommendationMr: string;
}

export interface HotspotCluster {
  id: string;
  lat: number;
  lng: number;
  intensity: SeverityLevel;
  areaName: string;
  areaNameMr: string;
  crop: string;
  reportedCases: number;
  distanceKm: number;
}

export interface AreaReport {
  district: string;
  districtMr: string;
  subDistrict: string;
  subDistrictMr: string;
  status: SeverityLevel;
  diseaseTrend: 'increasing' | 'stable' | 'decreasing';
  activeCasesCount: number;
  lastUpdated: string;
  clusters: HotspotCluster[];
  communityAdvisory: string;
  communityAdvisoryMr: string;
}

export interface ExpertProfile {
  id: string;
  name: string;
  nameMr: string;
  role: string;
  roleMr: string;
  station: string;
  stationMr: string;
  avatar: string;
  available: boolean;
  phone: string;
}

export interface ChatMessage {
  id: string;
  sender: 'farmer' | 'expert' | 'system';
  text: string;
  textMr?: string;
  timestamp: string;
  isAudio?: boolean;
}

export type FollowUpStatus = 'better' | 'same' | 'worse';
