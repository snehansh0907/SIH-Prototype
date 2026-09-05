import React, { useState, useEffect } from 'react';
import { Sprout, Search, CloudRain, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ProcessingModal: React.FC = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: <Sprout className="w-5 h-5" />, label: t.step1 },
    { icon: <Search className="w-5 h-5" />, label: t.step2 },
    { icon: <CloudRain className="w-5 h-5" />, label: t.step3 },
    { icon: <Sparkles className="w-5 h-5" />, label: t.step4 },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 600);
    const timer2 = setTimeout(() => setCurrentStep(2), 1200);
    const timer3 = setTimeout(() => setCurrentStep(3), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FCFAF7] border border-amber-200/80 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl animate-scaleUp">
        {/* Animated Crop Leaf Icon */}
        <div className="relative mb-6 mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-full bg-forest-100 animate-ping absolute inset-0 opacity-40"></div>
          <div className="w-20 h-20 rounded-full bg-forest-800 flex items-center justify-center text-3xl shadow-elevated border-2 border-forest-600">
            🌱
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-forest-950 font-display mb-2">
          {t.processingTitle}
        </h3>
        <p className="text-xs text-stone-500 mb-6 max-w-xs mx-auto">
          {t.processingSub}
        </p>

        {/* Reassuring 4 Steps Progression */}
        <div className="space-y-3 text-left bg-white/90 rounded-2xl p-4 border border-stone-200/80 shadow-sm">
          {steps.map((step, index) => {
            const isDone = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isCurrent
                    ? 'text-forest-900 font-bold scale-[1.02]'
                    : isDone
                    ? 'text-emerald-700 opacity-90'
                    : 'text-stone-400 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : isCurrent
                      ? 'bg-forest-800 text-white animate-pulse'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                </div>

                <span className="text-xs tracking-tight flex-1">
                  {step.label}
                </span>

                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
