import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  DiagnosisResult,
  WeatherCondition,
  RiskForecast,
  FollowUpStatus,
  LivestockAnimal,
  VaccinationRecord,
} from '../types';
import {
  getDefaultDiagnosisForCrop,
  getDefaultRiskForecastForCrop,
  SEEDED_DEMO_HERD,
  SEEDED_DEMO_VACCINATIONS,
} from '../services/mockData';
import { diagnosisService, type CheckAnimalOptions } from '../services/diagnosisService';
import { weatherService } from '../services/weatherService';
import { riskService } from '../services/riskService';
import { followUpService } from '../services/followUpService';
import { livestockService } from '../services/livestockService';
import { vaccinationService } from '../services/vaccinationService';
import { farmService, SEEDED_DEMO_FARM_ID, SEEDED_DEMO_FARMER_ID, type BackendFarm } from '../services/farmService';
import { resolveFarmLocation } from '../services/locationRegionService';
import { useAuth } from './AuthContext';

export type NavigationTab = 'home' | 'check' | 'mortality' | 'diagnosis' | 'herd' | 'vaccination' | 'history' | 'area' | 'expert' | 'risk';

interface CropContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedCropId: string; // Active species (cattle, buffalo, goat, sheep, poultry)
  setSelectedCropId: (id: string) => void;
  selectedAnimal: LivestockAnimal | null;
  setSelectedAnimal: (animal: LivestockAnimal | null) => void;
  herd: LivestockAnimal[];
  vaccinations: VaccinationRecord[];
  refreshHerd: () => Promise<void>;
  refreshVaccinations: () => Promise<void>;
  addAnimalToHerd: (animal: Parameters<typeof livestockService.addAnimal>[0]) => Promise<LivestockAnimal>;
  recordVaccination: (vac: Parameters<typeof vaccinationService.addVaccineRecord>[0]) => Promise<VaccinationRecord>;
  diagnosis: DiagnosisResult;
  setDiagnosis: (diag: DiagnosisResult) => void;
  isAnalyzing: boolean;
  weather: WeatherCondition | null;
  isWeatherLoading: boolean;
  weatherError: string | null;
  refetchWeather: () => Promise<void>;
  selectedFarm: BackendFarm | null;
  setSelectedFarm: (farm: BackendFarm) => void;
  availableFarms: BackendFarm[];
  riskForecast: RiskForecast;
  followUpStatus: FollowUpStatus | null;
  setFollowUpStatus: (status: FollowUpStatus | null) => void;
  performDiagnosis: (
    speciesId: string,
    imageSource?: string | File | Blob,
    options?: CheckAnimalOptions
  ) => Promise<DiagnosisResult>;
  resetToHome: () => void;
}

const CropContext = createContext<CropContextType | undefined>(undefined);

