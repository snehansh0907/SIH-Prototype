import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction
}) => {
  const { t } = useLanguage();

  return (
    <div className="glass-card bg-white/85 border border-white/90 rounded-3xl p-8 text-center shadow-glass my-4 animate-fadeIn text-center">
      <div className="w-16 h-16 rounded-2xl bg-forest-100/90 border border-forest-200/80 text-forest-800 flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">
        <ShieldCheck className="w-8 h-8 text-forest-700" />
      </div>
      <h3 className="text-base font-black text-forest-950 mb-1.5 font-display">
        {title || t.emptyNearby}
      </h3>
      {description && (
        <p className="text-xs text-stone-600 mb-5 max-w-sm mx-auto leading-relaxed font-medium">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-700 text-white font-bold text-xs hover:from-forest-900 hover:to-forest-800 btn-tactile shadow-md cursor-pointer border border-forest-600/40"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
