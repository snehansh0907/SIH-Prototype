import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Search,
  RefreshCw,
  LogOut,
  Globe,
  MapPin,
  Building2,
  ChevronRight,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import type { VeterinaryCaseRecord, Language } from '../../types';
import { VetCaseDetailModal } from './VetCaseDetailModal';

export const VetOfficialDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [cases, setCases] = useState<VeterinaryCaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCaseForDetail, setActiveCaseForDetail] = useState<VeterinaryCaseRecord | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Fetch all regional cases from backend
  const fetchRegionalCases = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient<{ success: boolean; data: VeterinaryCaseRecord[]; count: number }>('/diagnosis/cases', {
        method: 'GET',
        timeout: 8000,
      });

      if (res.success && Array.isArray(res.data)) {
        setCases(res.data);
      }
    } catch (err) {
      console.warn('[VetOfficialDashboard] Fallback to locally stored cases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegionalCases();
  }, []);

  // Update a case in local state after modal edits
  const handleCaseUpdated = (updatedCase: VeterinaryCaseRecord) => {
    setCases((prev) =>
      prev.map((c) => (c.id === updatedCase.id || c.case_id === updatedCase.case_id ? updatedCase : c))
    );
    if (activeCaseForDetail && (activeCaseForDetail.id === updatedCase.id || activeCaseForDetail.case_id === updatedCase.case_id)) {
      setActiveCaseForDetail(updatedCase);
    }
  };

  // Metrics computation
  const totalCount = cases.length;
  const newCount = cases.filter((c) => (c.status || 'New') === 'New').length;
  const reviewCount = cases.filter((c) => c.status === 'Under Review').length;
  const sampleCount = cases.filter((c) => c.status === 'Sample Collected').length;
  const escalatedCount = cases.filter((c) => c.status === 'Escalated').length;
  const resolvedCount = cases.filter((c) => c.status === 'Resolved').length;
  const mortalityCount = cases.filter((c) => c.report_type === 'mortality').length;
  const outbreakCount = cases.filter((c) => c.is_outbreak_flagged || c.status === 'Escalated').length;

  // Filter cases based on active tab, search, and species
  const filteredCases = cases.filter((item) => {
    const statusMatch =
      selectedStatusTab === 'all'
        ? true
        : selectedStatusTab === 'mortality'
        ? item.report_type === 'mortality'
        : (item.status || 'New').toLowerCase() === selectedStatusTab.toLowerCase();

    const speciesMatch =
      selectedSpecies === 'all' ? true : (item.species || '').toLowerCase() === selectedSpecies.toLowerCase();

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Govt. Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Official Branding */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg border border-amber-300">
              🦁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Govt. of Maharashtra
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Dept. of Animal Husbandry • SIH26128
                </span>
              </div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-display">
                <span>Pashu Sarthak</span>
                <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800">
                  Veterinary Surveillance Portal
                </span>
              </h1>
            </div>
          </div>

          {/* Officer Profile & Controls */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'en' ? 'EN' : language === 'hi' ? 'हिन्दी' : 'मराठी'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिन्दी' },
                    { code: 'mr', label: 'मराठी' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code as Language);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs font-bold flex items-center justify-between ${
                        language === l.code ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{l.label}</span>
                      {language === l.code && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Officer Details Chip */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-black text-white">{user?.name || 'Dr. Rajesh Kadam'}</span>
              <span className="text-[10px] text-indigo-300 font-semibold">
                {user?.designation || 'Taluka Veterinary Officer, Niphad'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchRegionalCases}
              disabled={isLoading}
              title="Refresh Surveillance Data"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              title="Logout Session"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/80 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Jurisdiction & Priority Notice Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 rounded-3xl p-5 border border-indigo-900/70 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Assigned Surveillance Jurisdiction</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Niphad Taluka Central Monitoring Unit (Nashik District)
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              134 Gram Panchayats • 4 Primary Veterinary Dispensaries • Real-time Triage & Lab Escalation System
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-2xl bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>{outbreakCount} Outbreak Warnings Flagged</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-amber-950/80 border border-amber-700/80 text-amber-200 text-xs font-bold flex items-center gap-2">
              <span>🪦 {mortalityCount} Mortalities</span>
            </div>
          </div>
        </div>

        {/* Metric KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div
            onClick={() => setSelectedStatusTab('all')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusTab === 'all'
                ? 'bg-indigo-950/90 border-indigo-500 shadow-lg scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Cases</div>
            <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium">All Reports</div>
          </div>

          <div
            onClick={() => setSelectedStatusTab('new')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusTab === 'new'
                ? 'bg-blue-950/90 border-blue-500 shadow-lg scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400">New</div>
            <div className="text-2xl font-black text-blue-300 mt-1">{newCount}</div>
            <div className="text-[10px] text-blue-400/80 mt-0.5 font-medium">Pending Triage</div>
          </div>

          <div
            onClick={() => setSelectedStatusTab('under review')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusTab === 'under review'
                ? 'bg-amber-950/90 border-amber-500 shadow-lg scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400">Under Review</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{reviewCount}</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5 font-medium">Investigating</div>
          </div>

          <div
            onClick={() => setSelectedStatusTab('sample collected')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusTab === 'sample collected'
                ? 'bg-purple-950/90 border-purple-500 shadow-lg scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-purple-400">Sample Taken</div>
            <div className="text-2xl font-black text-purple-300 mt-1">{sampleCount}</div>
            <div className="text-[10px] text-purple-400/80 mt-0.5 font-medium">Field Visits Done</div>
          </div>

          <div
            onClick={() => setSelectedStatusTab('escalated')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusTab === 'escalated'
                ? 'bg-rose-950/90 border-rose-500 shadow-lg scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-rose-400">Escalated</div>
            <div className="text-2xl font-black text-rose-300 mt-1">{escalatedCount}</div>
            <div className="text-[10px] text-rose-400/80 mt-0.5 font-medium">Lab Referral</div>
          </div>

          <div
            onClick={() => setSelectedStatusTab('resolved')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusTab === 'resolved'
                ? 'bg-emerald-950/90 border-emerald-500 shadow-lg scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">Resolved</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{resolvedCount}</div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">Contained</div>
          </div>

          <div
            onClick={() => setSelectedStatusTab('mortality')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              selectedStatusTab === 'mortality'
                ? 'bg-amber-950/90 border-amber-400 shadow-lg scale-102'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">Mortality</div>
            <div className="text-2xl font-black text-amber-200 mt-1">{mortalityCount}</div>
            <div className="text-[10px] text-amber-400/80 mt-0.5 font-medium">Death Reports</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { key: 'all', label: 'All Cases' },
              { key: 'new', label: 'New' },
              { key: 'under review', label: 'Under Review' },
              { key: 'sample collected', label: 'Sample Taken' },
              { key: 'escalated', label: 'Escalated' },
              { key: 'resolved', label: 'Resolved' },
              { key: 'mortality', label: 'Mortality Reports' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatusTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatusTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Species Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search village, farmer, disease..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Species</option>
              <option value="cattle">Cattle (Cow)</option>
              <option value="buffalo">Buffalo</option>
              <option value="goat">Goat</option>
              <option value="sheep">Sheep</option>
              <option value="poultry">Poultry</option>
            </select>
          </div>
        </div>

        {/* Case Reports List Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Recent Case Submissions</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-bold">
                  {filteredCases.length} Results
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any case to review symptoms, advance status, attach lab samples, or refer to diagnostic labs.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-indigo-500" />
              <p className="text-sm font-bold">Loading regional surveillance reports...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="text-base font-extrabold text-white">No cases match the current filter</p>
              <p className="text-xs text-slate-500 mt-1">Try selecting a different status tab or species.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredCases.map((caseItem) => {
                const isMort = caseItem.report_type === 'mortality';
                const status = caseItem.status || 'New';

                let statusBadgeColor = 'bg-blue-900/80 text-blue-200 border-blue-700';
                if (status === 'Under Review') statusBadgeColor = 'bg-amber-900/80 text-amber-200 border-amber-700';
                if (status === 'Sample Collected') statusBadgeColor = 'bg-purple-900/80 text-purple-200 border-purple-700';
                if (status === 'Escalated') statusBadgeColor = 'bg-rose-900/80 text-rose-200 border-rose-700';
                if (status === 'Resolved') statusBadgeColor = 'bg-emerald-900/80 text-emerald-200 border-emerald-700';

                return (
                  <div
                    key={caseItem.id || caseItem.case_id}
                    onClick={() => setActiveCaseForDetail(caseItem)}
                    className="p-4 sm:p-5 hover:bg-slate-800/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Thumbnail / Indicator */}
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                        {caseItem.image_url ? (
                          <img
                            src={caseItem.image_url}
                            alt="Case"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <span className="text-xl">{isMort ? '🪦' : '🐄'}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{(caseItem.id || caseItem.case_id || '').slice(0, 8)}
                          </span>

                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${statusBadgeColor}`}
                          >
                            {status}
                          </span>

                          {caseItem.is_outbreak_flagged && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                              Outbreak Flagged
                            </span>
                          )}

                          {isMort && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-amber-500/40">
                              Mortality
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                          <span>{caseItem.disease_name || caseItem.suspected_cause || 'Suspected Health Issue'}</span>
                          <span className="text-xs text-slate-400 font-normal">
                            • {caseItem.species || 'Cattle'}
                          </span>
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-300">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            {caseItem.village || 'Niphad'}, {caseItem.taluka || 'Niphad'}
                          </span>
                          <span>•</span>
                          <span>Owner: {caseItem.farmer_name || 'Livestock Owner'}</span>
                          <span>•</span>
                          <span>
                            {new Date(caseItem.created_at || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      {caseItem.sample_id && (
                        <div className="text-[10px] font-mono bg-purple-950 text-purple-200 border border-purple-800 px-2 py-1 rounded-lg">
                          🧪 {caseItem.sample_id}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCaseForDetail(caseItem);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md group-hover:translate-x-0.5 cursor-pointer"
                      >
                        <span>Review File</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Case Detail & Status Update Modal */}
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
