import React from 'react';
import { CropStatusHero } from './CropStatusHero';
import { QuickActionGrid } from './QuickActionGrid';
import { WeatherAlertCard } from './WeatherAlertCard';
import { FollowUpBanner } from './FollowUpBanner';

export const FarmerHomeScreen: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      {/* 1. Main Visual Focus: 🌱 My Crop Status */}
      <CropStatusHero />

      {/* 2. Large Easy-to-Tap Quick Actions */}
      <QuickActionGrid />

      {/* 3. Weather Conditions Linked Directly to Crop Health */}
      <WeatherAlertCard />

      {/* 4. Crop Recovery Follow-Up */}
      <FollowUpBanner />
    </div>
  );
};
