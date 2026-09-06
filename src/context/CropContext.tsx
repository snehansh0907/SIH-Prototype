import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DiagnosisResult, WeatherCondition, RiskForecast, FollowUpStatus } from '../types';
import { DEFAULT_DIAGNOSIS, MOCK_RISK_FORECAST } from '../services/mockData';
import { diagnosisService } from '../services/diagnosisService';
import { weatherService } from '../services/weatherService';
import { riskService } from '../services/riskService';

import { followUpService } from '../services/followUpService';
import { farmService, SEEDED_DEMO_FARM_ID, type BackendFarm } from '../services/farmService';
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
  const [selectedCropId, setSelectedCropId] = useState<string>(
    user?.monitoredCrop ? user.monitoredCrop.toLowerCase() : 'tomato'
  );
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult>(DEFAULT_DIAGNOSIS);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Weather & Farm State
  const [selectedFarm, setSelectedFarm] = useState<BackendFarm | null>(null);
  const [availableFarms, setAvailableFarms] = useState<BackendFarm[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [riskForecast, setRiskForecast] = useState<RiskForecast>(MOCK_RISK_FORECAST);
  const [followUpStatus, setFollowUpStatusState] = useState<FollowUpStatus | null>(null);

  // Synchronize active crop with authenticated farmer's registered crop
  useEffect(() => {
    if (user?.monitoredCrop) {
      setSelectedCropId(user.monitoredCrop.toLowerCase());
    }
  }, [user?.farmerId, user?.monitoredCrop]);

  // Synchronize available farms and selected farm when user changes
  useEffect(() => {
    let isCancelled = false;

    async function loadFarms() {
      const farmerId = user?.farmerId || user?.id || SEEDED_DEMO_FARM_ID;
      const farms = await farmService.getFarmsByFarmer(farmerId);

      // If user has specific registered coordinates and farmName, ensure it's in the list
      let userFarm: BackendFarm | null = null;
      if (user?.latitude && user?.longitude) {
        userFarm = {
          id: user.farmId || `user-farm-${user.id || 'reg'}`,
          farmer_id: farmerId,
          farm_name: user.farmName || `${user.village || 'My'} Farm`,
          latitude: user.latitude,
          longitude: user.longitude,
          village: user.village,
          taluka: user.taluka,
          district: user.district,
          area_acres: typeof user.areaAcres === 'number' ? user.areaAcres : parseFloat(String(user.areaAcres || '2.5')),
        };
      }

      if (!isCancelled) {
        const combined = userFarm
          ? [userFarm, ...farms.filter((f) => f.id !== userFarm!.id)]
          : farms;
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
    const lat = selectedFarm?.latitude ?? user?.latitude ?? 20.156556;
    const lng = selectedFarm?.longitude ?? user?.longitude ?? 74.117339;
    const farmId = selectedFarm?.id || user?.farmId || SEEDED_DEMO_FARM_ID;

    setIsWeatherLoading(true);
    setWeatherError(null);

    try {
      const liveWeatherData = await weatherService.getWeather(lat, lng);
      setWeather(liveWeatherData);
      setIsWeatherLoading(false);

      // Re-calculate risk forecast dynamically using live weather data
      try {
        const risk = await riskService.getRiskForecast(selectedCropId, farmId, liveWeatherData);
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
  }, [selectedFarm?.id, selectedFarm?.latitude, selectedFarm?.longitude, user?.latitude, user?.longitude, user?.farmId, selectedCropId]);

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
      }).catch((err) => console.warn('[CropContext] Follow up submission fallback:', err));
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
        farmId: user?.farmId,
        cropCycleId: user?.cropCycleId,
      });
      setDiagnosis(result);
      setIsAnalyzing(false);
      setActiveTab('diagnosis');
      return result;
    } catch {
      setIsAnalyzing(false);
      setDiagnosis(DEFAULT_DIAGNOSIS);
      setActiveTab('diagnosis');
      return DEFAULT_DIAGNOSIS;
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
