import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message, subMessage }) => {
  const { t } = useLanguage();

  return (
    <div className="glass-card bg-white/85 border border-white/90 rounded-3xl flex flex-col items-center justify-center p-8 text-center min-h-[260px] shadow-glass my-4 animate-fadeIn">
      <div className="relative mb-4">
        {/* Calm ambient pulse ring */}
        <div className="w-16 h-16 rounded-3xl bg-forest-100/80 animate-pulse-subtle absolute inset-0"></div>
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-forest-800 to-forest-700 flex items-center justify-center relative z-10 shadow-md text-white border border-forest-600/40">
          <span className="text-2xl">🩺</span>
        </div>
      </div>
      <h3 className="text-base font-black text-forest-950 mb-1 font-display">
        {message || t.loading}
      </h3>
      <p className="text-xs text-stone-600 max-w-xs leading-relaxed font-medium">
        {subMessage || t.processingSub}
      </p>
    </div>
  );
};
