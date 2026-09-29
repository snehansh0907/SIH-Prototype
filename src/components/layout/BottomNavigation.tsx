import React from 'react';
import { Home, Camera, MapPin, MessageSquareText, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import type { NavigationTab } from '../../context/CropContext';

export const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const { activeTab, setActiveTab } = useCrop();
  const { requireFarmerAccess } = useAuth();

  const handleNavClick = (tabId: NavigationTab) => {
    if (tabId === 'home') {
      setActiveTab('home');
      return;
    }

    // Protect check, herd, area, and expert tabs for Demo users
    requireFarmerAccess(() => setActiveTab(tabId));
  };

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; isAction?: boolean }[] = [
    {
      id: 'home',
      label: t.navHome,
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'herd',
      label: t.navHerd || 'My Herd',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      id: 'check',
      label: t.navCheck,
      icon: <Camera className="w-6 h-6 text-white" />,
      isAction: true,
    },
    {
      id: 'area',
      label: t.navArea,
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      id: 'expert',
      label: t.navExpert,
      icon: <MessageSquareText className="w-5 h-5" />,
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/94 backdrop-blur-xl border-t border-white/95 shadow-glass-elevated"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-md mx-auto px-2 h-[4.25rem] flex items-center justify-around min-w-0">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id ||
            (item.id === 'check' && (activeTab === 'check' || activeTab === 'diagnosis')) ||
            (item.id === 'herd' && (activeTab === 'herd' || activeTab === 'vaccination' || activeTab === 'history'));

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                type="button"
                className="relative -top-4 flex flex-col items-center group focus:outline-none cursor-pointer select-none shrink-0 btn-tactile-hero"
                aria-label={item.label}
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 ease-spring shadow-float-glow ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#174D35] to-[#176B45] ring-4 ring-amber-300/90 scale-105 shadow-amber-400/30'
                      : 'bg-gradient-to-tr from-[#174D35] to-[#176B45] hover:scale-105 shadow-forest-900/30'
                  }`}
                >
                  <Camera className="w-6 h-6 text-amber-300 transition-transform duration-200 shrink-0" />
                </div>
                <span
                  className={`text-[10px] font-extrabold mt-1 tracking-tight transition-colors duration-200 ${
                    isActive ? 'text-[#183027]' : 'text-[#596A61]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              type="button"
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-2xl transition-all duration-200 ease-spring cursor-pointer select-none min-w-0 btn-tactile-subtle ${
                isActive ? 'text-[#183027] font-black' : 'text-[#596A61] hover:text-[#183027]'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ease-spring shrink-0 ${
                  isActive
                    ? 'bg-forest-100 text-[#174D35] shadow-xs scale-102 -translate-y-0.5'
                    : 'hover:bg-stone-100/70'
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[9px] mt-0.5 tracking-tight font-bold truncate max-w-[56px] text-center transition-colors duration-200 ${
                  isActive ? 'text-[#183027] font-black' : 'text-[#596A61]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

