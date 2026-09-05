import React from 'react';
import { AppHeader } from './AppHeader';
import { BottomNavigation } from './BottomNavigation';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#ECE6DA] flex flex-col items-center justify-start antialiased selection:bg-forest-200">
      {/* Desktop Helper Banner */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl px-4 py-2 text-xs text-stone-600 bg-wheat-100/80 border-b border-wheat-200/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse"></span>
          <span className="font-semibold text-forest-900">🌾 Krishi Sarthak Prototype</span>
          <span>• Smart India Hackathon</span>
        </div>
        <div className="text-stone-500 font-medium">
          Mobile-First Farmer Experience (Optimized 390px Viewport)
        </div>
      </div>

      {/* Main Smartphone Shell for Evaluators */}
      <div className="w-full max-w-md min-h-screen bg-[#F7F4EC] shadow-2xl flex flex-col relative border-x border-stone-300/40">
        <AppHeader />
        
        {/* Scrollable content area with bottom nav padding */}
        <main className="flex-1 pb-24 px-4 pt-4 overflow-y-auto">
          {children}
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
};
