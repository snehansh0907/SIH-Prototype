import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import type { AnimalSpecies, AnimalGender, AnimalHealthStatus } from '../../types';

interface AddAnimalModalProps {
  onClose: () => void;
}

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({ onClose }) => {
  const { language, t } = useLanguage();
  const { addAnimalToHerd } = useCrop();
  const { user } = useAuth();

  const [tagNumber, setTagNumber] = useState(`MH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<AnimalSpecies>('cattle');
  const [breed, setBreed] = useState('Gir');
  const [ageYears, setAgeYears] = useState('3');
  const [gender, setGender] = useState<AnimalGender>('female');
  const [healthStatus, setHealthStatus] = useState<AnimalHealthStatus>('healthy');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    await addAnimalToHerd({
      ownerId: user?.id || user?.farmerId || 'demo-owner',
      tagNumber: tagNumber.trim(),
      name: name.trim(),
      species,
      breed: breed.trim(),
      ageYears: parseInt(ageYears) || 0,
      ageMonths: 0,
      gender,
      count: 1,
      healthStatus,
      notes: notes.trim(),
    });
    setIsSubmitting(false);
    onClose();
  };

  const getBreedSuggestions = () => {
    switch (species) {
      case 'cattle':
        return ['Gir', 'Sahiwal', 'Red Sindhi', 'Khillari', 'HF Cross'];
      case 'buffalo':
        return ['Murrah', 'Jaffarabadi', 'Surti', 'Pandharpuri', 'Mehsana'];
      case 'goat':
        return ['Osmanabadi', 'Sirohi', 'Barbari', 'Jamnapari', 'Beetal'];
      case 'sheep':
        return ['Deccani', 'Nellore', 'Marwari', 'Madras Red'];
      case 'poultry':
        return ['Kadaknath', 'Aseel', 'BV 300', 'Cobb 500', 'Desi'];
      default:
        return ['Local'];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md modal-backdrop-anim">
      <div className="w-full max-w-md bg-[#F7F6F0]/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl overflow-hidden relative modal-surface-anim max-h-[90vh] overflow-y-auto text-left">
        {/* Header */}
        <div className="bg-[#174D35] text-white p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐄</span>
            <h3 className="text-base font-black font-display tracking-tight text-white">
              {t.btnAddAnimal}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white btn-tactile-icon cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          {/* Species choice */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1.5 font-display">
              {t.speciesLabel}
            </label>
            <div className="grid grid-cols-3 xs:grid-cols-5 gap-1.5">
              {[
                { id: 'cattle', icon: '🐄', label: t.cattle },
                { id: 'buffalo', icon: '🐃', label: t.buffalo },
                { id: 'goat', icon: '🐐', label: t.goat },
                { id: 'sheep', icon: '🐑', label: t.sheep },
                { id: 'poultry', icon: '🐔', label: t.poultry },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSpecies(s.id as AnimalSpecies);
                    if (s.id === 'cattle') setBreed('Gir');
                    if (s.id === 'buffalo') setBreed('Murrah');
                    if (s.id === 'goat') setBreed('Osmanabadi');
                    if (s.id === 'sheep') setBreed('Deccani');
                    if (s.id === 'poultry') setBreed('Kadaknath');
                  }}
                  className={`p-2 rounded-2xl text-center border transition-all flex flex-col items-center gap-1 cursor-pointer btn-tactile-subtle shadow-xs min-w-0 ${
                    species === s.id
                      ? 'bg-gradient-to-tr from-[#174D35] to-[#176B45] text-white border-forest-900 font-extrabold shadow-sm'
                      : 'bg-white/80 text-stone-700 border-stone-200 hover:bg-stone-50 text-xs'
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-[10px] font-bold truncate max-w-full">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t.animalNameLabel} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gauri / Kapila"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t.tagNumberLabel}
              </label>
              <input
                type="text"
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 border border-stone-300 text-xs font-mono font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-xs"
              />
            </div>
          </div>

          {/* Breed selection */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              {t.breedLabel}
            </label>
            <div className="flex gap-1.5 flex-wrap mb-1.5">
              {getBreedSuggestions().map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBreed(b)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    breed === b
                      ? 'bg-amber-400 text-stone-950 font-black shadow-xs'
                      : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-xs"
            />
          </div>

          {/* Age, Gender & Status */}
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t.ageYearsLabel}
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-white/90 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-xs"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t.genderLabel}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as AnimalGender)}
                className="w-full px-2 py-2.5 rounded-2xl bg-white/90 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-xs"
              >
                <option value="female">{t.genderFemale}</option>
                <option value="male">{t.genderMale}</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t.healthStatusLabel}
              </label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value as AnimalHealthStatus)}
                className="w-full px-1.5 py-2.5 rounded-2xl bg-white/90 border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-xs"
              >
                <option value="healthy">{t.statusHealthy}</option>
                <option value="treatment">{t.statusTreatment}</option>
                <option value="monitoring">{t.statusMonitoring}</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              {language === 'mr' ? 'आरोग्य / आहाराच्या नोंदी (पर्यायी)' : language === 'hi' ? 'विशेष टिप्पणी / आहार' : 'Health Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              placeholder="e.g. High milk yield, pregnant 4 months..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-xs"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#174D35] to-[#176B45] hover:from-[#133f2b] hover:to-[#174D35] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-2"
          >
            <span>{isSubmitting ? t.loading : t.btnAddAnimal}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </form>
      </div>
    </div>
  );
};

