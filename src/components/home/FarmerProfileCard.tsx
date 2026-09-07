import React from 'react';
import { UserCheck, MapPin, Database, LogOut, ArrowRight, ShieldCheck, Sprout, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const FarmerProfileCard: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, isFarmer, logout, openLoginModal } = useAuth();

  const farmerName = user
    ? (language === 'mr' ? (user.nameMr || user.name) : language === 'hi' ? (user.nameHi || user.name) : user.name)
    : t.guestFarmer;

  const farmLocation = user
    ? (language === 'mr' 
        ? (user.locationMr || `${user.village}, ${user.taluka} (${user.district})`)
        : language === 'hi'
        ? (user.locationHi || `${user.village}, ${user.taluka} (${user.district})`)
        : `${user.village || user.location}, ${user.taluka}${user.district ? ` (${user.district})` : ''}`)
    : (language === 'mr' ? 'महाराष्ट्र' : language === 'hi' ? 'महाराष्ट्र' : 'Maharashtra');

  const monitoredCrop = user
    ? (language === 'mr' ? (user.monitoredCropMr || user.monitoredCrop) : language === 'hi' ? (user.monitoredCropHi || user.monitoredCrop) : user.monitoredCrop)
    : (language === 'mr' ? 'टोमॅटो' : language === 'hi' ? 'टमाटर' : 'Tomato');

  const myFarm = language === 'mr' ? 'माझे शेत' : language === 'hi' ? 'मेरा खेत' : 'My Farm';
  const defaultFarm = language === 'mr' ? 'शेत (२ एकर)' : language === 'hi' ? 'खेत (2 एकड़)' : 'Farm (2 Acres)';

  const farmDisplayName = user
    ? `${user.farmName || myFarm} (${user.areaAcres || '1'} ${t.acresUnit})`
    : defaultFarm;

  const farmerIdDisplay = user?.farmerId || (user?.id ? user.id.slice(0, 8) : 'KSF-001');

  return (
    <div className="rounded-2xl bg-white border border-stone-200/70 p-3.5 shadow-sm hover:border-forest-600/30 transition-all">
      {/* Top row: Status, Cloud Connection & Auth Action */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span>
              {user?.userType === 'registered'
                ? t.localProfileActive
                : t.cloudSyncActive}
            </span>
          </div>

          <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
            ID: {farmerIdDisplay}
          </span>
        </div>

        {/* Quick Auth Actions */}
        {isFarmer ? (
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 text-[10px] font-semibold text-stone-500 hover:text-rose-600 active:scale-95 transition-all px-2 py-0.5 rounded-md hover:bg-rose-50 cursor-pointer"
            title={t.btnLogout}
          >
            <LogOut className="w-3 h-3" />
            <span>{t.btnLogout}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="flex items-center gap-1 text-[10px] font-bold text-forest-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all px-2.5 py-0.5 rounded-full shadow-sm cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{t.btnFarmerLogin}</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar with status indicator */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center text-lg shadow-sm">
              {user?.userType === 'registered' ? '🌾' : isFarmer ? '👨‍🌾' : '🚜'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          {/* Name, Role & Location */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-stone-900 font-display leading-tight">
                {farmerName}
              </h3>
              {user?.userType === 'registered' ? (
                <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 text-[9px] font-semibold flex items-center gap-0.5">
                  <User className="w-2.5 h-2.5 text-stone-500" />
                  <span>{t.registeredFarmerBadge}</span>
                </span>
              ) : isFarmer ? (
                <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 text-[9px] font-semibold flex items-center gap-0.5">
                  <UserCheck className="w-2.5 h-2.5 text-forest-700" />
                  <span>{t.verifiedDemoFarmerBadge}</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[9px] font-semibold">
                  {t.demoSessionBadge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mt-0.5">
              <MapPin className="w-3 h-3 text-forest-700 shrink-0" />
              <span className="truncate max-w-[250px]">{farmLocation} • {farmDisplayName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Farm & Crop Cycle Micro-bar */}
      <div className="mt-2.5 pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-50/80 border border-stone-200/50 truncate">
          <Sprout className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-stone-400 font-medium mr-1">{t.activeCropLabel}:</span>
            <span className="font-semibold text-stone-800 text-[11px]">{monitoredCrop}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-50/80 border border-stone-200/50 truncate">
          <Database className="w-3.5 h-3.5 text-forest-700 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-stone-400 font-medium mr-1">{t.talukaHubLabel}:</span>
            <span className="font-semibold text-stone-800 text-[11px]">
              {user?.taluka || (user?.isDemo ? 'Niphad' : user?.district || '')} {user?.district ? `(${user.district})` : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
