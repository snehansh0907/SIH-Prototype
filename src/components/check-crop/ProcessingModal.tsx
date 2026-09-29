import React, { useState, useEffect } from 'react';
import { Activity, Search, CloudRain, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const ProcessingModal: React.FC = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: <Activity className="w-5 h-5" />, label: t.step1 },
    { icon: <Search className="w-5 h-5" />, label: t.step2 },
    { icon: <CloudRain className="w-5 h-5" />, label: t.step3 },
    { icon: <Sparkles className="w-5 h-5" />, label: t.step4 },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 450);
    const timer2 = setTimeout(() => setCurrentStep(2), 900);
    const timer3 = setTimeout(() => setCurrentStep(3), 1350);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 modal-backdrop-anim">
      <div className="glass-card bg-white/90 border border-white/80 rounded-3xl p-6 w-full max-w-sm text-center shadow-glass-xl modal-surface-anim">
        {/* Animated Animal Icon with soft calm aura */}
        <div className="relative mb-5 mx-auto w-20 h-20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-forest-300/30 animate-pulse-subtle absolute inset-0"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-700 flex items-center justify-center text-3xl shadow-float-glow border border-forest-500/40 transition-transform duration-300">
            🐮
          </div>
        </div>

        <h3 className="text-lg font-extrabold text-forest-950 font-display mb-1.5">
          {t.processingTitle}
        </h3>
        <p className="text-xs text-stone-600 mb-5 max-w-xs mx-auto leading-relaxed">
          {t.processingSub}
        </p>

        {/* Reassuring 4 Steps Progression */}
        <div className="space-y-2.5 text-left bg-white/70 backdrop-blur-xs rounded-2xl p-4 border border-white/80 shadow-xs">
          {steps.map((step, index) => {
            const isDone = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isCurrent
                    ? 'text-forest-900 font-bold scale-[1.01]'
                    : isDone
                    ? 'text-emerald-700 opacity-90'
                    : 'text-stone-400 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-100/90 text-emerald-800'
                      : isCurrent
                      ? 'bg-forest-800 text-white shadow-sm ring-2 ring-forest-400/40 animate-pulse'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.icon}
                </div>

                <span className="text-xs tracking-tight flex-1 font-medium">
                  {step.label}
                </span>

                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
