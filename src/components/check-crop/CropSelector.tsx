import React from 'react';
import { MOCK_CROPS } from '../../services/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const CropSelector: React.FC = () => {
  const { language, t } = useLanguage();
  const { selectedCropId, setSelectedCropId } = useCrop();

  return (
    <div className="mb-4">
      <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-600 mb-2 font-display">
        {t.selectCrop}
      </label>
      
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {MOCK_CROPS.map((crop) => {
          const isSelected = selectedCropId === crop.id;
          const name =
            language === 'mr'
              ? crop.nameMr
              : language === 'hi'
              ? (crop.nameHi || crop.name)
              : crop.name;

          return (
            <button
              key={crop.id}
              onClick={() => setSelectedCropId(crop.id)}
              type="button"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-forest-800 text-white border-forest-900 shadow-md ring-2 ring-forest-300'
                  : 'bg-white/90 text-stone-800 border-stone-200 hover:bg-forest-50'
              }`}
            >
              <span className="text-xl">{crop.icon}</span>
              <span className="text-xs font-bold whitespace-nowrap">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
