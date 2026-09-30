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
    diagnosis.type === 'invalid' ||
    diagnosis.rejectionReason
  );

  return (
    <div className="space-y-3.5 w-full min-w-0 text-left">
      {/* 1. Identified Issue or Rejection State Banner */}
      <div className="motion-stagger-1">
        <DiagnosisHeader />
      </div>

      {/* 
        CRITICAL SAFETY GATE:
        If the image was rejected as invalid, non-crop, or low-quality:
        DO NOT RENDER any disease treatment, pesticide, IPM advisory, or risk cards.
      */}
      {!isInvalidOrRejected && (
        <>
          {/* 2. WHAT YOU SHOULD DO TODAY (Most prominent section) */}
          <div className="motion-stagger-2">
            <ActionTodayCard />
          </div>

          {/* 3. WHAT TO MONITOR */}
          <div className="motion-stagger-3">
            <MonitorCard />
          </div>

          {/* 4. WHAT MAY HAPPEN NEXT */}
          <div className="motion-stagger-4">
            <NextOutlookCard />
          </div>

          {/* 5. ACTION BUTTONS: Voice, Area Risk, Expert Help */}
          <div className="motion-stagger-5">
            <DiagnosisActions />
          </div>
        </>
      )}
    </div>
  );
};
