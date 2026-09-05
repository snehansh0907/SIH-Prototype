import React from 'react';
import { Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message, subMessage }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="relative mb-5">
        {/* Animated rings */}
        <div className="w-16 h-16 rounded-full bg-forest-100 animate-ping absolute inset-0 opacity-70"></div>
        <div className="w-16 h-16 rounded-full bg-forest-800 flex items-center justify-center relative z-10 shadow-elevated text-white">
          <Sprout className="w-8 h-8 text-wheat-200 animate-bounce" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-forest-900 mb-1.5 font-display">
        {message || t.loading}
      </h3>
      <p className="text-sm text-stone-600 max-w-xs leading-relaxed">
        {subMessage || t.processingSub}
      </p>
    </div>
  );
};
