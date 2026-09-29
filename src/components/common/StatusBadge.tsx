import React from 'react';
import type { SeverityLevel, ConfidenceLevel } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  level: SeverityLevel | ConfidenceLevel;
  type?: 'risk' | 'confidence' | 'severity';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  level,
  type = 'risk',
  size = 'md',
  className = ''
}) => {
  const { t } = useLanguage();

  // Size styles
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-[11px] font-bold gap-1 min-h-[26px]',
    md: 'px-3 py-1 text-xs font-extrabold gap-1.5 min-h-[30px]',
    lg: 'px-3.5 py-1.5 text-sm font-black gap-2 min-h-[36px]',
  }[size];

  // Visual variants
  if (type === 'confidence') {
    switch (level) {
      case 'reliable':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs max-w-full text-left leading-tight ${sizeStyles} ${className}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5] shrink-0" />
            <span className="min-w-0 flex-1 leading-snug">{t.confidenceReliable}</span>
          </span>
        );
      case 'monitor':
        return (
          <span className={`inline-flex items-center rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-xs max-w-full text-left leading-tight ${sizeStyles} ${className}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-800 stroke-[2.5] shrink-0" />
            <span className="min-w-0 flex-1 leading-snug">{t.confidenceMonitor}</span>
          </span>
        );
      case 'review':
        return (
          <span className={`inline-flex items-center rounded-full bg-rose-100 text-rose-950 border border-rose-300 shadow-xs max-w-full text-left leading-tight ${sizeStyles} ${className}`}>
            <AlertCircle className="w-3.5 h-3.5 text-rose-800 stroke-[2.5] shrink-0" />
            <span className="min-w-0 flex-1 leading-snug">{t.confidenceReview}</span>
          </span>
        );
    }
  }

  // Severity / Risk Level
  switch (level) {
    case 'low':
      return (
        <span className={`inline-flex items-center rounded-full bg-forest-100 text-forest-900 border border-forest-300 shadow-xs max-w-full text-left leading-tight ${sizeStyles} ${className}`}>
          <span className="w-2 h-2 rounded-full bg-forest-700 animate-pulse-subtle shrink-0"></span>
          <span className="min-w-0 flex-1 leading-snug">{type === 'severity' ? t.severityLow : t.statusSafe}</span>
        </span>
      );
    case 'moderate':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-xs max-w-full text-left leading-tight ${sizeStyles} ${className}`}>
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse-subtle shrink-0"></span>
          <span className="min-w-0 flex-1 leading-snug">{type === 'severity' ? t.severityModerate : t.statusAttention}</span>
        </span>
      );
    case 'high':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-100 text-rose-950 border border-rose-300 shadow-xs max-w-full text-left leading-tight ${sizeStyles} ${className}`}>
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse shrink-0"></span>
          <span className="min-w-0 flex-1 leading-snug">{type === 'severity' ? t.severityHigh : t.statusDanger}</span>
        </span>
      );
    default:
      return null;
  }
};
