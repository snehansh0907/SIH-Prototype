import React from 'react';
import { Home, ClipboardList, Map as MapIcon, Bell, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { OperationalMetrics } from '../../services/veterinaryOfficerService';

export type OfficerTab = 'overview' | 'cases' | 'map' | 'alerts' | 'profile';

interface OfficerBottomNavProps {
  activeTab: OfficerTab;
  setActiveTab: (tab: OfficerTab) => void;
  metrics?: OperationalMetrics;
}

export const OfficerBottomNav: React.FC<OfficerBottomNavProps> = ({
  activeTab,
  setActiveTab,
  metrics,
}) => {
  const { language } = useLanguage();

  const navItems: { id: OfficerTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'overview',
      label: language === 'mr' ? 'मुख्य' : language === 'hi' ? 'होम' : 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'cases',
      label: language === 'mr' ? 'केसेस' : language === 'hi' ? 'मामले' : 'Cases',
      icon: <ClipboardList className="w-5 h-5" />,
      badge: metrics?.openCases,
    },
    {
      id: 'map',
      label: language === 'mr' ? 'नकाशा' : language === 'hi' ? 'नक्शा' : 'Map',
      icon: <MapIcon className="w-5 h-5" />,
    },
    {
      id: 'alerts',
      label: language === 'mr' ? 'सतर्कता' : language === 'hi' ? 'अलर्ट' : 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      badge: metrics?.activeOutbreaks,
    },
    {
      id: 'profile',
      label: language === 'mr' ? 'प्रोफाइल' : language === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
      icon: <UserCheck className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      aria-label="Veterinary Officer Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/94 backdrop-blur-xl border-t border-white/95 shadow-glass-elevated"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-md mx-auto px-2 h-[4.25rem] flex items-center justify-around min-w-0">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-2xl transition-all duration-200 ease-spring cursor-pointer select-none min-w-0 btn-tactile-subtle ${
                isActive ? 'text-[#183027] font-black' : 'text-[#596A61] hover:text-[#183027]'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ease-spring shrink-0 ${
                    isActive
                      ? 'bg-forest-100 text-[#174D35] shadow-xs scale-102 -translate-y-0.5'
                      : 'hover:bg-stone-100/70'
                  }`}
                >
                  {item.icon}
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-rose-600 text-white shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] mt-0.5 tracking-tight truncate max-w-[56px] text-center transition-colors duration-200 ${
                  isActive ? 'text-[#183027] font-black' : 'text-[#596A61] font-bold'
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
