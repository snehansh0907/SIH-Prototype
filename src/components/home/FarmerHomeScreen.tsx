import React from 'react';
import { CropStatusHero } from './CropStatusHero';
import { QuickActionGrid } from './QuickActionGrid';
import { WeatherAlertCard } from './WeatherAlertCard';
import { FollowUpBanner } from './FollowUpBanner';
import { FarmerProfileCard } from './FarmerProfileCard';

export const FarmerHomeScreen: React.FC = () => {
  return (
    <div className="space-y-4 pb-2">
      {/* Authenticated Farmer & Farm Cloud Status */}
      <div className="motion-stagger-1">
        <FarmerProfileCard />
      </div>

      {/* 1. Main Visual Focus: Monitored Animal Status & Advisory */}
      <div className="motion-stagger-2">
        <CropStatusHero />
      </div>

      {/* 2. Primary Featured Action (Check My Animal) & Secondary Actions */}
      <div className="motion-stagger-3">
        <QuickActionGrid />
      </div>

      {/* 3. Weather Conditions Linked Directly to Livestock Health */}
      <div className="motion-stagger-4">
        <WeatherAlertCard />
      </div>

      {/* 4. Livestock Health Recovery Follow-Up */}
      <div className="motion-stagger-5">
        <FollowUpBanner />
      </div>
    </div>
  );
};
