import React from 'react';
import { Home, Camera, MapPin, MessageSquareText } from 'lucide-react';
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

    // Protect check, area, and expert tabs for Demo users
    requireFarmerAccess(() => setActiveTab(tabId));
  };

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; isAction?: boolean }[] = [
    {
      id: 'home',
      label: t.navHome,
      icon: <Home className="w-5 h-5" />,
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/80 shadow-float">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === 'check' && (activeTab === 'check' || activeTab === 'diagnosis'));

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                type="button"
                className="relative -top-4 flex flex-col items-center group focus:outline-none cursor-pointer"
                aria-label={item.label}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-elevated ${
                  isActive
                    ? 'bg-forest-800 ring-4 ring-forest-200 scale-105'
                    : 'bg-forest-700 hover:bg-forest-800 active:scale-95'
                }`}>
                  {item.icon}
                </div>
                <span className={`text-[11px] font-bold mt-1 tracking-tight transition-colors ${
                  isActive ? 'text-forest-800' : 'text-stone-600'
                }`}>
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
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive ? 'text-forest-800 font-bold' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${
                isActive ? 'bg-forest-50 text-forest-800' : ''
              }`}>
                {item.icon}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
