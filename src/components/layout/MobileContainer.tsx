import React from 'react';
import { AppHeader } from './AppHeader';
import { BottomNavigation } from './BottomNavigation';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#ECE6DA] flex flex-col items-center justify-start antialiased selection:bg-forest-200 relative overflow-x-hidden">
      {/* Ambient background glow orbs for evaluator view */}
      <div className="hidden lg:block fixed -top-32 -left-32 w-96 h-96 rounded-full bg-forest-400/15 blur-3xl pointer-events-none" />
      <div className="hidden lg:block fixed top-1/2 -right-32 w-96 h-96 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />
      <div className="hidden lg:block fixed -bottom-32 left-1/3 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      {/* Desktop Helper Banner */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl px-4 py-2 text-xs text-stone-600 bg-white/70 backdrop-blur-md border-b border-stone-300/50 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="font-bold text-forest-950 font-display">🐄 Pashu Sarthak (पशु सार्थक)</span>
          <span className="text-stone-400">•</span>
          <span className="font-semibold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded text-[10px]">
            Problem Statement SIH26128
          </span>
        </div>
        <div className="text-stone-500 font-medium">
          Liquid Glass Experience • 390px Optimized Viewport
        </div>
      </div>

      {/* Main Smartphone Shell */}
      <div className="w-full max-w-md min-h-screen bg-[#F7F6F0] shadow-2xl flex flex-col relative border-x border-stone-300/50 min-w-0">
        <AppHeader />
        
        {/* Unified Application Content Area with Calculated Bottom Nav & Safe Area Clearance */}
        <main 
          className="flex-1 w-full px-3.5 sm:px-4 pt-3.5 min-w-0"
          style={{ paddingBottom: 'calc(var(--bottom-nav-height, 4.25rem) + env(safe-area-inset-bottom, 0px) + 2.5rem)' }}
        >
          {children}
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
};

