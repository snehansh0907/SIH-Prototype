import React, { useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { CropProvider, useCrop } from './context/CropContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MobileContainer } from './components/layout/MobileContainer';
import { FarmerHomeScreen } from './components/home/FarmerHomeScreen';
import { ImageUploader } from './components/check-crop/ImageUploader';
import { DiagnosisResultView } from './components/diagnosis/DiagnosisResultView';
import { RiskForecastView } from './components/risk/RiskForecastView';
import { AreaHotspotView } from './components/area/AreaHotspotView';
import { ExpertConsultView } from './components/expert/ExpertConsultView';
import { LoginScreen } from './components/auth/LoginScreen';
import { FarmerLoginModal } from './components/auth/FarmerLoginModal';

const AppContent: React.FC = () => {
  const { activeTab } = useCrop();
  const { authState } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, authState]);

  if (authState === 'unauthenticated') {
    return <LoginScreen />;
  }

  return (
    <>
      <MobileContainer>
        {activeTab === 'home' && <FarmerHomeScreen />}
        {activeTab === 'check' && <ImageUploader />}
        {activeTab === 'diagnosis' && <DiagnosisResultView />}
        {activeTab === 'risk' && <RiskForecastView />}
        {activeTab === 'area' && <AreaHotspotView />}
        {activeTab === 'expert' && <ExpertConsultView />}
      </MobileContainer>

      {/* Global Farmer Login Restriction Modal for Demo Mode */}
      <FarmerLoginModal />
    </>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CropProvider>
          <AppContent />
        </CropProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
