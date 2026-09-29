export type Language = 'en' | 'hi' | 'mr';

export type AuthRole = 'unauthenticated' | 'demo' | 'farmer' | 'owner';

export type AnimalSpecies = 'cattle' | 'buffalo' | 'goat' | 'sheep' | 'poultry';
export type AnimalGender = 'female' | 'male';
export type AnimalHealthStatus = 'healthy' | 'treatment' | 'recovered' | 'monitoring';
export type AffectedBodyArea = 'skin' | 'eyes' | 'mouth' | 'hooves' | 'udder' | 'general' | 'other';

export interface VaccinationRecord {
  id: string;
  animalId: string;
  animalName: string;
  species: AnimalSpecies;
  vaccineName: string;
  diseaseTarget: string;
  administeredDate: string;
  nextDueDate: string;
  status: 'completed' | 'due_soon' | 'overdue';
  batchNumber?: string;
  veterinarian?: string;
  notes?: string;
}

export interface LivestockAnimal {
  id: string;
  ownerId: string;
  tagNumber: string; // e.g. "MH-1042-88"
  name: string;      // e.g. "Gauri", "Kapila", "Murrah Bull"
  species: AnimalSpecies;
  breed: string;     // e.g. "Gir", "Sahiwal", "Murrah", "Osmanabadi"
  ageYears?: number;
  ageMonths?: number;
  gender: AnimalGender;
  count?: number;    // Flock size for poultry or 1 for large animals
  healthStatus: AnimalHealthStatus;
  lastVaccinationDate?: string;
  nextVaccinationDue?: string;
  recentCondition?: string;
  photoUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface FarmerUser {
  id: string;
  farmerId: string;
  name: string;
  nameHi?: string;
  nameMr?: string;
  phone?: string;
  email?: string;
  password?: string;
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
  monitoredCrop: string; // Primary livestock species (e.g. 'Cattle', 'Buffalo', 'Goat')
  monitoredCropHi?: string;
  monitoredCropMr?: string;
  primarySpecies?: AnimalSpecies;
  totalAnimals?: number;
  farmId?: string;
  cropCycleId?: string;
  shedId?: string;
  herdId?: string;
  species?: string;
  herdName?: string;
  herdSize?: number | string;
  vaccinationHistory?: string;
  avatar?: string;
  isDemo?: boolean;
  isNewUser?: boolean;
}

export type LivestockOwnerUser = FarmerUser;

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
    conditionMr?: string;
    conditionHi?: string;
    url: string;
    fallbackUrl?: string;
    isHealthy?: boolean;
    bodyArea?: AffectedBodyArea;
  }[];
}

export type SpeciesInfo = CropInfo;

export interface ActionItem {
  step: number;
  title: string;
  titleHi?: string;
  titleMr: string;
  description: string;
  descriptionHi?: string;
  descriptionMr: string;
  priority: 'critical' | 'important' | 'preventive';
  category?: 'isolation' | 'hygiene' | 'first_aid' | 'nutrition' | 'veterinary' | 'cultural' | 'mechanical' | 'biological' | 'chemical';
}

export interface MonitorItem {
  title: string;
  titleHi?: string;
  titleMr: string;
  check: string;
  checkHi?: string;
  checkMr: string;
}

export type RejectionReason = 'NOT_A_LIVESTOCK_IMAGE' | 'NOT_A_CROP_IMAGE' | 'LOW_IMAGE_QUALITY' | 'UNSUPPORTED_SPECIES' | 'UNSUPPORTED_CROP' | 'LOW_CONFIDENCE';

export interface DiagnosisResult {
  id: string;
  cropId: string; // speciesId: 'cattle' | 'buffalo' | 'goat' | 'sheep' | 'poultry'
  cropName: string;
  cropNameHi?: string;
  cropNameMr: string;
  diseaseName: string;
  diseaseNameHi?: string;
  diseaseNameMr: string;
  pathogen: string;
  severity: SeverityLevel;
  confidenceLabel: ConfidenceLevel;
  confidenceScore?: number;
  isUncertain?: boolean;
  isRejected?: boolean;
  diagnosisAvailable?: boolean;
  rejectionReason?: RejectionReason;
  rejectionMessage?: string;
  rejectionMessageMr?: string;
  rejectionMessageHi?: string;
  detectedAt: string;
  imageUrl?: string;
  animalId?: string;
  animalTag?: string;
  animalName?: string;
  affectedBodyArea?: AffectedBodyArea;
  symptomsObserved?: string[];
  symptomDuration?: string;
  appetiteChange?: string;
  milkYieldChange?: string;
  urgencyLevel?: 'low' | 'moderate' | 'high' | 'critical';
  medicalDisclaimer?: string;
  medicalDisclaimerHi?: string;
  medicalDisclaimerMr?: string;
  mlMetadata?: {
    model: string;
    version: string;
    realInference: boolean;
    latencyMs?: number;
  };
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
  confidence?: number;
  expertReviewStatus?: 'pending' | 'confirmed' | 'corrected';
  expertNotes?: string;
  advisoryVoiceScript: string;
  advisoryVoiceScriptHi?: string;
  advisoryVoiceScriptMr: string;
  caseStatus?: 'suspected' | 'vet_review_pending' | 'confirmed' | 'resolved';
}

export type AnimalHealthCase = DiagnosisResult;

export interface WeatherCondition {
  temp: number;
  humidity: number;
  rainfallStatus: string;
  rainfallStatusHi?: string;
  rainfallStatusMr: string;
  rainfallChance: number;
  condition: 'sunny' | 'humid' | 'rainy' | 'cloudy';
  cropImpactSummary: string; // Livestock heat stress & weather health summary
  cropImpactSummaryHi?: string;
  cropImpactSummaryMr: string;
  thi?: number;
  thiStatus?: string;
  thiIndex?: number; // Temperature-Humidity Index for cattle
  heatStressLevel?: 'normal' | 'alert' | 'danger' | 'emergency';
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
  icon: 'droplet' | 'cloud-rain' | 'map-pin' | 'wind' | 'thermometer' | 'bug' | 'activity';
  detail: string;
  detailHi?: string;
  detailMr: string;
}

export interface RiskForecast {
  cropId: string;
  currentLevel: SeverityLevel;
  score?: number; // 0 - 100
  summary: string;
  summaryHi?: string;
  summaryMr: string;
  timeline: RiskDay[];
  reasons: RiskReason[];
  recommendation: string;
  recommendationHi?: string;
  recommendationMr: string;
  breakdown?: {
    temperature: string;
    temperatureValue?: string;
    humidity: string;
    humidityValue?: string;
    thi?: string;
    vectorRisk?: string;
    rainfall: string;
    rainfallValue?: string;
    nearbyReports: number;
    cropStage: string;
    overallRisk: string;
  };
}

export interface HotspotCluster {
  id: string;
  lat: number;
  lng: number;
  intensity: SeverityLevel;
  areaName: string;
  areaNameHi?: string;
  areaNameMr: string;
  crop: string; // Livestock species & disease (e.g. 'Cattle (LSD & Mastitis)')
  reportedCases: number;
  distanceKm: number;
  diseaseName?: string;
  containmentStatus?: string;
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
  qualifications?: string;
  experienceYears?: number;
}

export type VetProfile = ExpertProfile;

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
