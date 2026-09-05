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
    sm: 'px-2.5 py-0.5 text-xs font-medium gap-1',
    md: 'px-3.5 py-1 text-sm font-semibold gap-1.5',
    lg: 'px-4 py-2 text-base font-bold gap-2',
  }[size];

  // Visual variants
  if (type === 'confidence') {
    switch (level) {
      case 'reliable':
        return (
          <span className={`inline-flex items-center rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300 shadow-sm ${sizeStyles} ${className}`}>
            <ShieldCheck className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
            <span>{t.confidenceReliable}</span>
          </span>
        );
      case 'monitor':
        return (
          <span className={`inline-flex items-center rounded-full bg-amber-100/90 text-amber-800 border border-amber-300 shadow-sm ${sizeStyles} ${className}`}>
            <AlertTriangle className="w-4 h-4 text-amber-700 stroke-[2.5]" />
            <span>{t.confidenceMonitor}</span>
          </span>
        );
      case 'review':
        return (
          <span className={`inline-flex items-center rounded-full bg-rose-100/90 text-rose-800 border border-rose-300 shadow-sm ${sizeStyles} ${className}`}>
            <AlertCircle className="w-4 h-4 text-rose-700 stroke-[2.5]" />
            <span>{t.confidenceReview}</span>
          </span>
        );
    }
  }

  // Severity / Risk Level
  switch (level) {
    case 'low':
      return (
        <span className={`inline-flex items-center rounded-full bg-forest-100 text-forest-800 border border-forest-300 shadow-sm ${sizeStyles} ${className}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-forest-600 animate-pulse-subtle"></span>
          <span>{type === 'severity' ? t.severityLow : t.statusSafe}</span>
        </span>
      );
    case 'moderate':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-sm ${sizeStyles} ${className}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse-subtle"></span>
          <span>{type === 'severity' ? t.severityModerate : t.statusAttention}</span>
        </span>
      );
    case 'high':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-sm ${sizeStyles} ${className}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
          <span>{type === 'severity' ? t.severityHigh : t.statusDanger}</span>
        </span>
      );
    default:
      return null;
  }
};
