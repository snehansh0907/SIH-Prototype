import React from 'react';
import { DiagnosisHeader } from './DiagnosisHeader';
import { ActionTodayCard } from './ActionTodayCard';
import { MonitorCard } from './MonitorCard';
import { NextOutlookCard } from './NextOutlookCard';
import { DiagnosisActions } from './DiagnosisActions';

export const DiagnosisResultView: React.FC = () => {
  return (
    <div className="pb-6 animate-fadeIn">
      {/* 1. Identified Issue, Severity, Confidence Label */}
      <DiagnosisHeader />

      {/* 2. WHAT YOU SHOULD DO TODAY (Most prominent section) */}
      <ActionTodayCard />

      {/* 3. WHAT TO MONITOR */}
      <MonitorCard />

      {/* 4. WHAT MAY HAPPEN NEXT */}
      <NextOutlookCard />

      {/* 5. ACTION BUTTONS: Voice, Area Risk, Expert Help */}
      <DiagnosisActions />
    </div>
  );
};
