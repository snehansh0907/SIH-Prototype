import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DiagnosisResult, WeatherCondition, RiskForecast, FollowUpStatus } from '../types';
import { getDefaultDiagnosisForCrop, getDefaultRiskForecastForCrop } from '../services/mockData';
import { diagnosisService, InvalidCropImageError } from '../services/diagnosisService';
import { weatherService } from '../services/weatherService';
import { riskService } from '../services/riskService';

import { followUpService } from '../services/followUpService';
import { farmService, SEEDED_DEMO_FARM_ID, SEEDED_DEMO_FARMER_ID, type BackendFarm } from '../services/farmService';
import { resolveFarmLocation } from '../services/locationRegionService';
import { useAuth } from './AuthContext';

export type NavigationTab = 'home' | 'check' | 'diagnosis' | 'risk' | 'area' | 'expert';

interface CropContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedCropId: string;
  setSelectedCropId: (id: string) => void;
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
  performDiagnosis: (cropId: string, imageSource?: string | File | Blob) => Promise<DiagnosisResult>;
  resetToHome: () => void;
}

const CropContext = createContext<CropContextType | undefined>(undefined);

export const CropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  
  const initialCrop = (user?.monitoredCrop || 'tomato').toLowerCase().trim();
  const [selectedCropId, setSelectedCropId] = useState<string>(initialCrop);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult>(() => getDefaultDiagnosisForCrop(initialCrop));
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Weather & Farm State
  const [selectedFarm, setSelectedFarm] = useState<BackendFarm | null>(null);
  const [availableFarms, setAvailableFarms] = useState<BackendFarm[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [riskForecast, setRiskForecast] = useState<RiskForecast>(() => getDefaultRiskForecastForCrop(initialCrop));
  const [followUpStatus, setFollowUpStatusState] = useState<FollowUpStatus | null>(null);

  // Synchronize active crop with authenticated farmer's registered crop immediately
  useEffect(() => {
    if (user?.monitoredCrop) {
      const targetCrop = user.monitoredCrop.toLowerCase().trim();
      setSelectedCropId(targetCrop);
      // Immediately align default diagnosis and risk forecast with new user's active crop
      setDiagnosis((prev) => (prev.cropId === targetCrop ? prev : getDefaultDiagnosisForCrop(targetCrop)));
      setRiskForecast((prev) => (prev.cropId === targetCrop ? prev : getDefaultRiskForecastForCrop(targetCrop)));
    }
  }, [user?.farmerId, user?.id, user?.monitoredCrop]);

  // Synchronize active diagnosis with user's active farm and crop context
  useEffect(() => {
    let isCancelled = false;

    async function syncActiveDiagnosis() {
      const activeCrop = (user?.monitoredCrop || selectedCropId || 'tomato').toLowerCase().trim();
      const farmerId = user?.farmerId || user?.id;
      const farmId = selectedFarm?.id || user?.farmId;

      try {
        const resolvedDiagnosis = await diagnosisService.getDiagnosisForActiveContext({
          farmId,
          farmerId,
          cropName: activeCrop,
        });

        if (!isCancelled && resolvedDiagnosis) {
          // Strictly verify crop alignment before setting
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
  }, [user?.farmerId, user?.id, user?.monitoredCrop, user?.farmId, selectedFarm?.id, selectedCropId]);

  // Synchronize available farms and selected farm when user changes
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

      // If user has specific registered coordinates and farmName, ensure it's in the list
      let userFarm: BackendFarm | null = null;
      if (user.farmName || user.village) {
        const resolved = resolveFarmLocation(user, null);
        userFarm = {
          id: user.farmId || (farms.length > 0 ? farms[0].id : `user-farm-${user.id || 'reg'}`),
          farmer_id: farmerId,
          farm_name: user.farmName || `${user.village || 'My'} Farm`,
          latitude: resolved.latitude ?? 20.085,
          longitude: resolved.longitude ?? 74.11,
          village: user.village,
          taluka: user.taluka,
          district: user.district,
          area_acres: typeof user.areaAcres === 'number' ? user.areaAcres : parseFloat(String(user.areaAcres || '2.5')),
        };
      }

      if (!isCancelled) {
        const combined = farms.length > 0
          ? farms
          : userFarm
          ? [userFarm]
          : [];
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
    const activeCropKey = (user?.monitoredCrop || selectedCropId || 'tomato').toLowerCase().trim();
    const farmId = selectedFarm?.id || user?.farmId || (user?.farmerId === 'farmer123' || user?.id === SEEDED_DEMO_FARMER_ID ? SEEDED_DEMO_FARM_ID : `farm-${user?.id || 'default'}`);

    setIsWeatherLoading(true);
    setWeatherError(null);

    try {
      const liveWeatherData = await weatherService.getWeather(lat, lng, activeCropKey);
      setWeather(liveWeatherData);
      setIsWeatherLoading(false);

      // Re-calculate risk forecast dynamically using live weather data and active crop
      try {
        const risk = await riskService.getRiskForecast(activeCropKey, farmId, liveWeatherData);
        setRiskForecast(risk);
      } catch (rErr) {
        console.warn('[CropContext] Dynamic risk forecast calculation notice:', rErr);
      }
    } catch (err: unknown) {
      console.error('[CropContext] Failed to fetch live weather for coordinates:', lat, lng, err);
      setIsWeatherLoading(false);
      const message = err instanceof Error ? err.message : 'Weather data unavailable. Please try again.';
      setWeatherError(message);
    }
  }, [selectedFarm?.id, selectedFarm?.latitude, selectedFarm?.longitude, user?.latitude, user?.longitude, user?.farmId, user?.monitoredCrop, user?.farmerId, user?.id, selectedCropId]);

  // Trigger weather & risk refetch whenever selected farm or crop changes
  useEffect(() => {
    fetchLiveWeatherAndRisk();
  }, [fetchLiveWeatherAndRisk]);

  const refetchWeather = async () => {
    await fetchLiveWeatherAndRisk();
  };

  const setFollowUpStatus = (status: FollowUpStatus | null) => {
    setFollowUpStatusState(status);
    if (status && diagnosis?.id) {
      // Connect to backend POST /api/follow-ups
      followUpService.createFollowUp({
        case_id: diagnosis.id,
        status,
      }).catch((err: unknown) => console.warn('[CropContext] Follow up submission fallback:', err));
    }
  };

  const performDiagnosis = async (cropId: string, imageSource?: string | File | Blob): Promise<DiagnosisResult> => {
    setIsAnalyzing(true);
    setSelectedCropId(cropId);
    
    // Smooth reassuring animation timing for human confidence
    await new Promise(res => setTimeout(res, 2000));
    
    try {
      const result = await diagnosisService.checkCrop(cropId, imageSource, {
        farmerId: user?.farmerId || user?.id,
        farmId: user?.farmId || selectedFarm?.id,
        cropCycleId: user?.cropCycleId,
      });
      setDiagnosis(result);
      setIsAnalyzing(false);
      setActiveTab('diagnosis');
      return result;
    } catch (err) {
      setIsAnalyzing(false);
      if (err instanceof InvalidCropImageError || (err as Error)?.name === 'InvalidCropImageError') {
        throw err;
      }
      const fallback = getDefaultDiagnosisForCrop(cropId);
      setDiagnosis(fallback);
      setActiveTab('diagnosis');
      return fallback;
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
