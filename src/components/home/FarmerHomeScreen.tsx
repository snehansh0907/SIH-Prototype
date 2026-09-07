import React from 'react';
import { CropStatusHero } from './CropStatusHero';
import { QuickActionGrid } from './QuickActionGrid';
import { WeatherAlertCard } from './WeatherAlertCard';
import { FollowUpBanner } from './FollowUpBanner';
import { FarmerProfileCard } from './FarmerProfileCard';

export const FarmerHomeScreen: React.FC = () => {
  return (
    <div className="animate-fadeIn space-y-4 pb-2">
      {/* Authenticated Farmer & Farm Cloud Status */}
      <FarmerProfileCard />

      {/* 1. Main Visual Focus: Monitored Crop Status & Advisory */}
      <CropStatusHero />

      {/* 2. Primary Featured Action (Check My Crop) & Secondary Actions (Area, Audio, Expert) */}
      <QuickActionGrid />

      {/* 3. Weather Conditions Linked Directly to Crop Health */}
      <WeatherAlertCard />

      {/* 4. Crop Recovery Follow-Up */}
      <FollowUpBanner />
    </div>
  );
};
