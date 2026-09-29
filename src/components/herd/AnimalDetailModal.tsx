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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#F7F6F0]/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl overflow-hidden relative modal-surface-anim max-h-[90vh] flex flex-col text-left">
        {/* Header */}
        <div className="bg-[#174D35] text-white p-4 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/12 border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              {animal.species === 'cattle' ? '🐄' : animal.species === 'buffalo' ? '🐃' : animal.species === 'goat' ? '🐐' : animal.species === 'sheep' ? '🐑' : '🐔'}
            </div>
            <div>
              <h3 className="text-base font-black font-display text-white leading-tight">
                {animal.name}
              </h3>
              <p className="text-[11px] text-sage-200 font-mono font-bold">
                {animal.tagNumber} • {animal.breed}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          {/* Quick Stats Grid (Floating Bubbles) */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white/90 p-2.5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[10px] text-stone-400 font-semibold block">{t.ageYearsLabel}</span>
              <span className="font-extrabold text-stone-900 text-xs mt-0.5 block">{animal.ageYears} yrs {animal.ageMonths || 0}m</span>
            </div>

            <div className="bg-white/90 p-2.5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[10px] text-stone-400 font-semibold block">{t.genderLabel}</span>
              <span className="font-extrabold text-stone-900 text-xs mt-0.5 capitalize block">
                {animal.gender === 'female' ? (language === 'mr' ? 'मादी' : language === 'hi' ? 'मादा' : 'Female') : (language === 'mr' ? 'नर' : language === 'hi' ? 'नर' : 'Male')}
              </span>
            </div>

            <div className="bg-white/90 p-2.5 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-[10px] text-stone-400 font-semibold block">{t.healthStatusLabel}</span>
              <span className="font-extrabold text-emerald-800 text-xs mt-0.5 capitalize block">
                {animal.healthStatus === 'healthy' ? (language === 'mr' ? 'निरोगी' : language === 'hi' ? 'स्वस्थ' : 'Healthy') : animal.healthStatus}
              </span>
            </div>
          </div>

          {/* Notes */}
          {animal.notes && (
            <div className="bg-amber-50/90 p-3 rounded-2xl border border-amber-200 text-xs text-stone-800 shadow-xs">
              <span className="font-bold text-amber-950 block mb-0.5">💡 Notes:</span>
              <p className="font-medium">{animal.notes}</p>
            </div>
          )}

          {/* Vaccination History for this Animal */}
          <div>
            <h4 className="text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5 font-display">
              <Syringe className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.vaccinationTitle} ({animalVaccines.length})</span>
            </h4>

            {animalVaccines.length === 0 ? (
              <p className="text-[11px] text-stone-500 bg-white/80 p-3 rounded-2xl border border-stone-200/80 font-medium">
                {language === 'mr' ? 'कोणत्याही लसीकरणाची नोंद नाही' : language === 'hi' ? 'कोई टीकाकरण रिकॉर्ड नहीं' : 'No vaccination record logged yet.'}
              </p>
            ) : (
              <div className="space-y-1.5">
                {animalVaccines.map((v) => (
                  <div key={v.id} className="p-2.5 rounded-2xl bg-white/90 border border-stone-200/80 text-[11px] flex items-center justify-between shadow-xs">
                    <div>
                      <div className="font-extrabold text-stone-900">{v.vaccineName}</div>
                      <div className="text-stone-500 font-medium">{v.administeredDate} • Due: <span className="text-amber-900 font-bold">{v.nextDueDate}</span></div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold">
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
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#174D35] to-[#176B45] hover:from-[#133f2b] hover:to-[#174D35] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-3"
          >
            <span className="text-base">🩺</span>
            <span>{language === 'mr' ? 'या जनावराची आरोग्य तपासणी करा' : language === 'hi' ? 'इस पशु की स्वास्थ्य जांच करें' : 'Start Health Check For This Animal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

