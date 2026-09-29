import React, { useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { CropProvider, useCrop } from './context/CropContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MobileContainer } from './components/layout/MobileContainer';
import { FarmerHomeScreen } from './components/home/FarmerHomeScreen';
import { ImageUploader } from './components/check-crop/ImageUploader';
import { DiagnosisResultView } from './components/diagnosis/DiagnosisResultView';
import { HerdManagementView } from './components/herd/HerdManagementView';
import { RiskForecastView } from './components/risk/RiskForecastView';
import { AreaHotspotView } from './components/area/AreaHotspotView';
import { ExpertConsultView } from './components/expert/ExpertConsultView';
import { LoginScreen } from './components/auth/LoginScreen';
import { FarmerLoginModal } from './components/auth/FarmerLoginModal';
import { VetOfficialDashboard } from './components/vet/VetOfficialDashboard';

const AppContent: React.FC = () => {
  const { activeTab } = useCrop();
  const { authState, isVetOfficial } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, authState]);

  if (authState === 'unauthenticated') {
    return <LoginScreen />;
  }

  // Dedicated Veterinary Official Surveillance Portal
  if (isVetOfficial || authState === 'vet_official') {
    return <VetOfficialDashboard />;
  }

  return (
    <>
      <MobileContainer>
        {activeTab === 'home' && <FarmerHomeScreen />}
        {activeTab === 'check' && <ImageUploader />}
        {activeTab === 'diagnosis' && <DiagnosisResultView />}
        {(activeTab === 'herd' || activeTab === 'vaccination' || activeTab === 'history') && <HerdManagementView />}
        {activeTab === 'risk' && <RiskForecastView />}
        {activeTab === 'area' && <AreaHotspotView />}
        {activeTab === 'expert' && <ExpertConsultView />}
      </MobileContainer>

      {/* Global Livestock Owner Login Restriction Modal for Demo Mode */}
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
