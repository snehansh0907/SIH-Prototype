import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';

export const ActionTodayCard: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis } = useCrop();

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'biosecurity':
      case 'isolation':
        return {
          label: language === 'mr' ? 'विलगीकरण / जैविक सुरक्षा' : language === 'hi' ? 'पृथक्करण / जैव-सुरक्षा' : 'Isolation & Quarantine',
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: '🛑',
        };
      case 'first_aid':
      case 'antiseptic':
        return {
          label: language === 'mr' ? 'प्रथमोपचार व स्वच्छता' : language === 'hi' ? 'प्राथमिक उपचार' : 'First Aid & Antiseptic',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: '🩹',
        };
      case 'hygiene':
        return {
          label: language === 'mr' ? 'स्वच्छता व निर्जंतुकीकरण' : language === 'hi' ? 'सफाई व निसंक्रमण' : 'Sanitation & Disinfection',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: '🧼',
        };
      case 'nutrition':
      case 'supportive':
        return {
          label: language === 'mr' ? 'आहार व पाणी' : language === 'hi' ? 'आहार व इलेक्ट्रोलाइट' : 'Oral Fluids & Nutrition',
          bg: 'bg-sky-100 text-sky-900 border-sky-300',
          icon: '🥣',
        };
      case 'veterinary':
        return {
          label: language === 'mr' ? 'पशुवैद्यकीय उपचार (१९६२)' : language === 'hi' ? 'पशुचिकित्सा परामर्श (1962)' : 'Veterinary Care (1962)',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: '🩺',
        };
      default:
        return {
          label: language === 'mr' ? 'उपाययोजना' : language === 'hi' ? 'उपाय' : 'Action Step',
          bg: 'bg-stone-100 text-stone-800 border-stone-300',
          icon: '⚡',
        };
    }
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-forest-700/60 p-5 shadow-card mb-4 text-left">
      {/* Prominent Section Header */}
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-stone-200">
        <span className="w-8 h-8 rounded-xl bg-forest-800 text-amber-300 flex items-center justify-center text-base font-bold shadow-sm">
          🩺
        </span>
        <div>
          <h3 className="text-base font-black tracking-tight text-forest-950 font-display">
            {t.whatToDoToday || 'WHAT YOU SHOULD DO TODAY'}
          </h3>
          <p className="text-xs text-stone-600 font-medium">
            {language === 'mr' ? 'प्रथमोपचार, विलगीकरण व गोठा स्वच्छता पायऱ्या' : language === 'hi' ? 'प्राथमिक उपचार, अलग करना व पशुशाला स्वच्छता' : 'Immediate First Aid & Isolation Steps'}
          </p>
        </div>
      </div>

      {/* Action Steps */}
      <div className="space-y-3">
        {diagnosis.whatToDoToday.map((action) => {
          const title =
            language === 'mr'
              ? action.titleMr
              : language === 'hi'
              ? action.titleHi || action.title
              : action.title;
          const desc =
            language === 'mr'
              ? action.descriptionMr
              : language === 'hi'
              ? action.descriptionHi || action.description
              : action.description;
          const badge = getCategoryBadge(action.category);

          return (
            <div
              key={action.step}
              className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200/90 shadow-soft"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}>
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </span>
                <span className="text-[11px] font-bold text-stone-400">
                  Step {action.step}
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex-1">
                  <h4 className="text-sm font-black text-stone-900 leading-snug mb-1">
                    {title}
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
