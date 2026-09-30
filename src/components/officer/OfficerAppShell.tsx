import React, { useState, useEffect } from 'react';
import type { VeterinaryCaseRecord, OutbreakAlert } from '../../types';
import { veterinaryOfficerService, type RegionalDiseaseSignal, type OperationalMetrics } from '../../services/veterinaryOfficerService';
import { OfficerHeader } from './OfficerHeader';
import { OfficerBottomNav, type OfficerTab } from './OfficerBottomNav';
import { OfficerOverview } from './OfficerOverview';
import { OfficerCases } from './OfficerCases';
import { OfficerSurveillanceMap } from './OfficerSurveillanceMap';
import { OfficerAlerts } from './OfficerAlerts';
import { OfficerProfile } from './OfficerProfile';
import { VetCaseDetailModal } from '../vet/VetCaseDetailModal';

export const OfficerAppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OfficerTab>('overview');
  const [cases, setCases] = useState<VeterinaryCaseRecord[]>([]);
  const [outbreakAlerts, setOutbreakAlerts] = useState<OutbreakAlert[]>([]);
  const [diseaseSignals, setDiseaseSignals] = useState<RegionalDiseaseSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCaseForDetail, setActiveCaseForDetail] = useState<VeterinaryCaseRecord | null>(null);

  // Fetch surveillance data from veterinaryOfficerService
  const loadSurveillanceData = async () => {
    setIsLoading(true);
    try {
      const [casesRes, outbreaksRes] = await Promise.all([
        veterinaryOfficerService.getSurveillanceCases(),
        veterinaryOfficerService.getOutbreakAlerts(),
      ]);

      if (casesRes.success) setCases(casesRes.data);
      if (outbreaksRes.success) setOutbreakAlerts(outbreaksRes.data);
      setDiseaseSignals(veterinaryOfficerService.getRegionalDiseaseSignals());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSurveillanceData();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Update case in state after editing in modal
  const handleCaseUpdated = (updatedCase: VeterinaryCaseRecord) => {
    setCases((prev) =>
      prev.map((c) => (c.id === updatedCase.id || c.case_id === updatedCase.case_id ? updatedCase : c))
    );
    if (activeCaseForDetail && (activeCaseForDetail.id === updatedCase.id || activeCaseForDetail.case_id === updatedCase.case_id)) {
      setActiveCaseForDetail(updatedCase);
    }
  };

  // Metrics calculation
  const metrics: OperationalMetrics = veterinaryOfficerService.calculateMetrics(cases, outbreakAlerts);

  return (
    <div className="min-h-screen bg-[#ECE6DA] flex flex-col items-center justify-start antialiased selection:bg-forest-200 relative overflow-x-hidden">
      {/* Ambient background glow orbs for evaluator view */}
      <div className="hidden lg:block fixed -top-32 -left-32 w-96 h-96 rounded-full bg-forest-400/15 blur-3xl pointer-events-none" />
      <div className="hidden lg:block fixed top-1/2 -right-32 w-96 h-96 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />
      <div className="hidden lg:block fixed -bottom-32 left-1/3 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      {/* Main Smartphone Shell */}
      <div className="w-full max-w-md min-h-screen bg-[#F7F6F0] shadow-2xl flex flex-col relative border-x border-stone-300/50 min-w-0">
        {/* Top Mobile Header */}
        <OfficerHeader isLoading={isLoading} onRefresh={loadSurveillanceData} />

        {/* Main Content Area with Bottom Nav Clearance */}
        <main
          className="flex-1 w-full px-3.5 sm:px-4 pt-3.5 min-w-0"
          style={{ paddingBottom: 'calc(var(--bottom-nav-height, 4.25rem) + env(safe-area-inset-bottom, 0px) + 2.5rem)' }}
        >
          {activeTab === 'overview' && (
            <OfficerOverview
              cases={cases}
              metrics={metrics}
              diseaseSignals={diseaseSignals}
              onSelectCase={(c) => setActiveCaseForDetail(c)}
              setActiveTab={setActiveTab}
              onFilterStatus={(status) => setSelectedStatusTab(status)}
            />
          )}

          {activeTab === 'cases' && (
            <OfficerCases
              cases={cases}
              isLoading={isLoading}
              metrics={metrics}
              selectedStatusTab={selectedStatusTab}
              setSelectedStatusTab={setSelectedStatusTab}
              selectedSpecies={selectedSpecies}
              setSelectedSpecies={setSelectedSpecies}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectCase={(c) => setActiveCaseForDetail(c)}
            />
          )}

          {activeTab === 'map' && (
            <OfficerSurveillanceMap
              cases={cases}
              outbreakAlerts={outbreakAlerts}
              onSelectCase={(c) => setActiveCaseForDetail(c)}
            />
          )}

          {activeTab === 'alerts' && (
            <OfficerAlerts
              outbreakAlerts={outbreakAlerts}
              setActiveTab={setActiveTab}
              setSearchQuery={setSearchQuery}
              onFilterStatus={(status) => setSelectedStatusTab(status)}
            />
          )}

          {activeTab === 'profile' && <OfficerProfile />}
        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <OfficerBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          metrics={metrics}
        />
      </div>

      {/* Case Detail Modal */}
      {activeCaseForDetail && (
        <VetCaseDetailModal
          caseData={activeCaseForDetail}
          onClose={() => setActiveCaseForDetail(null)}
          onStatusUpdated={handleCaseUpdated}
        />
      )}
    </div>
  );
};
