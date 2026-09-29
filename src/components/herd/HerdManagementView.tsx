import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Syringe,
  Search,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import type { LivestockAnimal } from '../../types';
import { AddAnimalModal } from './AddAnimalModal';
import { AddVaccinationModal } from './AddVaccinationModal';
import { AnimalDetailModal } from './AnimalDetailModal';

export const HerdManagementView: React.FC = () => {
  const { language, t } = useLanguage();
  const { herd, vaccinations, resetToHome, setActiveTab, setSelectedAnimal } = useCrop();
  const { requireFarmerAccess } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'animals' | 'vaccines' | 'history'>('animals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('all');

  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [isAddVaccineOpen, setIsAddVaccineOpen] = useState(false);
  const [inspectingAnimal, setInspectingAnimal] = useState<LivestockAnimal | null>(null);

  // Filter animals
  const filteredHerd = herd.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies =
      selectedSpeciesFilter === 'all' || animal.species.toLowerCase() === selectedSpeciesFilter.toLowerCase();
    return matchesSearch && matchesSpecies;
  });

  const getSpeciesEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'cattle':
        return '🐄';
      case 'buffalo':
        return '🐃';
      case 'goat':
        return '🐐';
      case 'sheep':
        return '🐑';
      case 'poultry':
        return '🐔';
      default:
        return '🐾';
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
            {language === 'mr' ? '🟢 निरोगी' : language === 'hi' ? '🟢 स्वस्थ' : '🟢 Healthy'}
          </span>
        );
      case 'treatment':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 animate-pulse">
            {language === 'mr' ? '🟡 उपचाराधीन' : language === 'hi' ? '🟡 उपचाराधीन' : '🟡 Under Care'}
          </span>
        );
      case 'recovered':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-300">
            {language === 'mr' ? '🔵 रोगमुक्त' : language === 'hi' ? '🔵 रोगमुक्त' : '🔵 Recovered'}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  const getVaccineStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            {language === 'mr' ? 'पूर्ण' : language === 'hi' ? 'पूर्ण' : 'Active'}
          </span>
        );
      case 'due_soon':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 animate-pulse">
            {language === 'mr' ? 'आगामी (लवकरच)' : language === 'hi' ? 'आगामी देय' : 'Due Soon'}
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
            {language === 'mr' ? 'मुदत संपली' : language === 'hi' ? 'अतिदेय' : 'Overdue'}
          </span>
        );
      default:
        return <span className="text-[10px] text-stone-500">{status}</span>;
    }
  };

  const handleStartCheckForAnimal = (animal: LivestockAnimal) => {
    setSelectedAnimal(animal);
    requireFarmerAccess(() => setActiveTab('check'));
  };

  return (
    <div className="pb-8 animate-fadeIn">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.navHome}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsAddVaccineOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-amber-300"
          >
            <Syringe className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'mr' ? '+ लस नोंदवा' : language === 'hi' ? '+ टीका लगाएं' : '+ Record Vaccine'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddAnimalOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-forest-800 text-white hover:bg-forest-900 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.btnAddAnimal}</span>
          </button>
        </div>
      </div>

      {/* Screen Title */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🐾</span>
          <h2 className="text-xl font-black text-stone-900 font-display">
            {t.myHerdTitle}
          </h2>
        </div>
        <p className="text-xs text-stone-600">
          {t.myHerdSubtitle}
        </p>
      </div>

      {/* Sub-Tabs: Animals (माझे पशुधन) | Vaccines (लसीकरण) | Health History (आरोग्य इतिहास) */}
      <div className="flex rounded-2xl bg-stone-200/80 p-1 mb-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('animals')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'animals' ? 'bg-white text-forest-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {language === 'mr' ? 'पशुधन सूची' : language === 'hi' ? 'पशु सूची' : 'My Herd'} ({herd.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('vaccines')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'vaccines' ? 'bg-white text-forest-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {language === 'mr' ? 'लसीकरण वेळापत्रक' : language === 'hi' ? 'टीकाकरण' : 'Vaccinations'} ({vaccinations.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'history' ? 'bg-white text-forest-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {language === 'mr' ? 'आरोग्य इतिहास' : language === 'hi' ? 'स्वास्थ्य इतिहास' : 'Health History'}
        </button>
      </div>

      {/* TAB 1: ANIMALS LIST */}
      {activeSubTab === 'animals' && (
        <div className="space-y-3">
          {/* Search & Species Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder={language === 'mr' ? 'नाव, टॅग किंवा जात शोधा...' : language === 'hi' ? 'नाम, टैग या नस्ल खोजें...' : 'Search by name, tag or breed...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>

            {/* Species chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { key: 'all', label: language === 'mr' ? 'सर्व' : language === 'hi' ? 'सभी' : 'All' },
                { key: 'cattle', label: '🐄 ' + (language === 'mr' ? 'गाय' : language === 'hi' ? 'गाय' : 'Cattle') },
                { key: 'buffalo', label: '🐃 ' + (language === 'mr' ? 'म्हैस' : language === 'hi' ? 'भैंस' : 'Buffalo') },
                { key: 'goat', label: '🐐 ' + (language === 'mr' ? 'शेळी' : language === 'hi' ? 'बकरी' : 'Goat') },
                { key: 'sheep', label: '🐑 ' + (language === 'mr' ? 'मेंढी' : language === 'hi' ? 'भेड़' : 'Sheep') },
                { key: 'poultry', label: '🐔 ' + (language === 'mr' ? 'कुक्कुट' : language === 'hi' ? 'मुर्गी' : 'Poultry') },
              ].map((spec) => (
                <button
                  key={spec.key}
                  type="button"
                  onClick={() => setSelectedSpeciesFilter(spec.key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSpeciesFilter === spec.key
                      ? 'bg-forest-800 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {spec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Herd Cards */}
          {filteredHerd.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white rounded-2xl border border-stone-200">
              <span className="text-3xl mb-2 block">🐮</span>
              <p className="text-xs font-bold text-stone-700 mb-1">{t.noAnimalsYet}</p>
              <button
                type="button"
                onClick={() => setIsAddAnimalOpen(true)}
                className="mt-2 text-xs font-bold text-forest-800 hover:underline cursor-pointer"
              >
                + {t.btnAddAnimal}
              </button>
            </div>
          ) : (
            filteredHerd.map((animal) => (
              <div
                key={animal.id}
                className="rounded-2xl bg-white border border-stone-200 p-3.5 shadow-sm hover:border-forest-600/40 transition-all text-left group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                      {getSpeciesEmoji(animal.species)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900 font-display">
                          {animal.name}
                        </h4>
                        {getHealthBadge(animal.healthStatus)}
                      </div>
                      <div className="text-xs text-stone-500 font-medium mt-0.5">
                        <span className="font-semibold text-stone-800">{animal.breed}</span> • {animal.ageYears}y {animal.ageMonths || 0}m • {animal.gender === 'female' ? (language === 'mr' ? 'मादी' : language === 'hi' ? 'मादा' : 'Female') : (language === 'mr' ? 'नर' : language === 'hi' ? 'नर' : 'Male')}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-mono font-bold">
                    {animal.tagNumber}
                  </span>
                </div>

                {/* Status & Action Strip */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-stone-500 truncate max-w-[200px]">
                    <span className="font-medium text-stone-400 mr-1">{language === 'mr' ? 'लस:' : language === 'hi' ? 'टीका:' : 'Vaccine:'}</span>
                    <span className="text-emerald-700 font-semibold">{animal.nextVaccinationDue ? `Due ${animal.nextVaccinationDue}` : 'Up to date'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingAnimal(animal)}
                      className="text-[11px] font-bold text-stone-600 hover:text-stone-900 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      {language === 'mr' ? 'तपशील' : language === 'hi' ? 'विवरण' : 'Details'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartCheckForAnimal(animal)}
                      className="flex items-center gap-1 text-[11px] font-bold text-white bg-forest-800 hover:bg-forest-900 px-2.5 py-1 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <span>🩺</span>
                      <span>{language === 'mr' ? 'आरोग्य तपासणी' : language === 'hi' ? 'स्वास्थ्य जांच' : 'Health Check'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: VACCINATIONS SCHEDULE */}
      {activeSubTab === 'vaccines' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              {t.vaccinationTitle}
            </h3>
            <span className="text-[11px] text-forest-800 font-bold">
              {vaccinations.filter((v) => v.status === 'completed').length}/{vaccinations.length} {language === 'mr' ? 'पूर्ण' : language === 'hi' ? 'पूर्ण' : 'Completed'}
            </span>
          </div>

          {vaccinations.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white rounded-2xl border border-stone-200">
              <Syringe className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-700 mb-1">{t.noVaccinesYet}</p>
              <button
                type="button"
                onClick={() => setIsAddVaccineOpen(true)}
                className="mt-2 text-xs font-bold text-forest-800 hover:underline cursor-pointer"
              >
                + {t.btnAddVaccine}
              </button>
            </div>
          ) : (
            vaccinations.map((vac) => (
              <div
                key={vac.id}
                className="rounded-2xl bg-white border border-stone-200 p-3.5 shadow-sm text-left hover:border-amber-400 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-stone-900 font-display">
                        {vac.vaccineName}
                      </h4>
                      {getVaccineStatusBadge(vac.status)}
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      {vac.animalName} • <span className="text-stone-700 font-semibold">{vac.diseaseTarget}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-50 p-1.5 rounded-lg border border-stone-200/50">
                    <span className="text-[10px] text-stone-400 block">{language === 'mr' ? 'लस दिनांक' : language === 'hi' ? 'टीकाकरण तिथि' : 'Administered'}</span>
                    <span className="font-semibold text-stone-800 text-[11px]">{vac.administeredDate}</span>
                  </div>

                  <div className="bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/60">
                    <span className="text-[10px] text-amber-800 font-medium block">{language === 'mr' ? 'पुढील डोस (बूस्टर)' : language === 'hi' ? 'अगली देय तिथि' : 'Booster Due Date'}</span>
                    <span className="font-bold text-amber-950 text-[11px]">{vac.nextDueDate}</span>
                  </div>
                </div>

                {vac.notes && (
                  <p className="text-[11px] text-stone-500 mt-2 bg-stone-50 p-1.5 rounded-lg">
                    💡 {vac.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: HEALTH HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <span>📋</span>
                <span>{language === 'mr' ? 'गौरी (गीर गाय) — स्तनदाह अहवाल' : language === 'hi' ? 'गौरी (गीर गाय) — थनैला केस' : 'Gauri (Gir Cow) — Mastitis Case'}</span>
              </span>
              <span className="text-[10px] text-stone-400">Today, 9:30 AM</span>
            </div>

            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              {language === 'mr'
                ? 'उजव्या कासेला सूज व दुधात रक्ताच्या गाठी. हळद-कोरफड लेप व निर्जंतुकीकरणाचा सल्ला देण्यात आला.'
                : language === 'hi'
                ? 'दाहिने थन में सूजन व दूध में छीछड़े। हल्दी-एलोवेरा लेप व गोठे की सफाई की सलाह दी गई।'
                : 'Swelling in right quarter and flakes in milk. Recommended turmeric-aloe fomentation and dry lime bedding.'}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                {language === 'mr' ? 'उपचाराधीन' : language === 'hi' ? 'उपचाराधीन' : 'Under Care'}
              </span>

              <button
                type="button"
                onClick={() => setActiveTab('diagnosis')}
                className="text-xs font-bold text-forest-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'mr' ? 'पूर्ण अहवाल पहा' : language === 'hi' ? 'पूरी रिपोर्ट देखें' : 'View Full Report'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isAddAnimalOpen && (
        <AddAnimalModal onClose={() => setIsAddAnimalOpen(false)} />
      )}

      {isAddVaccineOpen && (
        <AddVaccinationModal onClose={() => setIsAddVaccineOpen(false)} />
      )}

      {inspectingAnimal && (
        <AnimalDetailModal
          animal={inspectingAnimal}
          onClose={() => setInspectingAnimal(null)}
          onStartCheck={() => {
            handleStartCheckForAnimal(inspectingAnimal);
            setInspectingAnimal(null);
          }}
        />
      )}
    </div>
  );
};
