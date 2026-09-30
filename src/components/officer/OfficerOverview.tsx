import React from 'react';
import { ClipboardList, Map as MapIcon, ChevronRight, ShieldAlert } from 'lucide-react';
import type { VeterinaryCaseRecord } from '../../types';
import type { OperationalMetrics, RegionalDiseaseSignal } from '../../services/veterinaryOfficerService';
import { OfficerSummaryCards } from './OfficerSummaryCards';
import { OfficerCaseCard } from './OfficerCaseCard';
import { useLanguage } from '../../context/LanguageContext';
import type { OfficerTab } from './OfficerBottomNav';

interface OfficerOverviewProps {
  cases: VeterinaryCaseRecord[];
  metrics: OperationalMetrics;
  diseaseSignals: RegionalDiseaseSignal[];
  onSelectCase: (c: VeterinaryCaseRecord) => void;
  setActiveTab: (tab: OfficerTab) => void;
  onFilterStatus: (status: string) => void;
}

export const OfficerOverview: React.FC<OfficerOverviewProps> = ({
  cases,
  metrics,
  diseaseSignals,
  onSelectCase,
  setActiveTab,
  onFilterStatus,
}) => {
  const { language } = useLanguage();

  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  // Urgent cases for "Needs Attention" queue on Overview
  const needsAttentionCases = cases
    .filter((c) => c.status === 'New' || c.status === 'Under Review' || c.severity === 'high' || c.is_outbreak_flagged)
    .slice(0, 4);

  return (
    <div className="space-y-4 animate-fadeIn min-w-0">
      {/* Top Greeting & Jurisdiction Header Card */}
      <div className="bg-white/95 p-4 rounded-3xl border border-stone-200/90 shadow-glass-sm flex flex-col gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200 font-display">
              {isMarathi ? 'निफाड तालुका नियंत्रण कक्ष' : isHindi ? 'निफाड तालुका नियंत्रण इकाई' : 'Niphad Taluka Central Unit'}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">Nashik District</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight font-display">
            {isMarathi ? 'शुभ प्रभात, डॉ. राजेश 👋' : isHindi ? 'सुप्रभात, डॉ. राजेश 👋' : 'Good morning, Dr. Rajesh 👋'}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5 leading-relaxed">
            {isMarathi
              ? '१३४ ग्रामपंचायती • ४ प्राथमिक पशुवैद्यकीय दवाखाने सक्रिय पाळतीखाली'
              : isHindi
              ? '134 ग्राम पंचायतें • 4 प्राथमिक पशु चिकित्सालय सक्रिय निगरानी में'
              : '134 Gram Panchayats • 4 Primary Veterinary Dispensaries under active surveillance'}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={() => {
              onFilterStatus('all');
              setActiveTab('cases');
            }}
            className="flex-1 py-2 px-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ClipboardList className="w-3.5 h-3.5 text-[#F6BD28]" />
            <span>{isMarathi ? 'केसेस तपासा' : isHindi ? 'मामले देखें' : 'Review Cases'} ({metrics.openCases})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className="flex-1 py-2 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <MapIcon className="w-3.5 h-3.5 text-forest-700" />
            <span>{isMarathi ? 'परिसर नकाशा' : isHindi ? 'क्षेत्र नक्शा' : 'Area Map'}</span>
          </button>
        </div>
      </div>

      {/* Operational Summary (2x2 Grid) */}
      <OfficerSummaryCards
        metrics={metrics}
        onSelectStatus={(statusKey) => {
          onFilterStatus(statusKey);
          setActiveTab('cases');
        }}
      />

      {/* Priority Needs Attention Queue */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <h3 className="text-xs sm:text-sm font-black text-stone-900 font-display">
              {isMarathi ? 'त्वरित लक्ष द्या (प्राधान्य)' : isHindi ? 'तत्काल ध्यान दें (प्राथमिकता)' : 'Needs Attention (Priority Triage)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              onFilterStatus('all');
              setActiveTab('cases');
            }}
            className="text-[11px] font-bold text-forest-800 hover:text-forest-950 flex items-center gap-0.5 cursor-pointer"
          >
            <span>{isMarathi ? 'सर्व पहा' : isHindi ? 'सभी देखें' : 'View All'} ({cases.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {needsAttentionCases.map((c) => (
            <OfficerCaseCard
              key={c.id || c.case_id}
              caseRecord={c}
              onSelect={onSelectCase}
            />
          ))}
        </div>
      </div>

      {/* Regional Livestock Health & Environmental Signals */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black text-stone-900 font-display flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-forest-700 shrink-0" />
            <span>{isMarathi ? 'प्रादेशिक आरोग्य संकेत' : isHindi ? 'क्षेत्रीय स्वास्थ्य संकेत' : 'Regional Surveillance Signals'}</span>
          </h3>
          <span className="text-[9px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200">
            Niphad Ring
          </span>
        </div>

        <div className="space-y-2.5">
          {diseaseSignals.map((sig) => (
            <div
              key={sig.id}
              className="bg-white/95 p-3.5 rounded-2xl border border-stone-200/90 shadow-glass-sm flex flex-col gap-2 min-w-0"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${
                    sig.riskLevel === 'high'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {sig.riskLevel} Risk
                </span>
                <span className="text-[10px] text-stone-500 font-semibold">{sig.location}</span>
                <span className="text-[10px] text-stone-400">• {sig.timestamp}</span>
              </div>

              <h4 className="text-xs sm:text-sm font-black text-stone-900 font-display leading-snug">
                {isMarathi ? sig.titleMr : isHindi ? sig.titleHi : sig.title}
              </h4>

              <p className="text-xs text-stone-600 leading-relaxed">
                {isMarathi ? sig.descriptionMr : isHindi ? sig.descriptionHi : sig.description}
              </p>

              {sig.actionRequired && (
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-700 font-medium flex items-start gap-1.5">
                  <strong className="text-forest-900 shrink-0">Directive:</strong>
                  <span className="leading-tight">{sig.actionRequired}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (sig.type === 'cluster') setActiveTab('alerts');
                  else {
                    onFilterStatus('all');
                    setActiveTab('cases');
                  }
                }}
                className="self-end px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] transition-all cursor-pointer"
              >
                Inspect &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
