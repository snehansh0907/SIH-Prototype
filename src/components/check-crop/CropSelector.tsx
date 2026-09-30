import React from 'react';
import { MOCK_CROPS } from '../../services/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

interface CropSelectorProps {
  selectedAnimalId?: string;
  onSelectAnimal?: (animalId: string) => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({ selectedAnimalId, onSelectAnimal }) => {
  const { language, t } = useLanguage();
  const { selectedCropId, setSelectedCropId, herd, selectedAnimal, setSelectedAnimal } = useCrop();

  return (
    <div className="mb-4 text-left">
      {/* 1. Step 1: Select Animal from Herd */}
      {herd.length > 0 && (
        <div className="mb-3.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-forest-900/80 mb-1.5 font-display flex items-center justify-between">
            <span>{t.stepAnimalSelection || '1. Select Animal from My Herd'}</span>
            <span className="text-[10px] font-medium text-forest-700 bg-forest-100/70 px-2 py-0.5 rounded-full">{herd.length} {language === 'mr' ? 'प्राणी' : language === 'hi' ? 'पशु' : 'animals'}</span>
          </label>
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
            {herd.map((animal) => {
              const isSelected = (selectedAnimalId ? selectedAnimalId === animal.id : selectedAnimal?.id === animal.id);
              return (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => {
                    setSelectedAnimal(animal);
                    setSelectedCropId(animal.species);
                    if (onSelectAnimal) onSelectAnimal(animal.id);
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all duration-200 shrink-0 btn-tactile-subtle cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-forest-800 to-forest-700 text-white border-forest-600/50 shadow-md ring-2 ring-forest-400/50 scale-[1.02]'
                      : 'glass-card text-stone-800 border-white/80 hover:bg-white/90 shadow-xs'
                  }`}
                >
                  <span className="text-xl">
                    {animal.species === 'cattle' ? '🐄' : animal.species === 'buffalo' ? '🐃' : animal.species === 'goat' ? '🐐' : animal.species === 'sheep' ? '🐑' : '🐔'}
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-extrabold leading-tight truncate max-w-[110px]">{animal.name}</div>
                    <div className={`text-[10px] font-mono font-semibold ${isSelected ? 'text-forest-200' : 'text-stone-500'}`}>{animal.tagNumber}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Step 2: Species Selection */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-forest-900/80 mb-1.5 font-display">
          {t.stepSpeciesSelection || '2. Animal Species'}
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {MOCK_CROPS.map((crop) => {
            const isSelected = selectedCropId === crop.id;
            const name =
              language === 'mr'
                ? crop.nameMr
                : language === 'hi'
                ? crop.nameHi || crop.name
                : crop.name;

            return (
              <button
                key={crop.id}
                onClick={() => setSelectedCropId(crop.id)}
                type="button"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all shrink-0 btn-tactile-subtle cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-forest-800 to-forest-700 text-white border-forest-600/50 shadow-md ring-2 ring-forest-400/40'
                    : 'glass-card text-stone-800 border-white/70 hover:bg-white/90 shadow-xs'
                }`}
              >
                <span className="text-lg">{crop.icon}</span>
                <span className="text-xs font-bold whitespace-nowrap">{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
