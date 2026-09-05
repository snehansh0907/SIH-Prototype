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
    <div className="bg-white/80 border border-stone-200/80 rounded-3xl p-8 text-center shadow-soft my-4">
      <div className="w-16 h-16 rounded-full bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-stone-800 mb-2 font-display">
        {title || t.emptyNearby}
      </h3>
      {description && (
        <p className="text-sm text-stone-600 mb-5 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-forest-800 text-white font-semibold text-sm hover:bg-forest-900 transition-all shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
