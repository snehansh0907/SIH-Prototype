import React, { useState } from 'react';
import { X, ArrowRight, Syringe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import type { AnimalSpecies } from '../../types';

interface AddVaccinationModalProps {
  onClose: () => void;
  preselectedAnimalId?: string;
}

export const AddVaccinationModal: React.FC<AddVaccinationModalProps> = ({ onClose, preselectedAnimalId }) => {
  const { language, t } = useLanguage();
  const { herd, recordVaccination } = useCrop();

  const [selectedAnimalId, setSelectedAnimalId] = useState(preselectedAnimalId || (herd[0]?.id || ''));
  const [vaccineName, setVaccineName] = useState('FMD Vaccine (Raksha-Ovac)');
  const [diseaseTarget, setDiseaseTarget] = useState('Foot and Mouth Disease (खुरपका-मुंहपका)');
  const [adminDate, setAdminDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [batchNumber, setBatchNumber] = useState(`VAC-${Math.floor(100 + Math.random() * 900)}`);
  const [vetName, setVetName] = useState('Dr. A. Deshmukh (LDO Niphad)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAnimal = herd.find((a) => a.id === selectedAnimalId) || herd[0];

  const handleVaccineSelect = (name: string, target: string, monthsInterval: number = 6) => {
    setVaccineName(name);
    setDiseaseTarget(target);
    const d = new Date(adminDate);
    d.setMonth(d.getMonth() + monthsInterval);
    setNextDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    setIsSubmitting(true);
    await recordVaccination({
      animalId: selectedAnimal.id,
      animalName: `${selectedAnimal.name} (${selectedAnimal.tagNumber})`,
      species: selectedAnimal.species as AnimalSpecies,
      vaccineName,
      diseaseTarget,
      administeredDate: adminDate,
      nextDueDate,
      batchNumber,
      veterinarian: vetName,
      notes,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#F7F4EC] rounded-3xl border border-amber-600/60 shadow-2xl overflow-hidden relative animate-scaleUp max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-amber-950 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-display text-white">
              {t.btnAddVaccine}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto text-left">
          {/* Animal Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">
              {language === 'mr' ? 'जनावर निवडा' : language === 'hi' ? 'पशु चुनें' : 'Select Animal'}
            </label>
            <select
              value={selectedAnimalId}
              onChange={(e) => setSelectedAnimalId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            >
              {herd.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.tagNumber}) • {a.breed}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Common Vaccine Presets */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              {language === 'mr' ? 'प्रमुख शासकीय लसी (निवडा)' : language === 'hi' ? 'प्रमुख टीके' : 'Recommended Compulsory Vaccines'}
            </label>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <button
                type="button"
                onClick={() => handleVaccineSelect('FMD Vaccine (Raksha-Ovac)', 'Foot and Mouth Disease', 6)}
                className={`text-[10px] p-1.5 rounded-lg border text-left font-bold transition-colors cursor-pointer ${
                  vaccineName.includes('FMD') ? 'bg-amber-100 border-amber-500 text-amber-950' : 'bg-white border-stone-200'
                }`}
              >
                💉 FMD (खुरकूत) — 6 Mo
              </button>
              <button
                type="button"
                onClick={() => handleVaccineSelect('LSD Goat Pox Vaccine', 'Lumpy Skin Disease', 12)}
                className={`text-[10px] p-1.5 rounded-lg border text-left font-bold transition-colors cursor-pointer ${
                  vaccineName.includes('LSD') ? 'bg-amber-100 border-amber-500 text-amber-950' : 'bg-white border-stone-200'
                }`}
              >
                💉 LSD (लंपी) — 1 Yr
              </button>
              <button
                type="button"
                onClick={() => handleVaccineSelect('HS+BQ Combined Vaccine', 'Hemorrhagic Septicemia / BQ', 12)}
                className={`text-[10px] p-1.5 rounded-lg border text-left font-bold transition-colors cursor-pointer ${
                  vaccineName.includes('HS') ? 'bg-amber-100 border-amber-500 text-amber-950' : 'bg-white border-stone-200'
                }`}
              >
                💉 HS+BQ (गलघोंटू) — 1 Yr
              </button>
              <button
                type="button"
                onClick={() => handleVaccineSelect('Raksha PPR Vaccine', 'Peste des Petits Ruminants', 36)}
                className={`text-[10px] p-1.5 rounded-lg border text-left font-bold transition-colors cursor-pointer ${
                  vaccineName.includes('PPR') ? 'bg-amber-100 border-amber-500 text-amber-950' : 'bg-white border-stone-200'
                }`}
              >
                💉 PPR (बकरी प्लेग) — 3 Yr
              </button>
            </div>
            <input
              type="text"
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          {/* Target Disease */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              {t.diseaseTargetLabel}
            </label>
            <input
              type="text"
              value={diseaseTarget}
              onChange={(e) => setDiseaseTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          {/* Admin Date & Due Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t.adminDateLabel}
              </label>
              <input
                type="date"
                value={adminDate}
                onChange={(e) => setAdminDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-900 mb-1">
                {t.dueDateLabel}
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Batch & Vet */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t.batchNumLabel}
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t.vetNameLabel}
              </label>
              <input
                type="text"
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              {language === 'mr' ? 'लसीकरण नोंदी (पर्यायी)' : language === 'hi' ? 'टीकाकरण टिप्पणी' : 'Vaccination Notes (Optional)'}
            </label>
            <input
              type="text"
              placeholder="e.g. NADCP Government Drive, Booster in 6 months"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 mt-2"
          >
            <span>{isSubmitting ? t.loading : t.btnAddVaccine}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
