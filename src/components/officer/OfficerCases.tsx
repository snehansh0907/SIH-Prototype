import React from 'react';
import { Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { VeterinaryCaseRecord } from '../../types';
import type { OperationalMetrics } from '../../services/veterinaryOfficerService';
import { OfficerCaseCard } from './OfficerCaseCard';
import { useLanguage } from '../../context/LanguageContext';

interface OfficerCasesProps {
  cases: VeterinaryCaseRecord[];
  isLoading: boolean;
  metrics: OperationalMetrics;
  selectedStatusTab: string;
  setSelectedStatusTab: (status: string) => void;
  selectedSpecies: string;
  setSelectedSpecies: (species: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectCase: (c: VeterinaryCaseRecord) => void;
}

export const OfficerCases: React.FC<OfficerCasesProps> = ({
  cases,
  isLoading,
  metrics,
  selectedStatusTab,
  setSelectedStatusTab,
  selectedSpecies,
  setSelectedSpecies,
  searchQuery,
  setSearchQuery,
  onSelectCase,
}) => {
  const { language } = useLanguage();

  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  const filteredCases = cases.filter((item) => {
    const statusMatch =
      selectedStatusTab === 'all'
        ? true
        : selectedStatusTab === 'mortality'
        ? item.report_type === 'mortality'
        : (item.status || 'New').toLowerCase() === selectedStatusTab.toLowerCase();

    const speciesMatch =
      selectedSpecies === 'all' ? true : (item.species || '').toLowerCase().includes(selectedSpecies.toLowerCase());

    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      !query ||
      (item.farmer_name || '').toLowerCase().includes(query) ||
      (item.village || '').toLowerCase().includes(query) ||
      (item.taluka || '').toLowerCase().includes(query) ||
      (item.disease_name || '').toLowerCase().includes(query) ||
      (item.suspected_cause || '').toLowerCase().includes(query) ||
      (item.id || '').toLowerCase().includes(query);

    return statusMatch && speciesMatch && searchMatch;
  });

  const statusTabs = [
    { key: 'all', label: isMarathi ? 'सर्व' : isHindi ? 'सभी' : 'All', count: cases.length },
    { key: 'new', label: isMarathi ? 'नवीन' : isHindi ? 'नए' : 'New', count: metrics.openCases },
    { key: 'under review', label: isMarathi ? 'समीक्षा' : isHindi ? 'समीक्षा' : 'Review', count: metrics.underReview },
    { key: 'sample collected', label: isMarathi ? 'नमुने' : isHindi ? 'नमूने' : 'Sample', count: metrics.sampleTaken },
    { key: 'escalated', label: isMarathi ? 'रेफरल' : isHindi ? 'रेफरल' : 'Escalated', count: metrics.escalated },
    { key: 'resolved', label: isMarathi ? 'निकाली' : isHindi ? 'समाधान' : 'Resolved', count: metrics.resolved },
    { key: 'mortality', label: isMarathi ? 'मृत्यू' : isHindi ? 'मृत्यु' : 'Mortality', count: metrics.mortality },
  ];

  return (
    <div className="space-y-3.5 animate-fadeIn min-w-0">
      {/* Header & Filter Controls Card */}
      <div className="bg-white/95 p-3.5 rounded-3xl border border-stone-200/90 shadow-glass-sm space-y-3 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 font-display">
              {isMarathi ? 'निगरानी केस नोंदवही' : isHindi ? 'निगरानी केस लेजर' : 'Surveillance Case Ledger'}
            </h2>
            <p className="text-[11px] text-stone-500 font-medium">
              {isMarathi
                ? 'स्थिती, शेतकरी किंवा रोगाप्रमाणे शोधा'
                : isHindi
                ? 'स्थिति, किसान या बीमारी के अनुसार खोजें'
                : 'Filter by status, search by farmer, village or disease'}
            </p>
          </div>

          <div className="text-[10px] font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200 shrink-0">
            {filteredCases.length} {isMarathi ? 'नोंदी' : isHindi ? 'रिकॉर्ड' : 'Cases'}
          </div>
        </div>

        {/* Status Filter Tabs (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {statusTabs.map((tab) => {
            const isActive = selectedStatusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatusTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-forest-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-[#F6BD28] text-[#174D35]' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar & Species Dropdown */}
        <div className="space-y-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isMarathi
                  ? 'गाव, शेतकरी, रोग किंवा केस आयडी शोधा...'
                  : isHindi
                  ? 'गाँव, किसान, बीमारी या केस आईडी खोजें...'
                  : 'Search village, farmer, disease or case ID...'
              }
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-forest-600 focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-forest-600 cursor-pointer shadow-xs"
            >
              <option value="all">{isMarathi ? 'सर्व प्राणी प्रजाती' : isHindi ? 'सभी पशु प्रजातियां' : 'All Species'}</option>
              <option value="cattle">{isMarathi ? 'गाय (Cattle / Cow)' : isHindi ? 'गाय (Cow)' : 'Cattle / Cow (गाय)'}</option>
              <option value="buffalo">{isMarathi ? 'म्हैस (Buffalo)' : isHindi ? 'भैंस (Buffalo)' : 'Buffalo (म्हैस)'}</option>
              <option value="goat">{isMarathi ? 'शेळी (Goat)' : isHindi ? 'बकरी (Goat)' : 'Goat (शेळी)'}</option>
              <option value="sheep">{isMarathi ? 'मेंढी (Sheep)' : isHindi ? 'भेड़ (Sheep)' : 'Sheep (मेंढी)'}</option>
              <option value="poultry">{isMarathi ? 'कुक्कुटपालन (Poultry)' : isHindi ? 'मुर्गीपालन (Poultry)' : 'Poultry (कुक्कुटपालन)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Cards List */}
      {isLoading ? (
        <div className="p-8 text-center text-stone-500 bg-white/80 rounded-3xl border border-stone-200">
          <RefreshCw className="w-7 h-7 mx-auto mb-2 animate-spin text-forest-700" />
          <p className="text-xs font-bold">
            {isMarathi ? 'नोंदवही लोड होत आहे...' : isHindi ? 'लेजर लोड हो रहा है...' : 'Loading regional cases ledger...'}
          </p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-8 text-center text-stone-500 bg-white/80 rounded-3xl border border-stone-200">
          <CheckCircle2 className="w-9 h-9 mx-auto mb-2 text-emerald-600 opacity-60" />
          <p className="text-xs sm:text-sm font-extrabold text-stone-800">
            {isMarathi ? 'कोणतीही केस आढळली नाही' : isHindi ? 'कोई मामला नहीं मिला' : 'No cases match the selected filter'}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            {isMarathi ? 'फिल्टर बदला किंवा शोध क्वेरी साफ करा.' : isHindi ? 'फ़िल्टर बदलें या खोज साफ़ करें।' : 'Try resetting filters or clearing search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCases.map((c) => (
            <OfficerCaseCard
              key={c.id || c.case_id}
              caseRecord={c}
              onSelect={onSelectCase}
            />
          ))}
        </div>
      )}
    </div>
  );
};
