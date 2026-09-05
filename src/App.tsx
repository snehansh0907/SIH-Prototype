import React, { useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { CropProvider, useCrop } from './context/CropContext';
import { MobileContainer } from './components/layout/MobileContainer';
import { FarmerHomeScreen } from './components/home/FarmerHomeScreen';
import { ImageUploader } from './components/check-crop/ImageUploader';
import { DiagnosisResultView } from './components/diagnosis/DiagnosisResultView';
import { RiskForecastView } from './components/risk/RiskForecastView';
import { AreaHotspotView } from './components/area/AreaHotspotView';
import { ExpertConsultView } from './components/expert/ExpertConsultView';

const AppContent: React.FC = () => {
  const { activeTab } = useCrop();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <MobileContainer>
      {activeTab === 'home' && <FarmerHomeScreen />}
      {activeTab === 'check' && <ImageUploader />}
      {activeTab === 'diagnosis' && <DiagnosisResultView />}
      {activeTab === 'risk' && <RiskForecastView />}
      {activeTab === 'area' && <AreaHotspotView />}
      {activeTab === 'expert' && <ExpertConsultView />}
    </MobileContainer>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <CropProvider>
        <AppContent />
      </CropProvider>
    </LanguageProvider>
  );
}

export default App;
