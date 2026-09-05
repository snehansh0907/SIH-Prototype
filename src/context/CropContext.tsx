import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DiagnosisResult, WeatherCondition, RiskForecast, FollowUpStatus } from '../types';
import { DEFAULT_DIAGNOSIS, MOCK_WEATHER, MOCK_RISK_FORECAST } from '../services/mockData';
import { diagnosisService } from '../services/diagnosisService';
import { weatherService } from '../services/weatherService';
import { riskService } from '../services/riskService';

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
  performDiagnosis: (cropId: string, imageSource?: string) => Promise<DiagnosisResult>;
  resetToHome: () => void;
}

const CropContext = createContext<CropContextType | undefined>(undefined);

export const CropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedCropId, setSelectedCropId] = useState<string>('tomato');
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult>(DEFAULT_DIAGNOSIS);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherCondition>(MOCK_WEATHER);
  const [riskForecast, setRiskForecast] = useState<RiskForecast>(MOCK_RISK_FORECAST);
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus | null>(null);

  // Initialize fresh weather & risk data
  useEffect(() => {
    weatherService.getWeatherContext().then(setWeather).catch(() => {});
    riskService.getRiskForecast(selectedCropId).then(setRiskForecast).catch(() => {});
  }, [selectedCropId]);

  const performDiagnosis = async (cropId: string, imageSource?: string): Promise<DiagnosisResult> => {
    setIsAnalyzing(true);
    setSelectedCropId(cropId);
    
    // Smooth reassuring animation timing for human confidence
    await new Promise(res => setTimeout(res, 2400));
    
    try {
      const result = await diagnosisService.checkCrop(cropId, imageSource);
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
