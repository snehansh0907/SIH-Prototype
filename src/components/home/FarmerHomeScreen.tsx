import React from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { CropStatusHero } from './CropStatusHero';
import { QuickActionGrid } from './QuickActionGrid';
import { WeatherAlertCard } from './WeatherAlertCard';
import { FollowUpBanner } from './FollowUpBanner';
import { FarmerProfileCard } from './FarmerProfileCard';

export const FarmerHomeScreen: React.FC = () => {
  const { t } = useLanguage();
  const { setActiveTab } = useCrop();
  const { requireFarmerAccess } = useAuth();

  return (
    <div className="animate-fadeIn space-y-4">
      {/* Authenticated Farmer & Farm Cloud Status */}
      <FarmerProfileCard />

      {/* Primary Question & Top Hero Action */}
      <div className="rounded-3xl bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 text-white p-5 shadow-elevated relative overflow-hidden border-2 border-forest-600">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 flex items-center gap-1 font-display">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SIH26131 • Maharashtra Farmer AI</span>
          </span>
          <span className="text-[10px] font-bold bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full">
            1-Tap Scan
          </span>
        </div>

        <h2 className="text-2xl font-black font-display tracking-tight text-white mb-1">
          {t.howIsMyCrop}
        </h2>
        <p className="text-xs text-wheat-200/90 font-medium mb-4">
          {t.checkCropSubtitle}
        </p>

        {/* TOPMOST PRIMARY ACTION BUTTON */}
        <button
          onClick={() => requireFarmerAccess(() => setActiveTab('check'))}
          type="button"
          className="w-full py-4 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-forest-950 font-black text-base font-display transition-all duration-200 shadow-lg flex items-center justify-center gap-3 cursor-pointer border-2 border-amber-300"
        >
          <Camera className="w-6 h-6 text-forest-950 animate-pulse" />
          <span className="tracking-wide">{t.actionCheckCrop}</span>
        </button>
      </div>

      {/* 1. Main Visual Focus: 🌱 Monitored Crop Status & Warning */}
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
