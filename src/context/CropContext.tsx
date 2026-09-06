import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DiagnosisResult, WeatherCondition, RiskForecast, FollowUpStatus } from '../types';
import { DEFAULT_DIAGNOSIS, MOCK_WEATHER, MOCK_RISK_FORECAST } from '../services/mockData';
import { diagnosisService } from '../services/diagnosisService';
import { weatherService } from '../services/weatherService';
import { riskService } from '../services/riskService';

import { followUpService } from '../services/followUpService';
import { SEEDED_DEMO_FARM_ID } from '../services/farmService';
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
  weather: WeatherCondition;
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
  const [weather, setWeather] = useState<WeatherCondition>(MOCK_WEATHER);
  const [riskForecast, setRiskForecast] = useState<RiskForecast>(MOCK_RISK_FORECAST);
  const [followUpStatus, setFollowUpStatusState] = useState<FollowUpStatus | null>(null);

  // Synchronize active crop with authenticated farmer's registered crop
  useEffect(() => {
    if (user?.monitoredCrop) {
      setSelectedCropId(user.monitoredCrop.toLowerCase());
    }
  }, [user?.farmerId, user?.monitoredCrop]);

  // Initialize fresh weather & risk data based on active user's farm
  useEffect(() => {
    weatherService.getWeatherContext().then(setWeather).catch(() => {});
    const targetFarmId = user?.farmId || SEEDED_DEMO_FARM_ID;
    riskService.getRiskForecast(selectedCropId, targetFarmId).then(setRiskForecast).catch(() => {});
  }, [selectedCropId, user?.farmId]);

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
