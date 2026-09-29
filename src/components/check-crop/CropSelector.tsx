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
        <div className="mb-3">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5 font-display">
            {t.stepAnimalSelection || '1. Select Animal from My Herd'}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all shrink-0 active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-forest-950 border-amber-500 shadow-sm font-bold ring-2 ring-amber-300'
                      : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-base">
                    {animal.species === 'cattle' ? '🐄' : animal.species === 'buffalo' ? '🐃' : animal.species === 'goat' ? '🐐' : animal.species === 'sheep' ? '🐑' : '🐔'}
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight truncate max-w-[110px]">{animal.name}</div>
                    <div className="text-[10px] text-stone-500 font-medium">{animal.tagNumber}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Step 2: Species Selection */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5 font-display">
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
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all shrink-0 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-forest-800 text-white border-forest-900 shadow-md ring-2 ring-forest-300'
                    : 'bg-white/90 text-stone-800 border-stone-200 hover:bg-forest-50'
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
