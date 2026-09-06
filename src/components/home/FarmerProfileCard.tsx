import React from 'react';
import { UserCheck, MapPin, Database, LogOut, ArrowRight, ShieldCheck, Sprout, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const FarmerProfileCard: React.FC = () => {
  const { language } = useLanguage();
  const { user, isFarmer, logout, openLoginModal } = useAuth();

  const isMarathi = language === 'mr';

  const farmerName = user
    ? (isMarathi ? (user.nameMr || user.name) : user.name)
    : (isMarathi ? 'अतिथी शेतकरी' : 'Guest Farmer');

  const farmLocation = user
    ? (isMarathi 
        ? (user.locationMr || `${user.village}, ${user.taluka}`)
        : `${user.village || user.location}, ${user.taluka || user.district}`)
    : (isMarathi ? 'महाराष्ट्र' : 'Maharashtra');

  const monitoredCrop = user
    ? (isMarathi ? (user.monitoredCropMr || user.monitoredCrop) : user.monitoredCrop)
    : (isMarathi ? 'टोमॅटो' : 'Tomato');

  const farmDisplayName = user
    ? `${user.farmName || (isMarathi ? 'माझे शेत' : 'My Farm')} (${user.areaAcres || '1'} ${isMarathi ? 'एकर' : 'Acres'})`
    : (isMarathi ? 'शेत (२ एकर)' : 'Farm (2 Acres)');

  const farmerIdDisplay = user?.farmerId || (user?.id ? user.id.slice(0, 8) : 'KSF-001');

  return (
    <div className="rounded-3xl bg-white/95 border-2 border-stone-200/90 p-4 shadow-card hover:border-forest-600/40 transition-all">
      {/* Top row: Status, Cloud Connection & Logout/Switch */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <span>
              {user?.userType === 'registered'
                ? (isMarathi ? 'स्थानिक प्रोफाइल सक्रिय' : 'Local Profile Active')
                : (isMarathi ? 'डेटाबेस जोडणी सक्रिय' : 'Supabase Live Sync')}
            </span>
          </div>

          <span className="text-[10px] font-semibold text-stone-500 hidden sm:inline">
            ID: {farmerIdDisplay}
          </span>
        </div>

        {/* Quick Auth Actions */}
        {isFarmer ? (
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-rose-600 active:scale-95 transition-all px-2.5 py-1 rounded-lg hover:bg-rose-50 border border-stone-200 hover:border-rose-200"
            title={isMarathi ? 'लॉगआउट करा' : 'Logout'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'लॉगआउट' : 'Logout'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="flex items-center gap-1 text-[10px] font-extrabold text-forest-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all px-2.5 py-1 rounded-full shadow-sm"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{isMarathi ? 'शेतकरी लॉगिन' : 'Farmer Login'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Avatar with status indicator */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-forest-700 to-forest-900 border-2 border-forest-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {user?.userType === 'registered' ? '🌾' : isFarmer ? '👨‍🌾' : '🚜'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Name, Role & Location */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-black text-stone-900 font-display leading-tight">
                {farmerName}
              </h3>
              {user?.userType === 'registered' ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-extrabold flex items-center gap-0.5">
                  <User className="w-3 h-3 text-emerald-700" />
                  <span>{isMarathi ? 'नोंदणीकृत शेतकरी' : 'Registered Farmer'}</span>
                </span>
              ) : isFarmer ? (
                <span className="px-1.5 py-0.5 rounded bg-forest-100 text-forest-900 text-[10px] font-extrabold flex items-center gap-0.5">
                  <UserCheck className="w-3 h-3 text-forest-700" />
                  <span>{isMarathi ? 'सत्यापित डेमो शेतकरी' : 'Verified Demo Farmer'}</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                  {isMarathi ? 'डेमो सत्र' : 'Demo Session'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-stone-600 font-medium mt-1">
              <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span>{farmLocation} • {farmDisplayName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Farm & Crop Cycle Micro-bar */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-stone-50 rounded-xl px-2.5 py-1.5 border border-stone-200/80 flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
          <div className="truncate">
            <div className="text-[9px] uppercase font-bold text-stone-500 leading-none">
              {isMarathi ? 'सक्रिय पीक' : 'Active Crop'}
            </div>
            <div className="font-extrabold text-stone-800 truncate mt-0.5">
              {monitoredCrop}
            </div>
          </div>
        </div>

        <div className="bg-stone-50 rounded-xl px-2.5 py-1.5 border border-stone-200/80 flex items-center gap-2">
          <Database className="w-4 h-4 text-forest-700 shrink-0" />
          <div className="truncate">
            <div className="text-[9px] uppercase font-bold text-stone-500 leading-none">
              {isMarathi ? 'तालुका केंद्र' : 'Taluka Hub'}
            </div>
            <div className="font-extrabold text-stone-800 truncate mt-0.5">
              {user?.taluka || 'Niphad'} ({user?.district || 'Nashik'} KVK)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
