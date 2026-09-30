import React from 'react';
import type { OperationalMetrics } from '../../services/veterinaryOfficerService';
import { useLanguage } from '../../context/LanguageContext';

interface OfficerSummaryCardsProps {
  metrics: OperationalMetrics;
  onSelectStatus: (statusKey: string) => void;
}

export const OfficerSummaryCards: React.FC<OfficerSummaryCardsProps> = ({
  metrics,
  onSelectStatus,
}) => {
  const { language } = useLanguage();

  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  const cards = [
    {
      key: 'new',
      label: isMarathi ? 'नवीन केसेस' : isHindi ? 'नए मामले' : 'Open Cases',
      subtext: isMarathi ? 'तपासणी बाकी' : isHindi ? 'जांच लंबित' : 'Pending triage',
      count: metrics.openCases,
      border: 'border-blue-200 hover:border-blue-400',
      textColor: 'text-blue-700',
      dotColor: 'bg-blue-500 animate-pulse',
      bgColor: 'bg-blue-50/50',
    },
    {
      key: 'under review',
      label: isMarathi ? 'तपासणी सुरू' : isHindi ? 'समीक्षाधीन' : 'Under Review',
      subtext: isMarathi ? 'क्लिनिकल तपासणी' : isHindi ? 'क्लिनिकल जांच' : 'Clinical inspection',
      count: metrics.underReview,
      border: 'border-amber-200 hover:border-amber-400',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
      bgColor: 'bg-amber-50/50',
    },
    {
      key: 'escalated',
      label: isMarathi ? 'लॅब रेफरल' : isHindi ? 'लैब रेफरल' : 'Escalated',
      subtext: isMarathi ? 'DDDL लॅब तपासणी' : isHindi ? 'DDDL लैब रेफरल' : 'DDDL Lab referrals',
      count: metrics.escalated,
      border: 'border-rose-200 hover:border-rose-400',
      textColor: 'text-rose-700',
      dotColor: 'bg-rose-500 animate-ping',
      bgColor: 'bg-rose-50/50',
    },
    {
      key: 'resolved',
      label: isMarathi ? 'निकाली काढलेले' : isHindi ? 'समाधान' : 'Resolved',
      subtext: isMarathi ? 'नियंत्रित व बंद' : isHindi ? 'नियंत्रित और बंद' : 'Contained & closed',
      count: metrics.resolved,
      border: 'border-emerald-200 hover:border-emerald-400',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50/50',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-stone-600 font-display">
          {isMarathi ? 'ऑपरेशनल सारांश' : isHindi ? 'ऑपरेशनल सारांश' : 'Operational Summary'}
        </h3>
        <span className="text-[10px] text-stone-500 font-semibold">
          {isMarathi ? 'थेट पाळत ठेवणे' : isHindi ? 'लाइव निगरानी' : 'Live Feed'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c) => (
          <div
            key={c.key}
            onClick={() => onSelectStatus(c.key)}
            className={`bg-white/95 p-3 rounded-2xl border ${c.border} shadow-glass-sm hover:shadow-glass-md transition-all cursor-pointer active:scale-98 group flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-black font-display tracking-wider ${c.textColor}`}>
                {c.label}
              </span>
              <span className={`w-2 h-2 rounded-full ${c.dotColor}`}></span>
            </div>
            <div className={`text-2xl font-black mt-1 text-stone-900 group-hover:${c.textColor} transition-colors font-display`}>
              {c.count}
            </div>
            <div className="text-[10px] text-stone-500 font-medium mt-0.5 truncate">
              {c.subtext}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
