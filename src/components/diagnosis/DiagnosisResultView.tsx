import React from 'react';
import { useCrop } from '../../context/CropContext';
import { DiagnosisHeader } from './DiagnosisHeader';
import { ActionTodayCard } from './ActionTodayCard';
import { MonitorCard } from './MonitorCard';
import { NextOutlookCard } from './NextOutlookCard';
import { DiagnosisActions } from './DiagnosisActions';

export const DiagnosisResultView: React.FC = () => {
  const { diagnosis } = useCrop();

  const isInvalidOrRejected = Boolean(
    diagnosis.isRejected ||
    diagnosis.diagnosisAvailable === false ||
    (diagnosis.rejectionReason && diagnosis.rejectionReason !== 'LOW_CONFIDENCE')
  );

  return (
    <div className="pb-6 animate-fadeIn">
      {/* 1. Identified Issue or Rejection State Banner */}
      <DiagnosisHeader />

      {/* 
        CRITICAL SAFETY GATE:
        If the image was rejected as invalid, non-crop, or low-quality:
        DO NOT RENDER any disease treatment, pesticide, IPM advisory, or risk cards.
      */}
      {!isInvalidOrRejected && (
        <>
          {/* 2. WHAT YOU SHOULD DO TODAY (Most prominent section) */}
          <ActionTodayCard />

          {/* 3. WHAT TO MONITOR */}
          <MonitorCard />

          {/* 4. WHAT MAY HAPPEN NEXT */}
          <NextOutlookCard />

          {/* 5. ACTION BUTTONS: Voice, Area Risk, Expert Help */}
          <DiagnosisActions />
        </>
      )}
    </div>
  );
};