export const CropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  const initialSpecies = (user?.monitoredCrop || 'cattle').toLowerCase().trim();
  const [selectedCropId, setSelectedCropId] = useState<string>(initialSpecies);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult>(() => getDefaultDiagnosisForCrop(initialSpecies));

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Herd & Vaccination state
  const [herd, setHerd] = useState<LivestockAnimal[]>(() => livestockService.getStoredHerd(user?.id || user?.farmerId));
  const [selectedAnimal, setSelectedAnimal] = useState<LivestockAnimal | null>(() => SEEDED_DEMO_HERD[0] || null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(() => vaccinationService.getStoredVaccines());

  // Weather & Farm State
  const [selectedFarm, setSelectedFarm] = useState<BackendFarm | null>(null);
  const [availableFarms, setAvailableFarms] = useState<BackendFarm[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [riskForecast, setRiskForecast] = useState<RiskForecast>(() => getDefaultRiskForecastForCrop(initialSpecies));
  const [followUpStatus, setFollowUpStatusState] = useState<FollowUpStatus | null>(null);

  // Synchronize active species with authenticated owner's registered primary species
  useEffect(() => {
    if (user?.monitoredCrop) {
      const targetSpecies = user.monitoredCrop.toLowerCase().trim();
      setSelectedCropId(targetSpecies);
      setDiagnosis((prev) => (prev.cropId === targetSpecies ? prev : getDefaultDiagnosisForCrop(targetSpecies)));
      setRiskForecast((prev) => (prev.cropId === targetSpecies ? prev : getDefaultRiskForecastForCrop(targetSpecies)));
    }
  }, [user?.farmerId, user?.id, user?.monitoredCrop]);

  // Synchronize active diagnosis with user's active farm and crop context
  useEffect(() => {
    let isCancelled = false;

    async function syncActiveDiagnosis() {
      const activeCrop = (user?.monitoredCrop || selectedCropId || 'cattle').toLowerCase().trim();
      const farmerId = user?.farmerId || user?.id;
      const farmId = selectedFarm?.id || user?.farmId;

      try {
        const resolvedDiagnosis = await diagnosisService.getDiagnosisForActiveContext({
          farmId,
          farmerId,
          cropName: activeCrop,
        });

        if (!isCancelled && resolvedDiagnosis) {
          if (resolvedDiagnosis.cropId === activeCrop) {
            setDiagnosis(resolvedDiagnosis);
          } else {
            setDiagnosis(getDefaultDiagnosisForCrop(activeCrop));
          }
        }
      } catch (err) {
        console.warn('[CropContext] Error syncing active diagnosis context:', err);
        if (!isCancelled) {
          setDiagnosis(getDefaultDiagnosisForCrop(activeCrop));
        }
      }
    }

    syncActiveDiagnosis();

    return () => {
      isCancelled = true;
    };
  }, [user?.monitoredCrop, selectedCropId, user?.farmerId, user?.id, selectedFarm?.id, user?.farmId]);

  // Load and synchronize user herd & vaccination records
  const refreshHerd = useCallback(async () => {
    const ownerId = user?.id || user?.farmerId || SEEDED_DEMO_FARMER_ID;
    try {
      const loaded = await livestockService.getHerdByOwner(ownerId);
      setHerd(loaded);
      if (loaded.length > 0 && !selectedAnimal) {
        setSelectedAnimal(loaded[0]);
      }
    } catch {
      setHerd(SEEDED_DEMO_HERD);
    }
  }, [user?.id, user?.farmerId, selectedAnimal]);

  const refreshVaccinations = useCallback(async () => {
    try {
      const loaded = await vaccinationService.getVaccinationsForHerd();
      setVaccinations(loaded);
    } catch {
      setVaccinations(SEEDED_DEMO_VACCINATIONS);
    }
  }, []);

  useEffect(() => {
    refreshHerd();
    refreshVaccinations();
  }, [refreshHerd, refreshVaccinations]);

  // Synchronize available farms and barn locations
  useEffect(() => {
    let isCancelled = false;

    async function loadFarms() {
      if (!user) {
        setAvailableFarms([]);
        setSelectedFarm(null);
        return;
      }

      const farmerId = user.id || user.farmerId;
      const farms = await farmService.getFarmsByFarmer(farmerId);

      let userFarm: BackendFarm | null = null;
      if (user.farmName || user.village) {
        const resolved = resolveFarmLocation(user, null);
        userFarm = {
          id: user.farmId || (farms.length > 0 ? farms[0].id : `user-farm-${user.id || 'reg'}`),
          farmer_id: farmerId,
          farm_name: user.farmName || `${user.village || 'My'} Barn`,
          latitude: resolved.latitude ?? 20.085,
          longitude: resolved.longitude ?? 74.11,
          village: user.village,
          taluka: user.taluka,
          district: user.district,
          area_acres: typeof user.areaAcres === 'number' ? user.areaAcres : parseFloat(String(user.areaAcres || '2.5')),
        };
      }

      if (!isCancelled) {
        const combined = farms.length > 0 ? farms : userFarm ? [userFarm] : [];
        setAvailableFarms(combined);
        setSelectedFarm(combined[0] || null);
      }
    }

    loadFarms();

    return () => {
      isCancelled = true;
    };
  }, [
    user?.id,
    user?.farmerId,
    user?.farmId,
    user?.latitude,
    user?.longitude,
    user?.farmName,
    user?.village,
    user?.taluka,
    user?.district,
    user?.areaAcres,
  ]);

  // Live Weather & Dynamic Risk Fetcher
  const fetchLiveWeatherAndRisk = useCallback(async () => {
    const resolved = resolveFarmLocation(user, selectedFarm);
    const lat = selectedFarm?.latitude ?? resolved.latitude ?? 20.085;
    const lng = selectedFarm?.longitude ?? resolved.longitude ?? 74.11;

    const activeSpeciesKey = (user?.monitoredCrop || selectedCropId || 'cattle').toLowerCase().trim();
    const farmId = selectedFarm?.id || user?.farmId || (user?.farmerId === 'farmer123' || user?.id === SEEDED_DEMO_FARMER_ID ? SEEDED_DEMO_FARM_ID : `farm-${user?.id || 'default'}`);

    setIsWeatherLoading(true);
    setWeatherError(null);

    try {
      const liveWeatherData = await weatherService.getWeather(lat, lng, activeSpeciesKey);
      setWeather(liveWeatherData);
      setIsWeatherLoading(false);

      try {
        const risk = await riskService.getRiskForecast(activeSpeciesKey, farmId, liveWeatherData);
        setRiskForecast(risk);
      } catch (rErr) {
        console.warn('[CropContext] Dynamic livestock risk forecast notice:', rErr);
      }
    } catch (err: unknown) {
      setIsWeatherLoading(false);
      const message = err instanceof Error ? err.message : 'Weather data unavailable.';
      setWeatherError(message);
    }
  }, [selectedFarm?.id, selectedFarm?.latitude, selectedFarm?.longitude, user?.latitude, user?.longitude, user?.farmId, user?.monitoredCrop, user?.farmerId, user?.id, selectedCropId]);

  useEffect(() => {
    fetchLiveWeatherAndRisk();
  }, [fetchLiveWeatherAndRisk]);

  const refetchWeather = async () => {
    await fetchLiveWeatherAndRisk();
  };

  const addAnimalToHerd = async (payload: Parameters<typeof livestockService.addAnimal>[0]) => {
    const newAnimal = await livestockService.addAnimal(payload);
    await refreshHerd();
    return newAnimal;
  };

  const recordVaccination = async (vac: Parameters<typeof vaccinationService.addVaccineRecord>[0]) => {
    const record = await vaccinationService.addVaccineRecord(vac);
    await refreshVaccinations();
    return record;
  };

  const setFollowUpStatus = (status: FollowUpStatus | null) => {
    setFollowUpStatusState(status);
    if (status && diagnosis?.id) {
      followUpService
        .createFollowUp({
          case_id: diagnosis.id,
          status,
        })
        .catch((err: unknown) => console.warn('[CropContext] Follow-up submission fallback:', err));
    }
  };

  const performDiagnosis = async (
    speciesId: string,
    imageSource?: string | File | Blob,
    options?: CheckAnimalOptions
  ): Promise<DiagnosisResult> => {
    if (!imageSource) {
      throw new Error('No image provided. Please select or capture a photo before diagnosing.');
    }

    setIsAnalyzing(true);
    setSelectedCropId(speciesId);

    // Reassuring triage processing pause
    await new Promise((res) => setTimeout(res, 1200));

    try {
      const result = await diagnosisService.checkCrop(speciesId, imageSource, {
        farmerId: user?.farmerId || user?.id,
        farmId: user?.farmId || selectedFarm?.id,
        cropCycleId: user?.cropCycleId,
        ...options,
      });
      setDiagnosis(result);
      setIsAnalyzing(false);
      setActiveTab('diagnosis');
      return result;
    } catch (err) {
      setIsAnalyzing(false);
      console.error('[CropContext] Diagnosis execution error:', err);
      // Surface error to the caller so user sees actual failure, never a silent fake result
      throw err;
    }
  };

  const resetToHome = () => {
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CropContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCropId,
        setSelectedCropId,
        selectedAnimal,
        setSelectedAnimal,
        herd,
        vaccinations,
        refreshHerd,
        refreshVaccinations,
        addAnimalToHerd,
        recordVaccination,
        diagnosis,
        setDiagnosis,
        isAnalyzing,
        weather,
        isWeatherLoading,
        weatherError,
        refetchWeather,
        selectedFarm,
        setSelectedFarm,
        availableFarms,
        riskForecast,
        followUpStatus,
        setFollowUpStatus,
        performDiagnosis,
        resetToHome,
      }}
    >
      {children}
    </CropContext.Provider>
  );
};

export const useCrop = () => {
  const context = useContext(CropContext);
  if (!context) {
    throw new Error('useCrop must be used within a CropProvider');
  }
  return context;
};

export const useLivestock = useCrop;
export const LivestockProvider = CropProvider;
export const LivestockContext = CropContext;
