import React from 'react';
import { X, Syringe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import type { LivestockAnimal } from '../../types';

interface AnimalDetailModalProps {
  animal: LivestockAnimal;
  onClose: () => void;
  onStartCheck: () => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({ animal, onClose, onStartCheck }) => {
  const { language, t } = useLanguage();
  const { vaccinations } = useCrop();

  const animalVaccines = vaccinations.filter(
    (v) => v.animalId === animal.id || v.animalName.includes(animal.name)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#F7F4EC] rounded-3xl border border-stone-300 shadow-2xl overflow-hidden relative animate-scaleUp max-h-[90vh] flex flex-col text-left">
        {/* Header */}
        <div className="bg-forest-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">
              {animal.species === 'cattle' ? '🐄' : animal.species === 'buffalo' ? '🐃' : animal.species === 'goat' ? '🐐' : animal.species === 'sheep' ? '🐑' : '🐔'}
            </span>
            <div>
              <h3 className="text-base font-bold font-display text-white leading-tight">
                {animal.name}
              </h3>
              <p className="text-[11px] text-forest-200/90 font-mono">
                {animal.tagNumber} • {animal.breed}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-400 block">{t.ageYearsLabel}</span>
              <span className="font-bold text-stone-900">{animal.ageYears} yrs {animal.ageMonths || 0}m</span>
            </div>

            <div className="bg-white p-2 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-400 block">{t.genderLabel}</span>
              <span className="font-bold text-stone-900 capitalize">
                {animal.gender === 'female' ? (language === 'mr' ? 'मादी' : language === 'hi' ? 'मादा' : 'Female') : (language === 'mr' ? 'नर' : language === 'hi' ? 'नर' : 'Male')}
              </span>
            </div>

            <div className="bg-white p-2 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-400 block">{t.healthStatusLabel}</span>
              <span className="font-bold text-emerald-700 capitalize">
                {animal.healthStatus === 'healthy' ? (language === 'mr' ? 'निरोगी' : language === 'hi' ? 'स्वस्थ' : 'Healthy') : animal.healthStatus}
              </span>
            </div>
          </div>

          {/* Notes */}
          {animal.notes && (
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-stone-800">
              <span className="font-bold text-amber-950 block mb-0.5">💡 Notes:</span>
              <p>{animal.notes}</p>
            </div>
          )}

          {/* Vaccination History for this Animal */}
          <div>
            <h4 className="text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
              <Syringe className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.vaccinationTitle} ({animalVaccines.length})</span>
            </h4>

            {animalVaccines.length === 0 ? (
              <p className="text-[11px] text-stone-400 bg-white p-2.5 rounded-xl border border-stone-200">
                {language === 'mr' ? 'कोणत्याही लसीकरणाची नोंद नाही' : language === 'hi' ? 'कोई टीकाकरण रिकॉर्ड नहीं' : 'No vaccination record logged yet.'}
              </p>
            ) : (
              <div className="space-y-1.5">
                {animalVaccines.map((v) => (
                  <div key={v.id} className="p-2 rounded-xl bg-white border border-stone-200 text-[11px] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-900">{v.vaccineName}</div>
                      <div className="text-stone-500">{v.administeredDate} • Due: {v.nextDueDate}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action: Check My Animal */}
          <button
            type="button"
            onClick={onStartCheck}
            className="w-full py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-3"
          >
            <span>🩺</span>
            <span>{language === 'mr' ? 'या जनावराची आरोग्य तपासणी करा' : language === 'hi' ? 'इस पशु की स्वास्थ्य जांच करें' : 'Start Health Check For This Animal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
